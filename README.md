# UIUC Eats

Free, walk-in food events at UIUC for the next 7 days, pulled automatically from
official campus calendars. Every listing shows the sentence from its own source
that says food is provided, plus a Proof link. Live at **https://uiuceats.vercel.app**.

## How it works

```
GitHub Actions (hourly; publishes at least every ~3 hours)
  └─ collector/ (Python) reads public .ics feeds
       ├─ calendars.illinois.edu master calendar 6991 + 5 gap calendars
       └─ one.illinois.edu school-wide student-org feed
     keeps the next 7 days → drops RSVP / registration / tickets / prices / members-only / virtual
     publishes only events whose text literally says food is provided
     merges duplicate listings of the same occasion
  └─ commits data/events.json when listings change or the last refresh is ~3 hours old
Vercel rebuilds the static Next.js site on every push
```

one.illinois.edu hides most rooms behind a NetID sign-in ("Sign in to download the location").
Those events are kept, and the card links to the event page for the room. Every description in
that feed ends with an auto-added `one.illinois.edu/rsvp?id=…` link; links are stripped before the
rules run so that "rsvp" is not mistaken for an RSVP requirement.

No database, no server, no AI. Nothing is written by a person; the quoted line
on each card comes from the event's own description (or the host's "Free Food" tag
on one.illinois.edu).

## Project layout

| Path | What |
|---|---|
| `collector/` | Python collector. `sources.py` feeds, `parse.py` .ics → events, `rules.py` evidence + exclusion rules, `details.py` sponsor lookup, `merge.py` dedupe / duplicate merging / promoted / reports, `publish_gate.py` decides whether a run is worth a commit, `__main__.py` entry point |
| `collector/tests/` | pytest suite with fixture feeds |
| `data/events.json` | Published listings (committed by the bot) |
| `data/details-cache.json` | Cached sponsor names for calendars.illinois.edu events |
| `app/` | Routes: `/` serves the site (`components/final/`). |
| `components/final/` | Final look: B's marquee and menu board with A's hero energy (`PageFinal`, `TopBar`, `ShareButton`, `HeroFinal`, `DayStripFinal`, `EventCardFinal`, `EventListFinal`). |
| `components/FunLayer.tsx`, `lib/week.ts` | Easter eggs and the day-grouping hook the page uses. |
| `lib/floaters.ts`, `lib/analytics.ts` | Placement of the hero's background emojis; PostHog event helper. |
| `lib/events.ts` | Next.js 16 static site helpers (App Router, Tailwind v4). `Hero` (floating food, rotating line, share), `Ticker` (CSS marquee), `DayStrip` (7-day picker, today ringed), `EventCard` (emoji, meal-time stripe, proof, add-to-calendar), `EventList` (live section, Surprise me), `FunLayer` (Konami / pizza-click confetti, tab-title nudge). All motion respects `prefers-reduced-motion`. |
| `.github/workflows/collect.yml` | Scheduled collector run |

## Run locally

```bash
# collector
python3 -m venv collector/.venv
collector/.venv/bin/pip install -r collector/requirements.txt
collector/.venv/bin/python -m collector --dry-run     # print, don't write
collector/.venv/bin/python -m collector               # writes data/events.json
cd collector && .venv/bin/python -m pytest -q         # tests

# website
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
```

## Pinger (keeps the collector on its 3-hour schedule)

GitHub delays or skips `schedule:` runs on free repos, often by hours (Oct 2026: only half of the
3-hourly runs happened). The workflow now runs hourly and `collector/publish_gate.py` commits only
when listings change or the last refresh is ~3 hours old, so skipped runs no longer leave the site
stale. A free [cron-job.org](https://cron-job.org) job calling the dispatch API adds more runs on top;
the workflow's `concurrency` group queues any overlapping runs. Hourly runs use roughly 1,000 Actions
minutes a month, inside the free 2,000 for a private repo.

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** →
   Generate new token. Repository access: only `uiuceats`. Repository permissions:
   **Actions: Read and write**. Pick the longest expiration offered and note the date: when it
   expires the pinger fails silently and GitHub's own schedule takes over. Copy the token once.
   Never paste it into this repo.
2. cron-job.org → Create cronjob:
   - URL: `https://api.github.com/repos/prammey/uiuceats/actions/workflows/collect.yml/dispatches`
   - Schedule: custom, minutes `47`, hours `*/3` (offset from GitHub's own `17`)
   - Advanced → Request method **POST**, request body `{"ref":"main"}`, headers:
     `Accept: application/vnd.github+json`, `Authorization: Bearer <the token>`,
     `X-GitHub-Api-Version: 2022-11-28`
   - Success is HTTP 204 (empty response); cron-job.org counts any 2xx as success.
3. Press "Test run" on cron-job.org, then check GitHub → Actions for a new run marked
   `workflow_dispatch`.

## Google Forms (optional, turns on two features)

**Advertise your event** → highlighted "Promoted by host" cards.
1. Create a Google Form with these short-answer questions, in any order:
   `Event name`, `Host organization`, `Date`, `Start time`, `End time`, `Location`,
   `What food`, `Dietary notes`, `Proof link` (URL to the event page or post).
2. Link it to a Google Sheet. In the responses tab, add a column at the right titled **Approved**.
   A submission goes live only after you type `yes` in its Approved cell (check the proof link
   first). Then File → Share → Publish to web → choose the responses tab → **CSV** → copy the link.
3. GitHub repo → Settings → Secrets and variables → Actions → **Variables** → add
   `PROMOTED_CSV_URL` = that CSV link.
4. Vercel → Project → Settings → Environment Variables → add
   `NEXT_PUBLIC_ADVERTISE_FORM_URL` = the form's share link. Redeploy.

**Report a problem** → reports arrive by email and are handled by hand.
1. Create a Google Form with two questions: `Which listing?` (short answer), `What's wrong`
   (paragraph). Collect verified email addresses and turn on email notifications.
2. Vercel env var `NEXT_PUBLIC_REPORT_FORM_URL` = the form's share link. Redeploy. Each card's ⚑
   opens the form with "Which listing?" filled in ("Narcan Training · Thu Nov 5 [cal-33566100]")
   through a pre-filled link set in `components/final/PageFinal.tsx` (`REPORT_PREFILLED`). If you
   replace the form, update that link (form → ⋮ → Get pre-filled link, answer `EVENT_ID`), or set
   the Vercel variable to such a link.

The collector can still hide listings automatically from a reports sheet: publish it as CSV
and set the GitHub variable `REPORTS_CSV_URL`. A listing with 2+ reports (matched by the id in
brackets) is hidden. Leave it unset to keep reports manual.

## Analytics

PostHog, production only. Vercel env vars `NEXT_PUBLIC_POSTHOG_KEY` (the project's public
key) and `NEXT_PUBLIC_POSTHOG_HOST` (`/ingest`, which `vercel.json` forwards to PostHog so
ad blockers do not drop it). Clicks on links and buttons are captured automatically; the
named events (`find_food_clicked`, `day_picked`, `surprise_me`, `share_tapped`,
`hand_food_tapped`) are sent from `lib/analytics.ts`.

## Accuracy safeguards

Every collector run starts with the test suite, and `collector/tests/fixtures/verdicts.json`
holds real events checked by hand with the verdict each must keep (publish, or the reason it
is excluded). A rule change that flips one of them fails the run, and the site keeps its last
good data. The collector also refuses to publish when the card count more than doubles in one
run, since a jump like that means a rule got too loose. Add new hand-checked events to the
fixture whenever a rule changes.

## Adding the AI step later

`collector/__main__.py` decides what to publish right after `rules.find_evidence`. A
Claude call can slot in there to double-check evidence and extract richer food details;
the rules stay as the first filter so cost stays tiny. Needs an `ANTHROPIC_API_KEY`
repository secret.

## Accuracy rules (why listings are conservative)

- Walk-in only: any RSVP, registration, sign-up, ticket, or price language excludes the event.
- Evidence required: a sentence must literally say food is provided. Vague titles like
  "Lunch & Learn" are not enough.
- Hidden or virtual locations are skipped.
- Cancelled events disappear on the next run; the footer shows when feeds were last checked.
