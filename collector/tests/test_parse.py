from datetime import datetime
from pathlib import Path

from collector import parse

FIXTURES = Path(__file__).parent / "fixtures"
CAMPUS_FEED = {"key": "cal-7", "source": "calendars", "name": "General Events", "cal_id": 7}
ONE_FEED = {"key": "one", "source": "one", "name": "one.illinois.edu", "cal_id": None}


def _by_id(events):
  return {e["id"]: e for e in events}


def test_campus_feed_times_are_central_and_ids_come_from_uid():
  events = _by_id(parse.parse_feed((FIXTURES / "campus.ics").read_bytes(), CAMPUS_FEED))
  forum = events["cal-1001"]
  assert forum["start"] == datetime(2026, 10, 10, 12, 0, tzinfo=parse.CHICAGO)
  assert forum["start"].utcoffset().total_seconds() == -5 * 3600  # CDT
  assert forum["location"] == "University YMCA, 1001 S. Wright St."
  assert forum["tags"] == ["Lecture"]
  assert forum["url"].startswith("https://calendars.illinois.edu/detail/7/1001")


def test_all_day_and_zero_length_events_get_a_span():
  events = _by_id(parse.parse_feed((FIXTURES / "campus.ics").read_bytes(), CAMPUS_FEED))
  reviews = events["cal-1004"]
  assert reviews["all_day"] is True
  assert (reviews["end"] - reviews["start"]).days == 1
  wie = events["cal-1006"]
  assert (wie["end"] - wie["start"]).total_seconds() == 3600


def test_campusgroups_feed_converts_utc_and_decodes_summary():
  events = _by_id(parse.parse_feed((FIXTURES / "campusgroups.ics").read_bytes(), ONE_FEED))
  quench = events["one-492852"]
  assert quench["start"] == datetime(2026, 10, 12, 12, 0, tzinfo=parse.CHICAGO)
  assert quench["host"] == "Gender & Sexuality Resource Center"
  assert "Free Food" in quench["tags"]
  assert "GSRC" not in quench["tags"]
  boba = events["one-500001"]
  assert boba["title"] == "Incoming Exchange Boba Social 🧋"
  hidden = events["one-484581"]
  assert hidden["location"] == "Sign in to download the location"


def test_window_keeps_next_seven_days_only():
  now = datetime(2026, 10, 9, 12, 0, tzinfo=parse.CHICAGO)
  events = _by_id(parse.parse_feed((FIXTURES / "campus.ics").read_bytes(), CAMPUS_FEED))
  assert parse.in_window(events["cal-1001"], now)
  assert not parse.in_window(events["cal-1005"], now)  # already happened
