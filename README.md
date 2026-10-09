# UIUC Eats

Free, walk-in food events at UIUC for the next 7 days, pulled automatically from
official campus calendars. Every listing shows the sentence from its own source
that says food is provided, plus a Proof link. Live at **https://uiucfood.vercel.app**.

## How it works

```
GitHub Actions (every 3 hours)
  └─ collector/ (Python) reads public .ics feeds
       ├─ calendars.illinois.edu master calendar 6991 + 5 gap calendars
       └─ one.illinois.edu school-wide student-org feed
     keeps the next 7 days → drops RSVP / registration / tickets / prices / members-only / virtual
     publishes only events whose text literally says food is provided
  └─ commits data/events.json
Vercel rebuilds the static Next.js site on every push
```

No database, no server, no AI. Nothing is written by a person; the quoted line
on each card comes from the event's own description (or the host's "Free Food" tag
on one.illinois.edu).

## Project layout

| Path | What |
|---|---|
| `collector/` | Python collector. `sources.py` feeds, `parse.py` .ics → events, `rules.py` evidence + exclusion rules, `details.py` sponsor lookup, `merge.py` dedupe / promoted / reports, `__main__.py` entry point |
| `collector/tests/` | pytest suite with fixture feeds |
| `data/events.json` | Published listings (committed by the bot) |
| `data/details-cache.json` | Cached sponsor names for calendars.illinois.edu events |
| `app/` | Routes: `/` serves the final merged version (`components/final/`), `/A` the playful emoji version, `/B` the neo-brutalist version. Swap the import in `app/page.tsx` to change which one the root shows. |
| `components/final/` | Final look: B's marquee and menu board with A's hero energy (`PageFinal`, `TopBar`, `ShareButton`, `HeroFinal`, `DayStripFinal`, `EventCardFinal`, `EventListFinal`). |
| `components/a/` | Version A, the playful emoji look (`PageA`, `Hero`, `Ticker`, `Banner`, `DayStrip`, `EventCard`, `EventList`). |
| `components/b/` | Version B, neo-brutalist retro fast food (`PageB`, `HeroB`, `DayStripB`, `EventCardB`, `EventListB`). |
| `components/FunLayer.tsx`, `lib/week.ts` | Shared easter eggs and the day-grouping hook both versions use. |
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

## Google Forms (optional, turns on two features)

**Advertise your event** → highlighted "Promoted by host" cards.
1. Create a Google Form with these short-answer questions, in any order:
   `Event name`, `Host organization`, `Date`, `Start time`, `End time`, `Location`,
   `What food`, `Dietary notes`, `Proof link` (URL to the event page or post).
2. Link it to a Google Sheet. In the Sheet: File → Share → Publish to web → choose the
   responses tab → **CSV** → copy the link.
3. GitHub repo → Settings → Secrets and variables → Actions → **Variables** → add
   `PROMOTED_CSV_URL` = that CSV link.
4. Vercel → Project → Settings → Environment Variables → add
   `NEXT_PUBLIC_ADVERTISE_FORM_URL` = the form's share link. Redeploy.

**Report a problem** → events with 2+ reports are hidden automatically.
1. Create a Google Form with two questions: `Event ID` (short answer), `What's wrong` (paragraph).
2. Get a pre-filled link (⋮ menu → Get pre-filled link), type `EVENT_ID` into the Event ID
   field, copy the link.
3. Publish the responses Sheet as CSV → GitHub variable `REPORTS_CSV_URL`.
4. Vercel env var `NEXT_PUBLIC_REPORT_FORM_URL` = the pre-filled link (keep `EVENT_ID` in it).

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
