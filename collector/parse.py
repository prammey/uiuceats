"""Turn raw .ics bytes into plain event dicts with America/Chicago times."""
import hashlib
import quopri
import re
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from icalendar import Calendar

CHICAGO = ZoneInfo("America/Chicago")
QP_HINT = re.compile(r"=[0-9A-F]{2}")


def _text(component, key):
  prop = component.get(key)
  if prop is None:
    return ""
  value = str(prop)
  params = getattr(prop, "params", None) or {}
  # one.illinois.edu marks SUMMARY as quoted-printable; only decode when it really is.
  if str(params.get("ENCODING", "")).upper() == "QUOTED-PRINTABLE" and QP_HINT.search(value):
    try:
      value = quopri.decodestring(value.encode("latin-1")).decode("utf-8")
    except (UnicodeDecodeError, ValueError):
      pass
  # The campus feed escapes double quotes, which the ics library leaves alone.
  return value.replace('\\"', '"').strip()


def _tags(component):
  """Collect CATEGORIES values. CampusGroups splits them into typed lines."""
  raw = component.get("CATEGORIES")
  if raw is None:
    return []
  items = raw if isinstance(raw, list) else [raw]
  tags = []
  for item in items:
    params = getattr(item, "params", None) or {}
    kind = str(params.get("X-CG-CATEGORY", "")).lower()
    if kind not in ("", "event_tags", "event_type"):
      continue
    cats = getattr(item, "cats", None)
    if cats is None:
      cats = str(item).split(",")
    tags.extend(str(c).strip() for c in cats if str(c).strip())
  return tags


def _to_chicago(value):
  """Return (aware datetime in Chicago, all_day)."""
  if isinstance(value, datetime):
    if value.tzinfo is None:
      # calendars.illinois.edu writes floating local times; they are Central.
      value = value.replace(tzinfo=CHICAGO)
    return value.astimezone(CHICAGO), False
  if isinstance(value, date):
    return datetime.combine(value, time.min, tzinfo=CHICAGO), True
  raise TypeError(f"unexpected date value {value!r}")


def make_id(source, uid, url):
  if source == "calendars":
    match = re.match(r"(\d+)@", uid)
    if match:
      return f"cal-{match.group(1)}"
  if source == "one":
    match = re.search(r"[?&]id=(\d+)", url)
    if match:
      return f"one-{match.group(1)}"
  digest = hashlib.sha1(uid.encode("utf-8")).hexdigest()[:10]
  return f"{source}-{digest}"


def _parse_event(component, feed):
  title = _text(component, "SUMMARY")
  if not title or component.get("DTSTART") is None:
    return None
  start, all_day = _to_chicago(component.decoded("DTSTART"))
  if component.get("DTEND") is not None:
    end, _ = _to_chicago(component.decoded("DTEND"))
  else:
    end = start
  if end <= start:
    # Zero-length events are common in the campus feed; give them a sensible span.
    end = start + (timedelta(days=1) if all_day else timedelta(hours=1))

  organizer = component.get("ORGANIZER")
  organizer_params = getattr(organizer, "params", None) or {}
  uid = _text(component, "UID")
  url = _text(component, "URL")
  return {
    "id": make_id(feed["source"], uid, url),
    "uid": uid,
    "source": feed["source"],
    "feed": feed["name"],
    "cal_id": feed.get("cal_id"),
    "title": title,
    "description": _text(component, "DESCRIPTION"),
    "start": start,
    "end": end,
    "all_day": all_day,
    "location": _text(component, "LOCATION"),
    "url": url,
    "host": str(organizer_params.get("CN", "")).strip(),
    "tags": _tags(component),
    "status": _text(component, "STATUS").upper(),
  }


def parse_feed(raw, feed):
  calendar = Calendar.from_ical(raw)
  events = []
  for component in calendar.walk("VEVENT"):
    event = _parse_event(component, feed)
    if event is not None:
      events.append(event)
  return events


def in_window(event, now, days=7):
  horizon = now + timedelta(days=days)
  return event["end"] >= now and event["start"] <= horizon
