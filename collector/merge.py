"""Dedupe events, merge host-submitted promotions, apply reports, shape the public JSON."""
import csv
import io
import logging
import re
from collections import Counter
from datetime import datetime, timedelta
from urllib.parse import quote

import requests

from .parse import CHICAGO, in_window
from .sources import TIMEOUT_SECONDS, USER_AGENT

log = logging.getLogger(__name__)

SOURCE_LABELS = {
  "calendars": "calendars.illinois.edu",
  "one": "one.illinois.edu",
  "promoted": "Submitted by the host",
}
UIUC_HINT = re.compile(r"illinois|urbana|champaign|\b618\d\d\b", re.I)
NON_WORD = re.compile(r"[^a-z0-9]+")
REPORT_THRESHOLD = 2
HIDDEN_PLACEHOLDER = re.compile(r"sign in to", re.I)


def maps_url(location):
  query = location if UIUC_HINT.search(location) else f"{location}, University of Illinois Urbana-Champaign"
  return "https://www.google.com/maps/search/?api=1&query=" + quote(query)


def _normalize_title(title):
  return NON_WORD.sub(" ", title.lower()).strip()


def _round_15(moment):
  return moment.replace(minute=(moment.minute // 15) * 15, second=0, microsecond=0)


def dedupe(events):
  """Drop repeats: first by stable id, then same title at the same quarter hour."""
  seen_ids = set()
  by_title = {}
  by_place = {}
  unique = []
  ordered = sorted(events, key=lambda e: (e["start"], e["source"] != "calendars"))
  for event in ordered:
    if event["id"] in seen_ids:
      continue
    seen_ids.add(event["id"])
    start = _round_15(event["start"])
    title_key = (_normalize_title(event["title"]), start)
    # Same room at the same quarter hour means the same event, but only for timed
    # events with a real location: all-day entries and hidden placeholders collide.
    location = event.get("location", "")
    place = _normalize_title(location)[:24]
    place_key = None
    if place and not event.get("all_day") and not HIDDEN_PLACEHOLDER.search(location):
      place_key = (place, start)
    twin = by_title.get(title_key) or (by_place.get(place_key) if place_key else None)
    if twin is not None:
      twin.setdefault("also_urls", []).append(event["url"])
      # A second listing of the same event may carry a note the kept one lacks
      # ("registration is required"), so its text still goes through the rules.
      twin["extra_text"] = f"{twin.get('extra_text', '')}\n{event.get('description', '')}".strip()
      continue
    by_title[title_key] = event
    if place_key:
      by_place[place_key] = event
    unique.append(event)
  return unique


# Shown in place of a room that one.illinois.edu keeps behind a sign-in.
HIDDEN_LOCATION_LABEL = "Room on one.illinois.edu (sign in with your NetID)"
WORD = re.compile(r"[a-z0-9]+")


def _same_place(a, b):
  """One normalized location is the start of the other ("Krannert Art Museum" vs "Krannert Art Museum, 500 E. Peabody")."""
  a, b = _normalize_title(a), _normalize_title(b)
  short, long_ = sorted((a, b), key=len)
  return len(short) >= 8 and long_.startswith(short)


def _similar_text(a, b, threshold=0.6):
  wa, wb = set(WORD.findall(a.lower())), set(WORD.findall(b.lower()))
  if not wa or not wb:
    return False
  return len(wa & wb) / len(wa | wb) >= threshold


def _titles_nest(a, b):
  a, b = _normalize_title(a), _normalize_title(b)
  short, long_ = sorted((a, b), key=len)
  return len(short) >= 15 and short in long_


def _mentions_start(event):
  """True when the event's own text names its start time, e.g. "12 PM" or "4:00pm" for a 4:00 start."""
  start = event["start"]
  hour12 = start.hour % 12 or 12
  meridiem = "a" if start.hour < 12 else "p"
  minute = rf"(?::{start.minute:02d})?" if start.minute == 0 else rf":{start.minute:02d}"
  patterns = [rf"\b{hour12}{minute}\s*(?:-|–|to)?\s*(?:\d{{1,2}}(?::\d{{2}})?\s*)?{meridiem}\.?m", rf"\b{hour12}{minute}\s*{meridiem}\.?m"]
  if start.hour == 12 and start.minute == 0:
    patterns.append(r"\bnoon\b")
  text = " ".join(str(event.get(k) or "") for k in ("title", "evidence", "description", "extra_text"))
  return any(re.search(p, text, re.I) for p in patterns)


def _are_twins(a, b):
  if a.get("all_day") or b.get("all_day") or a["start"].date() != b["start"].date():
    return False
  # Same start, near-identical titles: the same event posted on both feeds, even when one
  # of them hides the room ("GSRC's Quench Series (Lunch On US): ..." / "Quench: ...").
  if a["start"] == b["start"] and (_titles_nest(a["title"], b["title"]) or _similar_text(a["title"], b["title"], 0.5)):
    return True
  if a.get("location_hidden") or b.get("location_hidden") or not _same_place(a["location"], b["location"]):
    return False
  return _shared_evidence(a.get("evidence", ""), b.get("evidence", "")) or _titles_nest(a["title"], b["title"])


def _shared_evidence(a, b):
  """Mostly the same specific sentence. Short generic ones ("Refreshments will be served.") never count."""
  if min(len(WORD.findall(a)), len(WORD.findall(b))) < 8:
    return False
  return _similar_text(a, b, 0.5)


def _pick(first, second):
  """(winner, loser): a real room beats a hidden one, then a listing whose text confirms its time, then the earlier."""
  if bool(first.get("location_hidden")) != bool(second.get("location_hidden")):
    return (second, first) if first.get("location_hidden") else (first, second)
  if _mentions_start(second) and not _mentions_start(first):
    return second, first
  return first, second


def collapse_twins(events):
  """Merge published listings that describe the same occasion on the same day and in the same place.

  Twins share an evidence sentence (or nearly), or one title contains the other. When their
  times disagree, the one whose own text names its start time wins; otherwise the earlier one.
  """
  kept = []
  for event in sorted(events, key=lambda e: (e["start"], e["source"] != "calendars")):
    twin = next((other for other in kept if _are_twins(other, event)), None)
    if twin is None:
      kept.append(event)
      continue
    winner, loser = _pick(twin, event)
    winner.setdefault("also_urls", [])
    winner["also_urls"] += [loser["url"], *loser.get("also_urls", [])]
    if winner is event:
      kept[kept.index(twin)] = event
  return kept


# A sudden jump in cards means a rule got too loose, not that campus got generous.
MAX_GROWTH_FACTOR = 2
MAX_GROWTH_EXTRA = 10


def suspicious_growth(previous_count, new_count):
  """True when the new card count is more than double the last run's (and 10+ higher)."""
  if not previous_count:
    return False
  return new_count > max(previous_count * MAX_GROWTH_FACTOR, previous_count + MAX_GROWTH_EXTRA)


def fetch_csv(url):
  response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_SECONDS)
  response.raise_for_status()
  return list(csv.DictReader(io.StringIO(response.text)))


def _col(row, *needles):
  """Value of the first column whose header contains a needle; needles are tried in order."""
  for needle in needles:
    for header, value in row.items():
      if needle in (header or "").lower():
        return (value or "").strip()
  return ""


APPROVED_VALUES = {"yes", "y", "x", "true", "approved", "ok", "✓", "✔", "✅"}
LISTING_ID = re.compile(r"\b((?:cal|one|promo)-[0-9a-z][0-9a-z-]*)", re.I)
DATE_FORMATS = ("%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y")
TIME_FORMATS = ("%I:%M:%S %p", "%I:%M %p", "%H:%M:%S", "%H:%M")


def _parse_date(text):
  for fmt in DATE_FORMATS:
    try:
      return datetime.strptime(text, fmt).date()
    except ValueError:
      continue
  return None


def _parse_time(text):
  for fmt in TIME_FORMATS:
    try:
      return datetime.strptime(text, fmt).time()
    except ValueError:
      continue
  return None


def promoted_events(csv_url, now, rows=None):
  """Host-submitted events from the 'Advertise your event' Google Form sheet."""
  if rows is None:
    if not csv_url:
      return []
    try:
      rows = fetch_csv(csv_url)
    except requests.RequestException as exc:
      log.warning("promoted sheet unavailable: %s", exc)
      return []
  events = []
  for index, row in enumerate(rows, start=1):
    title = _col(row, "event name", "title", "name of")
    date = _parse_date(_col(row, "date"))
    start_time = _parse_time(_col(row, "start"))
    end_time = _parse_time(_col(row, "end time", "ends"))
    location = _col(row, "location", "where")
    proof = _col(row, "proof", "link", "url")
    if not (title and date and start_time and location and proof.startswith("http")):
      log.info("promoted row %d skipped: missing required fields", index)
      continue
    # Nothing a stranger types into the form goes live until someone marks it approved in the
    # sheet's "Approved" column (yes / y / x / true).
    if _col(row, "approved").lower() not in APPROVED_VALUES:
      log.info("promoted row %d waiting for approval", index)
      continue
    start = datetime.combine(date, start_time, tzinfo=CHICAGO)
    end = datetime.combine(date, end_time, tzinfo=CHICAGO) if end_time else start + timedelta(hours=2)
    if end <= start:
      end = start + timedelta(hours=2)
    food = _col(row, "food") or "Free food"
    event = {
      "id": f"promo-{index}-{_normalize_title(title).replace(' ', '-')[:30]}",
      "source": "promoted",
      "title": title,
      "host": _col(row, "host", "organization", "club") or "Submitted by host",
      "description": "",
      "start": start,
      "end": end,
      "all_day": False,
      "location": location,
      "url": proof,
      "evidence": "Submitted directly by the host through the UIUC Eats form",
      "food_text": food,
      "dietary": [d for d in ("vegetarian", "vegan", "halal", "kosher", "gluten-free") if d in _col(row, "diet").lower()],
      "icon": "✨",
      "status": "",
      "tags": [],
    }
    if in_window(event, now):
      events.append(event)
  return events


def reported_ids(csv_url, rows=None, threshold=REPORT_THRESHOLD):
  """Event ids that enough people flagged through the Report form."""
  if rows is None:
    if not csv_url:
      return set()
    try:
      rows = fetch_csv(csv_url)
    except requests.RequestException as exc:
      log.warning("reports sheet unavailable: %s", exc)
      return set()
  counts = Counter()
  for row in rows:
    event_id = _col(row, "event id")
    if not event_id:
      # The card's flag prefills "Which listing?" with "Title · Fri Oct 30 [cal-123]".
      match = LISTING_ID.search(_col(row, "which listing", "listing"))
      event_id = match.group(1).lower() if match else ""
    if event_id:
      counts[event_id] += 1
  return {event_id for event_id, count in counts.items() if count >= threshold}


def to_card(event):
  return {
    "id": event["id"],
    "title": event["title"],
    "host": event.get("host") or "",
    "start": event["start"].isoformat(),
    "end": event["end"].isoformat(),
    "all_day": event["all_day"],
    "location": event["location"],
    "location_hidden": bool(event.get("location_hidden")),
    "maps_url": "" if event.get("location_hidden") else maps_url(event["location"]),
    "food_text": event["food_text"],
    "evidence": event["evidence"],
    "icon": event["icon"],
    "dietary": event["dietary"],
    "proof_url": event["url"],
    "also_urls": event.get("also_urls", []),
    "source": event["source"],
    "source_label": SOURCE_LABELS.get(event["source"], event["source"]),
    "promoted": event["source"] == "promoted",
  }
