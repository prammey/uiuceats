"""Evidence-first rules: publish only when the source text literally says food is provided.

Every published card shows the matched sentence, so nothing can be invented.
Exclusions run first and win over evidence.
"""
import re

FOOD = (
  r"(?:food|foods|pizza|pizzas|lunch|dinner|breakfast|brunch|snacks?|refreshments|"
  r"boba|bubble tea|coffee|tea|donuts?|doughnuts?|bagels?|cookies|cupcakes|cake|"
  r"ice cream|tacos?|burritos?|sandwiches|meal|meals|bbq|barbecue|cookout|catering|"
  r"desserts?|treats|pastries|chai|samosas|dumplings|wings|hot ?dogs?|burgers?|"
  r"noodles|ramen|sushi|curry|biryani|popcorn|smoothies|fruit|hot chocolate|cider)"
)

EVIDENCE_PATTERNS = [
  re.compile(rf"\bfree\s+(?:\w+[\s-]+){{0,2}}?{FOOD}\b", re.I),
  re.compile(rf"\b(?:complimentary)\s+(?:\w+[\s-]+){{0,2}}?{FOOD}\b", re.I),
  re.compile(
    rf"\b{FOOD}\b[^.!?\n]{{0,60}}?\b(?:will be|are|is|to be|being)\s+"
    r"(?:served|provided|available|offered|included|catered)\b",
    re.I,
  ),
  re.compile(
    rf"\b(?:served|provided|providing|offering|serving)\b[^.!?\n]{{0,40}}?\b{FOOD}\b",
    re.I,
  ),
  re.compile(rf"\b{FOOD}\s+(?:provided|included|on us|is on us|available)\b", re.I),
  re.compile(rf"\b{FOOD}\b[^.!?\n]{{0,60}}?\b(?:at no cost|free of charge|no charge)\b", re.I),
  re.compile(
    r"\b(?:come hungry|grab a (?:free )?(?:slice|bite|snack)|"
    r"enjoy (?:free |some )?(?:food|pizza|snacks|refreshments|a meal)|"
    r"lunch on us|dinner on us|catered lunch|catered dinner|will be catered)\b",
    re.I,
  ),
]

FREE_FOOD_TAG = "free food"

# Each exclusion is (reason, pattern). Patterns are checked against title + description.
EXCLUSIONS = [
  ("cancelled", re.compile(r"\b(?:cancell?ed|postponed)\b", re.I)),
  ("rsvp", re.compile(
    r"\b(?:rsvp|pre-?regist\w*|registration|sign[- ]?ups?|tickets?|ticketed|"
    r"reserve (?:your|a) (?:spot|seat)|limited (?:spots|seats|capacity))\b|"
    r"\bregister\b(?! student)|\bregistered\b(?! student)",
    re.I,
  )),
  ("paid", re.compile(
    r"\$\s?(?!0\b)\d|\b\d+ dollars\b|\bcost:(?!\s*(?:free|no |\$?0\b))|\b(?:admission|entry) fee\b|"
    r"\bfor purchase\b|\bfor sale\b|\bpurchase (?:a |your )?(?:ticket|meal|plate)",
    re.I,
  )),
  ("closed", re.compile(
    r"\b(?:members[- ]only|invite[- ]only|invitation[- ]only|by invitation|closed event|"
    r"private event|staff only|faculty only|faculty and staff only|employees only|"
    r"for (?:our )?members\b|current members only)\b",
    re.I,
  )),
  ("bring_your_own", re.compile(
    r"\b(?:bring your own|byo[bf]?|brown[- ]bag|potluck|bring a dish|bring a snack)\b", re.I,
  )),
  ("off_topic", re.compile(
    r"\bfood (?:science|safety|allerg\w*|insecurity|scraps|waste|systems?|policy|studies|"
    r"justice|deserts?|access|bank|drive|pantry)\b|\blunch skate\b|\bfshn\b",
    re.I,
  )),
  ("virtual", re.compile(
    r"\b(?:via zoom|on zoom|zoom link|zoom meeting|virtual(?:ly)? (?:event|only|session|talk)|"
    r"online only|webinar|held online|held virtually)\b",
    re.I,
  )),
]

VIRTUAL_LOCATION = re.compile(r"\b(?:zoom|online|virtual|webinar|teams|remote)\b", re.I)
HIDDEN_LOCATION = re.compile(r"sign in to (?:download|see|view) the location", re.I)

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+|(?<=[.!?])(?=[A-Z\u201c\"])|\n+")

DIETARY = [
  ("vegetarian", re.compile(r"\bvegetarian\b", re.I)),
  ("vegan", re.compile(r"\bvegan\b", re.I)),
  ("halal", re.compile(r"\bhalal\b", re.I)),
  ("kosher", re.compile(r"\bkosher\b", re.I)),
  ("gluten-free", re.compile(r"\bgluten[- ]free\b", re.I)),
]

ICONS = [
  ("🍕", re.compile(r"\bpizza", re.I)),
  ("🧋", re.compile(r"\b(?:boba|bubble tea)\b", re.I)),
  ("🍩", re.compile(r"\b(?:donut|doughnut)", re.I)),
  ("🌮", re.compile(r"\b(?:taco|burrito)", re.I)),
  ("🍦", re.compile(r"\bice cream\b", re.I)),
  ("🍔", re.compile(r"\b(?:bbq|barbecue|cookout|burger|hot ?dog)", re.I)),
  ("🍣", re.compile(r"\b(?:sushi|ramen|noodle|dumpling)", re.I)),
  ("🍛", re.compile(r"\b(?:curry|biryani|samosa)", re.I)),
  ("🥞", re.compile(r"\b(?:breakfast|brunch|bagel|pastr)", re.I)),
  ("☕", re.compile(r"\b(?:coffee|chai|hot chocolate|cider)\b", re.I)),
  ("🍪", re.compile(r"\b(?:cookie|cupcake|cake|dessert|treat|snack)", re.I)),
  ("🥪", re.compile(r"\b(?:lunch|sandwich)", re.I)),
  ("🍽️", re.compile(r"\b(?:dinner|meal|catered|catering)\b", re.I)),
]
DEFAULT_ICON = "🍽️"

FOOD_WORD = re.compile(rf"\b{FOOD}\b", re.I)


def location_problem(location):
  if not location:
    return "no_location"
  if HIDDEN_LOCATION.search(location):
    return "hidden_location"
  if VIRTUAL_LOCATION.search(location):
    return "virtual"
  return None


def exclusion_reason(title, description, status=""):
  if status == "CANCELLED":
    return "cancelled"
  text = f"{title}\n{description}"
  for reason, pattern in EXCLUSIONS:
    if pattern.search(text):
      return reason
  return None


def _clean(sentence):
  sentence = re.sub(r"\s+", " ", sentence).strip()
  if len(sentence) > 220:
    sentence = sentence[:217].rstrip() + "..."
  return sentence


def find_evidence(title, description, tags=()):
  """Return the first sentence that literally says food is provided, else None."""
  for sentence in [title] + SENTENCE_SPLIT.split(description or ""):
    if not sentence.strip():
      continue
    for pattern in EVIDENCE_PATTERNS:
      if pattern.search(sentence):
        return _clean(sentence)
  if any(tag.strip().lower() == FREE_FOOD_TAG for tag in tags):
    return "Tagged \"Free Food\" by the host on one.illinois.edu"
  return None


def dietary_tags(text):
  return [name for name, pattern in DIETARY if pattern.search(text)]


def food_icon(text):
  for icon, pattern in ICONS:
    if pattern.search(text):
      return icon
  return DEFAULT_ICON


def food_text(evidence, text):
  """Short label for the card: the specific foods mentioned, else a generic line."""
  words = []
  for source in (evidence, text):
    for match in FOOD_WORD.finditer(source or ""):
      word = match.group(0).lower()
      if word in ("food", "foods", "meal", "meals", "catering") or word in words:
        continue
      words.append(word)
      if len(words) == 3:
        break
    if words:
      break
  if not words:
    return "Free food"
  return ", ".join(w.capitalize() for w in words)
