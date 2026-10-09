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
