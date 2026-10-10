from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from collector import rules


def test_evidence_matches_explicit_food_sentences():
  cases = [
    "Light refreshments will be provided.",
    "Pizza will be served at 5pm sharp.",
    "Dinner provided, open to all.",
    "Food and drinks will be served after the talk.",
    "Lunch is provided from the Y Thai Eatery at no cost.",
    "Come hungry!",
    "Enjoy food and great company.",
    "Free hot pizza while supplies last",
    "Complimentary coffee and bagels in the lobby.",
  ]
  for sentence in cases:
    assert rules.find_evidence("Some Event", sentence) == sentence, sentence


def test_evidence_returns_the_matching_sentence_only():
  description = "Welcome to our talk. Pizza will be served. Please arrive early."
  assert rules.find_evidence("Talk", description) == "Pizza will be served."


def test_title_alone_can_be_evidence():
  assert rules.find_evidence("Free Pizza Night", "") == "Free Pizza Night"


def test_no_evidence_for_vague_or_unrelated_text():
  for text in [
    "Lunch & Learn: Career Paths",
    "We will discuss the history of food in Illinois.",
    "Join us for a talk about the economy.",
    "Light reading will be provided.",
  ]:
    assert rules.find_evidence(text, "") is None, text
    assert rules.find_evidence("Event", text) is None, text


def test_free_food_tag_counts_as_evidence():
  assert rules.find_evidence("Social", "Come hang out.", ["Social", "Free Food"]) is not None
  assert rules.find_evidence("Social", "Come hang out.", ["Social"]) is None


def test_exclusions():
  assert rules.exclusion_reason("Talk", "Registration is required.") == "rsvp"
  assert rules.exclusion_reason("Talk", "Please RSVP here.") == "rsvp"
  assert rules.exclusion_reason("Talk", "Sign up at the link.") == "rsvp"
  assert rules.exclusion_reason("Talk", "Tickets $5 at the door.") in ("rsvp", "paid")
  assert rules.exclusion_reason("Talk", "Plates are $3 each.") == "paid"
  assert rules.exclusion_reason("Talk", "This event is members only.") == "closed"
  assert rules.exclusion_reason("Talk", "Bring your own lunch.") == "bring_your_own"
  assert rules.exclusion_reason("Talk", "A seminar on food insecurity.") == "off_topic"
  assert rules.exclusion_reason("Lunch Skate", "Skating at the ice arena.") == "off_topic"
  assert rules.exclusion_reason("Talk", "Join via Zoom link below.") == "virtual"
  assert rules.exclusion_reason("Talk", "This event has been cancelled.") == "cancelled"
  assert rules.exclusion_reason("Talk", "Fine.", status="CANCELLED") == "cancelled"


def test_registered_student_organization_is_not_an_rsvp():
  assert rules.exclusion_reason("Fair", "Meet every registered student organization.") is None
  assert rules.exclusion_reason("Fair", "Hosted by a Registered Student Organization.") is None


def test_location_problems():
  assert rules.location_problem("") == "no_location"
  assert rules.location_problem(" Sign in to download the location") == "hidden_location"
  assert rules.location_problem("Zoom") == "virtual"
  assert rules.location_problem("Illini Union Room 314") is None


def test_dietary_icon_and_food_text():
  text = "Pizza will be served. Vegetarian and halal options available."
  assert rules.dietary_tags(text) == ["vegetarian", "halal"]
  assert rules.food_icon(text) == "🍕"
  assert rules.food_icon("boba social") == "🧋"
  assert rules.food_icon("a lecture") == "🍱"
  assert rules.food_text("Pizza will be served.", text) == "Pizza"
  assert rules.food_text("Free food and giveaways", "Free food and giveaways") == "Free food"
  assert rules.food_text("Coffee, snacks, and donuts provided", "") == "Coffee, Snacks, Donuts"


def test_splitter_handles_missing_space_after_punctuation():
  text = "Pizza will be provided while supplies last!Wildlife ACT is a course for those who seek adventure."
  assert rules.find_evidence("Info Session", text) == "Pizza will be provided while supplies last!"


def test_zero_dollars_is_not_paid():
  assert rules.exclusion_reason("Talk", "Cost: $0 for students.") is None


def _at(hour, minute=0):
  return datetime(2026, 10, 10, hour, minute, tzinfo=ZoneInfo("America/Chicago"))


def test_food_window_narrows_to_the_stated_range():
  evidence = "Complimentary continental breakfast served between 9:15 - 9:45am; the simulation will start promptly at 10am."
  assert rules.food_window(evidence, _at(9, 15), _at(12)) == (_at(9, 15), _at(9, 45), False)
  assert rules.food_window("Lunch will be provided from 11:30am to 1pm.", _at(9), _at(17)) == (_at(11, 30), _at(13), False)
  assert rules.food_window("Free pizza from 6-7pm in the lobby.", _at(18), _at(20)) == (_at(18), _at(19), False)
  assert rules.food_window("Snacks served from noon to 1 p.m.", _at(0), _at(0) + timedelta(days=1), True) == (_at(12), _at(13), False)
  assert rules.food_window("Coffee and donuts 8 - 9 AM, talk follows.", _at(8), _at(11)) == (_at(8), _at(9), False)


def test_food_window_leaves_events_alone_without_a_fitting_range():
  assert rules.food_window("Pizza will be served at 5pm sharp.", _at(17), _at(19)) is None
  assert rules.food_window("Dinner is served from 7-8pm.", _at(13), _at(15)) is None
  assert rules.food_window("Refreshments for between 10 - 20 people.", _at(9), _at(12)) is None
  assert rules.food_window("Free food!", _at(9), _at(12)) is None



def test_evidence_catches_looser_food_phrasings():
  cases = [
    "A tour for people living with dementia, followed by refreshments and artmaking.",
    "The talk takes place in the Archives (with light refreshments).",
    "Come enjoy coffee, cookies, and good conversation with the CS community.",
    "Stay afterward for lunch and a chance to meet the speaker.",
    "Join members of the Beckman community for coffee and cookies in the atrium.",
  ]
  for sentence in cases:
    assert rules.find_evidence("Event", sentence) == sentence, sentence


def test_looser_phrasings_do_not_match_food_as_a_topic():
  for text in [
    "A seminar on packaging materials for food and medicine.",
    "Join us for a lunch talk on gendered silence at work.",
    "Come to the Lunch Skate at the Ice Arena.",
    "Participants with food allergies should contact the host.",
  ]:
    assert rules.find_evidence("Event", text) is None, text


def test_rsvp_only_for_the_zoom_link_is_not_an_exclusion():
  text = "Light refreshments provided for in-person attendees. Register for the Zoom link to attend remotely."
  assert rules.exclusion_reason("Lecture", text) is None
  assert rules.exclusion_reason("Lecture", "Pizza provided. Please register to attend.") == "rsvp"
  assert rules.exclusion_reason("Lecture", "Pizza provided. RSVP appreciated but not required.") is None
  assert rules.exclusion_reason("Lecture", "Pizza provided. Walk-ins welcome.") is None


def test_placeholder_titles_are_excluded():
  assert rules.exclusion_reason("TBD", "Stay afterward for lunch.") == "placeholder_title"
  assert rules.exclusion_reason("Title TBA", "Pizza provided.") is None


def test_audience_specific_and_check_in_events_are_excluded():
  assert rules.exclusion_reason("Memory Café", "A tour for people living with dementia, followed by refreshments.") == "closed"
  assert rules.exclusion_reason("Garden", "Join members of the Beckman community for coffee.") == "closed"
  assert rules.exclusion_reason("Symposium", "Arrive early to check in and enjoy a light breakfast.") == "rsvp"
  assert rules.exclusion_reason("Social", "Come enjoy coffee while connecting with members of the CS community.") is None


def test_audience_words_in_passing_do_not_close_an_event():
  assert rules.exclusion_reason("Open House", "Refreshments served. Learn about opportunities for employees to go greener.") is None
  assert rules.exclusion_reason("Open House", "Refreshments served. Open to faculty, staff, and students.") is None
  assert rules.exclusion_reason("Reception", "Refreshments served. This event is intended for alumni.") == "closed"
