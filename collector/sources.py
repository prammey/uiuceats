"""Feed definitions and polite HTTP fetching."""
import requests

USER_AGENT = "UIUCEats/0.1 (+https://uiucfood.vercel.app; campus free-food listing)"
TIMEOUT_SECONDS = 60

CAL_FEED = "https://calendars.illinois.edu/icalOutlook/{cal_id}.ics?hourOffset=0&timeZone=America%2FChicago"

# 6991 is the campus-wide master feed behind the Illinois app. The others hold
# events the master feed was verified to miss (research 2026-10-09).
CAMPUS_CALENDARS = {
  6991: "Illinois Mobile App Master Calendar",
  1249: "College of LAS Events",
  878: "College of Fine and Applied Arts",
  3094: "Asian American Studies",
  1381: "Chemistry Master Calendar",
  7421: "Mathematics Master Calendar",
}

# Public school-wide export of every student-org event on one.illinois.edu.
CAMPUSGROUPS_FEED = "https://one.illinois.edu/ical/urbanachampaign/ical_urbanachampaign.ics"

# Feeds the run cannot succeed without. If one of these fails we keep the
# previous events.json instead of publishing a half-empty site.
REQUIRED_FEEDS = {"cal-6991"}


def feeds():
  for cal_id, name in CAMPUS_CALENDARS.items():
    yield {
      "key": f"cal-{cal_id}",
      "source": "calendars",
      "name": name,
      "url": CAL_FEED.format(cal_id=cal_id),
      "cal_id": cal_id,
    }
  yield {
    "key": "one",
    "source": "one",
    "name": "one.illinois.edu student organizations",
    "url": CAMPUSGROUPS_FEED,
    "cal_id": None,
  }


def fetch(url):
  response = requests.get(
    url,
    headers={"User-Agent": USER_AGENT},
    timeout=TIMEOUT_SECONDS,
    allow_redirects=True,
  )
  response.raise_for_status()
  return response.content
