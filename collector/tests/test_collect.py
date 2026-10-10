from datetime import datetime
from pathlib import Path

from collector import merge, parse
from collector.__main__ import collect

FIXTURES = Path(__file__).parent / "fixtures"
FEEDS = [
  {"key": "cal-6991", "source": "calendars", "name": "Master", "url": "campus.ics", "cal_id": 6991},
  {"key": "one", "source": "one", "name": "one.illinois.edu", "url": "campusgroups.ics", "cal_id": None},
]
NOW = datetime(2026, 10, 9, 12, 0, tzinfo=parse.CHICAGO)


def fake_fetch(url):
  return (FIXTURES / url).read_bytes()


def test_collect_publishes_only_evidence_backed_walk_in_events():
  published, counts, reasons = collect(NOW, fetch=fake_fetch, feed_list=FEEDS)
  ids = sorted(e["id"] for e in published)
  assert ids == ["cal-1001", "cal-1006", "cal-1007", "one-492852", "one-500001"]
  assert reasons["rsvp"] == 2        # symposium registration, ACS RSVP
  assert reasons["paid"] == 1        # taco fundraiser
  assert reasons["off_topic"] == 1   # FSHN food safety seminar
  assert reasons["bring_your_own"] == 1
  assert reasons["hidden_location"] == 1
  assert reasons["no_evidence"] == 1  # studio reviews
  assert counts["published"] == 5


def test_published_events_carry_card_fields():
  published, _, _ = collect(NOW, fetch=fake_fetch, feed_list=FEEDS)
  by_id = {e["id"]: e for e in published}
  wie = by_id["cal-1006"]
  assert wie["evidence"] == "Pizza will be served."
  assert wie["dietary"] == ["vegetarian"]
  assert wie["icon"] == "🍕"
  boba = by_id["one-500001"]
  assert boba["dietary"] == ["halal"]
  assert boba["icon"] == "🧋"
  quench = by_id["one-492852"]
  assert quench["evidence"] == "Quench Series (Lunch On US)"  # title itself is the evidence
  card = merge.to_card(wie)
  assert card["proof_url"].startswith("https://calendars.illinois.edu/detail/2568/1006")
  assert "google.com/maps" in card["maps_url"]
  assert card["promoted"] is False


def test_required_feed_failure_raises():
  def broken(url):
    if url == "campus.ics":
      raise OSError("network down")
    return fake_fetch(url)
  try:
    collect(NOW, fetch=broken, feed_list=FEEDS)
  except RuntimeError as exc:
    assert "cal-6991" in str(exc)
  else:
    raise AssertionError("expected RuntimeError when a required feed fails")


def test_dedupe_merges_same_title_same_time_across_sources():
  a = {"id": "cal-1", "source": "calendars", "title": "Pizza Night!", "start": NOW, "url": "u1", "location": "A"}
  b = {"id": "one-2", "source": "one", "title": "pizza night", "start": NOW, "url": "u2", "location": "B"}
  unique = merge.dedupe([b, a])
  assert [e["id"] for e in unique] == ["cal-1"]
  assert unique[0]["also_urls"] == ["u2"]


def test_promoted_and_reports_from_csv_rows():
  rows = [{
    "Timestamp": "10/9/2026 10:00:00",
    "Event name": "Diwali Dinner",
    "Host organization": "Hindu YUVA",
    "Date": "10/12/2026",
    "Start time": "6:00:00 PM",
    "End time": "8:00:00 PM",
    "Location": "Illini Union Ballroom",
    "What food": "Samosas, chai",
    "Dietary notes": "Vegetarian",
    "Proof link": "https://one.illinois.edu/rsvp?id=1",
  }, {
    "Timestamp": "x", "Event name": "Missing proof", "Date": "10/12/2026",
    "Start time": "6:00 PM", "Location": "Somewhere", "Proof link": "",
  }]
  promoted = merge.promoted_events("", NOW, rows=rows)
  assert len(promoted) == 1
  assert promoted[0]["host"] == "Hindu YUVA"
  assert promoted[0]["dietary"] == ["vegetarian"]
  assert promoted[0]["start"] == datetime(2026, 10, 12, 18, 0, tzinfo=parse.CHICAGO)
  reports = [{"Timestamp": "t", "Event ID": "cal-1"}, {"Timestamp": "t", "Event ID": "cal-1"}, {"Timestamp": "t", "Event ID": "cal-2"}]
  assert merge.reported_ids("", rows=reports) == {"cal-1"}


def test_dedupe_merges_same_place_same_time_with_different_titles():
  a = {"id": "cal-1", "source": "calendars", "title": "Breaking Chains", "start": NOW, "url": "u1",
       "location": "University YMCA, 1001 S. Wright St."}
  b = {"id": "cal-2", "source": "calendars", "title": "Friday Forum: Breaking Chains", "start": NOW, "url": "u2",
       "location": "University YMCA, 1001 S Wright St, Champaign"}
  unique = merge.dedupe([a, b])
  assert [e["id"] for e in unique] == ["cal-1"]
  assert unique[0]["also_urls"] == ["u2"]


def test_dedupe_leaves_all_day_and_hidden_location_events_alone():
  a = {"id": "cal-1", "source": "calendars", "title": "Exhibit A", "start": NOW, "url": "u1", "location": "Krannert Art Museum", "all_day": True}
  b = {"id": "cal-2", "source": "calendars", "title": "Exhibit B", "start": NOW, "url": "u2", "location": "Krannert Art Museum", "all_day": True}
  c = {"id": "one-3", "source": "one", "title": "Club X Social", "start": NOW, "url": "u3", "location": " Sign in to download the location"}
  d = {"id": "one-4", "source": "one", "title": "Club Y Meeting", "start": NOW, "url": "u4", "location": " Sign in to download the location"}
  assert len(merge.dedupe([a, b, c, d])) == 4


def test_optional_feed_failure_is_tolerated():
  def broken(url):
    if url == "campusgroups.ics":
      raise OSError("network down")
    return fake_fetch(url)
  published, counts, _ = collect(NOW, fetch=broken, feed_list=FEEDS)
  assert counts["published"] == 3  # the campus events still publish


def test_dedupe_keeps_the_twins_text_for_the_rules():
  tz = parse.CHICAGO
  kept = {"id": "cal-1", "source": "calendars", "title": "WIE Info Session", "start": datetime(2026, 10, 14, 17, tzinfo=tz),
          "url": "u1", "location": "2015 ECEB", "description": "Pizza will be served."}
  twin = {"id": "one-2", "source": "one", "title": "WIE Info Session", "start": datetime(2026, 10, 14, 17, tzinfo=tz),
          "url": "u2", "location": "Sign in to download the location", "description": "Registration is required."}
  unique = merge.dedupe([kept, twin])
  assert len(unique) == 1
  assert "Registration is required." in unique[0]["extra_text"]


def test_suspicious_growth_flags_a_doubling_but_not_normal_change():
  assert merge.suspicious_growth(19, 45)
  assert merge.suspicious_growth(5, 16)
  assert not merge.suspicious_growth(19, 30)
  assert not merge.suspicious_growth(5, 14)
  assert not merge.suspicious_growth(0, 40)  # first run ever
