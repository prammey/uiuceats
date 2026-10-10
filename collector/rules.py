"""Evidence-first rules: publish only when the source text literally says food is provided.

Every published card shows the matched sentence, so nothing can be invented.
Exclusions run first and win over evidence.
"""
import re
from datetime import timedelta

FOOD = (
  r"(?:food|foods|pizza|pizzas|lunch|dinner|breakfast|brunch|snacks?|refreshments|"
  r"boba|bubble tea|coffee|tea|donuts?|doughnuts?|bagels?|cookies|cupcakes|cake|"
  r"ice cream|tacos?|burritos?|sandwiches|meal|meals|bbq|barbecue|cookout|catering|"
  r"desserts?|treats|pastries|chai|samosas|dumplings|wings|hot ?dogs?|burgers?|"
  r"noodles|ramen|sushi|curry|biryani|popcorn|smoothies|fruit|hot chocolate|cider)"
)

EVIDENCE_PATTERNS = [
  re.compile(rf"(?<![\w-])free\s+(?:\w+[\s-]+){{0,2}}?{FOOD}\b", re.I),
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

# Specific foods only (no bare "food"/"meal"), for the looser phrasings below, so a talk
# "on food policy" or a "lunch talk" never counts as evidence.
TREATS = (
  r"(?:refreshments|snacks?|pizza|coffee|lunch|dinner|breakfast|brunch|boba|bubble tea|"
  r"donuts?|doughnuts?|cookies|cupcakes|cake|ice cream|tacos?|burritos?|sandwiches|bagels?|"
  r"pastries|desserts?|treats|chai|samosas|dumplings|wings|hot ?dogs?|burgers?|popcorn|"
  r"smoothies|hot chocolate|cider)"
  r"(?!\s*(?:talk|series|seminar|time|hour|skate|meeting|lecture|break|bunch|club)\b)"
)
EVIDENCE_PATTERNS += [
  # "followed by refreshments", "with light refreshments", "(with pizza)"
  re.compile(rf"\b(?:followed by|with)\s+(?:light\s+|some\s+|free\s+|complimentary\s+|delicious\s+)?{TREATS}\b", re.I),
  # "enjoy coffee, cookies, and conversation"
  re.compile(rf"\benjoy\s+(?:\w+[\s,-]+){{0,3}}?{TREATS}\b", re.I),
  # "stay afterward for lunch"
  re.compile(rf"\bstay\s+(?:afterwards?|after|around|late)?\s*for\s+(?:\w+[\s,-]+){{0,2}}?{TREATS}\b", re.I),
  # "join members of the community for coffee and cookies"
  re.compile(rf"\b(?:join (?:us|them|members|the \w+ community)|come)\b[^.!?\n]{{0,50}}?\bfor\s+(?:\w+[\s,-]+){{0,3}}?{TREATS}\b", re.I),
]

FREE_FOOD_TAG = "free food"

# Each exclusion is (reason, pattern). Patterns are checked against title + description.
EXCLUSIONS = [
  ("cancelled", re.compile(r"\b(?:cancell?ed|postponed)\b", re.I)),
  ("rsvp", re.compile(
    r"\b(?:rsvp|pre-?regist\w*|registration|sign[- ]?ups?|tickets?|ticketed|"
    r"(?:to|please|must) check[- ]?in|check[- ]?in (?:at|begins|opens|starts|desk|table)|"
    r"reserve (?:your|a) (?:spot|seat)|limited (?:spots|seats|capacity))\b|"
    r"\bregister\b(?! student)|\bregistered\b(?! student)",
    re.I,
  )),
  ("paid", re.compile(
    r"\$\s?(?!0\b)\d|\b\d+ dollars\b|\bcost:(?!\s*(?:free|no |\$?0\b))|\b(?:admission|entry) fee\b|"
    r"\bfor purchase\b|\bfor sale\b|\bpurchase (?:a |your )?(?:ticket|meal|plate)|"
    r"\b(?:will be|are|is) sold\b|\bon sale\b|\bbake sale\b|\bfood sale\b|\bselling\b|"
    r"\bbuy (?:a |your |some )?(?:ticket|meal|plate|food|lunch|dinner|slice|snack)|"
    r"\bpay what you can\b|\bsuggested donation\b|\bdonations? (?:accepted|welcome|encouraged|appreciated|requested)\b|"
    r"\bper person\b|\bcover charge\b|\bticket prices?\b|\bprices? (?:start|range|vary)\b|"
    r"\bfundrais\w*|\braise (?:funds|money)\b|\bproceeds\b|"
    r"\bfood trucks?\b|\bconcessions?\b|\bfood vendors?\b|\bvendors? (?:will be )?(?:selling|on site)\b|"
    r"\bdining (?:hall|center)\b|\bmeal (?:swipes?|plan|credits?)\b|"
    r"\bbring (?:cash|money)\b|\bvenmo\b|\bzelle\b|\bcash ?app\b|\bcash only\b",
    re.I,
  )),
  ("closed", re.compile(
    r"\b(?:members[- ]only|invite[- ]only|invitation[- ]only|by invitation|closed event|"
    r"private event|staff only|faculty only|faculty and staff only|employees only|"
    r"for (?:our )?members\b|current members only|join (?:fellow )?members of|residents only|"
    r"for residents|(?:open|only|exclusively|intended|designed|reserved) (?:to|for) "
    r"(?:faculty|staff|employees|alumni|parents|seniors|older adults)(?![^.!?\n]{0,40}\bstudents\b)|"
    r"living with dementia|alzheimer|memory caf[eé]|care partners)\b",
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

# Registration that is only for watching remotely does not stop walk-ins; neither does an
# optional one. Sentences about the Zoom link are dropped before the RSVP check.
REMOTE_SENTENCE = re.compile(r"[^.!?\n]*\b(?:zoom|virtual(?:ly)?|livestream|remote(?:ly)?)\b[^.!?\n]*[.!?]?", re.I)
# A hybrid event still has food in the room, so a Zoom mention alone does not make it virtual.
IN_PERSON = re.compile(r"\b(?:in[- ]person|hybrid)\b", re.I)
RSVP_OPTIONAL = re.compile(
  r"\b(?:rsvps?|registration|sign[- ]?ups?)\b[^.!?\n]{0,30}?\b(?:encouraged|appreciated|optional|recommended|"
  r"not required|not necessary|not needed)\b|"
  r"\bno (?:rsvp|registration|sign[- ]?up) (?:is )?(?:required|needed|necessary)\b|"
  r"\bwalk-?ins? (?:are )?welcome\b|\bdrop[- ]ins? welcome\b|\bno need to (?:rsvp|register)\b",
  re.I,
)
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
  ("🍲", re.compile(r"\b(?:dinner|meal|catered|catering)\b", re.I)),
]
DEFAULT_ICON = "🍱"

FOOD_WORD = re.compile(rf"\b{FOOD}\b", re.I)


def location_problem(location):
  if not location:
    return "no_location"
  if HIDDEN_LOCATION.search(location):
    return "hidden_location"
  if VIRTUAL_LOCATION.search(location):
    return "virtual"
  return None


PLACEHOLDER_TITLE = re.compile(r"^\W*(?:tbd|tba|to be determined|to be announced|untitled)\W*$", re.I)


def exclusion_reason(title, description, status=""):
  if status == "CANCELLED":
    return "cancelled"
  if PLACEHOLDER_TITLE.match(title or ""):
    return "placeholder_title"
  text = f"{title}\n{description}"
  for reason, pattern in EXCLUSIONS:
    if reason == "rsvp":
      if RSVP_OPTIONAL.search(text) or not pattern.search(REMOTE_SENTENCE.sub(" ", text)):
        continue
      return reason
    if reason == "virtual" and IN_PERSON.search(text):
      continue
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


# ── Food time window ──────────────────────────────────────────────────────────
# When the evidence sentence names a time range ("served between 9:15 - 9:45am",
# "lunch from 11:30am to 1pm"), the card shows that window instead of the whole
# event. Only a range that fits inside the event's own times is trusted, so a
# stray number pair ("10 - 20 people") or another session's time is ignored.
_CLOCK = r"(?:(\d{1,2})(?::(\d{2}))?\s*(?:([ap])\.?m\b\.?)?|(noon|midday))"
_RANGE = re.compile(
  rf"\b(?:between\s+)?{_CLOCK}\s*(?:-|–|—|to|until|till|through|thru|and)\s*{_CLOCK}\b",
  re.I,
)
_SLACK = 15  # minutes of tolerance around the event's own start and end


def _clock(hour, minute, meridiem, word, fallback):
  """Minutes since midnight for one parsed time, or None when it can't be a time."""
  if word:
    return 12 * 60
  hour, minute = int(hour), int(minute or 0)
  if minute > 59:
    return None
  meridiem = (meridiem or fallback or "").lower()
  if meridiem:
    if not 1 <= hour <= 12:
      return None
    hour = hour % 12 + (12 if meridiem == "p" else 0)
  elif hour > 23:
    return None
  return hour * 60 + minute


def food_window(evidence, start, end, all_day=False):
  """(start, end, all_day) narrowed to the food time named in the evidence, else None."""
  if not evidence or start is None or end is None:
    return None
  day = start.replace(hour=0, minute=0, second=0, microsecond=0)
  lo = (start - day).total_seconds() / 60 - _SLACK
  hi = (end - day).total_seconds() / 60 + _SLACK
  for match in _RANGE.finditer(evidence):
    h1, m1, ap1, w1, h2, m2, ap2, w2 = match.groups()
    # A missing am/pm borrows the other side's; if neither says, try the usual readings.
    guesses = [(ap1, ap2)] if ap1 or ap2 else [("a", "a"), ("a", "p"), ("p", "p")]
    if ap1 and not ap2:
      guesses = [(ap1, ap1), (ap1, "p")]
    if ap2 and not ap1:
      guesses = [(ap2, ap2), ("a", ap2)]
    for fallback1, fallback2 in guesses:
      first = _clock(h1, m1, ap1, w1, fallback1)
      second = _clock(h2, m2, ap2, w2, fallback2)
      if first is None or second is None or first >= second:
        continue
      if first < lo or second > hi:
        continue
      return (day + timedelta(minutes=first), day + timedelta(minutes=second), False)
  return None


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
