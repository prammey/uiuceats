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
      continue
    by_title[title_key] = event
    if place_key:
      by_place[place_key] = event
    unique.append(event)
  return unique


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
      "evidence": "Submitted directly by the host through the FoodPlease form",
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
  counts = Counter(_col(row, "event id", "id") for row in rows)
  counts.pop("", None)
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
    "maps_url": maps_url(event["location"]),
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
