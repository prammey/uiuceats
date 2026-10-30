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
  # one-484581's room is behind a NetID sign-in; it is kept with a pointer to its page.
  assert ids == ["cal-1001", "cal-1006", "cal-1007", "one-484581", "one-492852", "one-500001"]
  assert reasons["rsvp"] == 2        # symposium registration, ACS RSVP
  assert reasons["paid"] == 1        # taco fundraiser
  assert reasons["off_topic"] == 1   # FSHN food safety seminar
  assert reasons["bring_your_own"] == 1
  assert reasons["hidden_location"] == 0
  assert reasons["no_evidence"] == 1  # studio reviews
  assert counts["published"] == 6


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
    "Approved": "yes",
  }, {
    "Timestamp": "10/9/2026 11:00:00", "Event name": "Not yet checked", "Date": "10/12/2026",
    "Start time": "6:00 PM", "Location": "Somewhere", "Proof link": "https://example.com/e",
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


def test_hidden_location_student_org_events_get_a_sign_in_pointer():
  published, _, _ = collect(NOW, fetch=fake_fetch, feed_list=FEEDS)
  welcome = {e["id"]: e for e in published}["one-484581"]
  card = merge.to_card(welcome)
  assert card["location"] == merge.HIDDEN_LOCATION_LABEL
  assert card["location_hidden"] is True
  assert card["maps_url"] == ""
  assert card["proof_url"] == "https://one.illinois.edu/rsvp?id=484581"


def _published(eid, title, start, location, evidence, description="", source="calendars"):
  return {"id": eid, "source": source, "title": title, "start": start, "end": start, "all_day": False,
          "location": location, "url": f"https://x/{eid}", "evidence": evidence, "description": description}


def test_collapse_twins_keeps_the_listing_whose_text_confirms_its_time():
  tz = parse.CHICAGO
  # Real pair from 2026-10-30: one entry says 8:30 am, the other's text says 12 PM.
  early = _published("cal-1", "Fighting Oligarchy and Fascism in the 21st Century", datetime(2026, 10, 30, 8, 30, tzinfo=tz),
                     "University YMCA, 1001 S. Wright St., Champaign", "Lunch is provided from the Y Thai Eatery at no cost.")
  noon = _published("cal-2", "Friday Forum & Conversation Café: Fighting Oligarchy and Fascism in the 21st Century",
                    datetime(2026, 10, 30, 12, 0, tzinfo=tz), "University YMCA, 1001 S Wright St, Champaign",
                    "Time: October 30 at 12 PMLocation: University YMCA FREE LUNCH PROVIDED")
  kept = merge.collapse_twins([early, noon])
  assert [e["id"] for e in kept] == ["cal-2"]
  assert kept[0]["also_urls"] == ["https://x/cal-1"]


def test_collapse_twins_merges_shared_evidence_and_keeps_unrelated_events():
  tz = parse.CHICAGO
  at5 = datetime(2026, 11, 5, 17, 0, tzinfo=tz)
  says = "Be among the first to experience the exhibition, enjoy live music, light refreshments, and remarks from curators."
  a = _published("cal-1", "Opening Reception | Ink Shower", at5, "Krannert Art Museum, 500 E. Peabody Dr., Champaign", says)
  b = _published("cal-2", "Opening Reception | Ink Shower: Contemporary Taiwanese Artists", at5, "Krannert Art Museum", says)
  c = _published("cal-3", "Chess Club Pizza Night", at5, "Krannert Art Museum", "Pizza will be served.")
  d = _published("cal-4", "Opening Reception | Ink Shower", datetime(2026, 11, 6, 17, 0, tzinfo=tz), "Krannert Art Museum", says)
  kept = merge.collapse_twins([a, b, c, d])
  assert sorted(e["id"] for e in kept) == ["cal-1", "cal-3", "cal-4"]  # d is another day


def test_reports_read_the_listing_id_from_the_prefilled_answer():
  col = "Which listing? Type N/A if this isn't a listing issue."
  rows = [{col: "Narcan Training · Thu Nov 5 [cal-33566100]"}, {col: "narcan training [CAL-33566100]"},
          {col: "N/A"}, {col: "Pizza thing [one-1]"}]
  assert merge.reported_ids("", rows=rows) == {"cal-33566100"}


def test_collapse_twins_prefers_the_feed_that_shows_the_room():
  tz = parse.CHICAGO
  noon = datetime(2026, 11, 2, 12, 0, tzinfo=tz)
  cal = _published("cal-9", "Quench: Living Authentically, Knowing Your Rights, Claiming Your Future", noon,
                   "GSRC, 616 E. Green Street, Suite 202", "Lunch on Us programming.")
  one = _published("one-492853", "GSRC's Quench Series (Lunch On US): Living Authentically, Knowing Your Rights, Claiming Your Future",
                   noon, merge.HIDDEN_LOCATION_LABEL, "GSRC's Quench Series (Lunch On US)", source="one")
  one["location_hidden"] = True
  kept = merge.collapse_twins([one, cal])
  assert [e["id"] for e in kept] == ["cal-9"]
  assert kept[0]["also_urls"] == ["https://x/one-492853"]


def test_collapse_twins_ignores_short_generic_evidence():
  tz = parse.CHICAGO
  a = _published("cal-1", "Algebra Seminar", datetime(2026, 11, 4, 11, tzinfo=tz), "Altgeld Hall 243", "Refreshments will be served.")
  b = _published("cal-2", "Topology Seminar", datetime(2026, 11, 4, 15, tzinfo=tz), "Altgeld Hall 243", "Light refreshments will be served.")
  assert len(merge.collapse_twins([a, b])) == 2


def test_publish_gate_publishes_changes_and_three_hourly_refreshes():
  from collector.publish_gate import should_publish
  old = {"generated_at": "2026-10-30T09:00:00-05:00", "count": 1, "events": [{"id": "cal-1"}]}
  same_soon = {**old, "generated_at": "2026-10-30T10:00:00-05:00"}
  same_later = {**old, "generated_at": "2026-10-30T11:50:00-05:00"}
  changed = {**old, "generated_at": "2026-10-30T09:30:00-05:00", "count": 2, "events": [{"id": "cal-1"}, {"id": "cal-2"}]}
  assert not should_publish(same_soon, old)
  assert should_publish(same_later, old)
  assert should_publish(changed, old)
  assert should_publish(old, None)
