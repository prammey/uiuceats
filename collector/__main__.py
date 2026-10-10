"""Run the collector: python -m collector [--dry-run]

Pulls every feed, keeps the next 7 days, applies the exclusion and evidence
rules, fills in hosts, merges promoted events and reports, and writes
data/events.json. Exits non-zero (without touching events.json) if a required
feed could not be fetched.
"""
import argparse
import json
import logging
import os
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

from . import details, merge, parse, rules, sources

log = logging.getLogger("collector")

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
EVENTS_PATH = DATA_DIR / "events.json"
CACHE_PATH = DATA_DIR / "details-cache.json"


def collect(now, fetch=sources.fetch, feed_list=None):
  """Return (published events, counts, exclusion reasons)."""
  feed_list = list(sources.feeds()) if feed_list is None else feed_list
  counts = Counter()
  failed = set()
  gathered = []
  for feed in feed_list:
    try:
      raw = fetch(feed["url"])
      events = parse.parse_feed(raw, feed)
    except Exception as exc:  # network or malformed feed; report and keep going
      log.error("feed %s failed: %s", feed["key"], exc)
      failed.add(feed["key"])
      continue
    log.info("feed %s: %d events", feed["key"], len(events))
    counts["fetched"] += len(events)
    gathered.extend(events)

  missing = failed & sources.REQUIRED_FEEDS
  if missing:
    raise RuntimeError(f"required feeds failed: {sorted(missing)}")

  unique = merge.dedupe(gathered)
  counts["unique"] = len(unique)
  window = [e for e in unique if parse.in_window(e, now)]
  counts["in_window"] = len(window)

  reasons = Counter()
  published = []
  for event in window:
    text = f"{event['description']}\n{event.get('extra_text', '')}".strip()
    reason = rules.location_problem(event["location"]) or rules.exclusion_reason(
      event["title"], text, event["status"]
    )
    if reason:
      reasons[reason] += 1
      continue
    evidence = rules.find_evidence(event["title"], text, event["tags"])
    if not evidence:
      reasons["no_evidence"] += 1
      continue
    text = f"{event['title']}\n{text}"
    event["evidence"] = evidence
    # Show the food's own time when the source names one, not the whole event.
    window = rules.food_window(evidence, event["start"], event["end"], event["all_day"])
    if window:
      event["start"], event["end"], event["all_day"] = window
    event["dietary"] = rules.dietary_tags(text)
    event["icon"] = rules.food_icon(f"{evidence}\n{text}")
    event["food_text"] = rules.food_text(evidence, text)
    published.append(event)
  counts["published"] = len(published)
  return published, counts, reasons


def main(argv=None):
  parser = argparse.ArgumentParser(description="Collect free walk-in food events at UIUC.")
  parser.add_argument("--dry-run", action="store_true", help="print results, do not write files")
  args = parser.parse_args(argv)
  logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s", stream=sys.stderr)

  now = datetime.now(parse.CHICAGO)
  try:
    published, counts, reasons = collect(now)
  except RuntimeError as exc:
    log.error("%s; keeping previous events.json", exc)
    return 1

  if not args.dry_run:
    details.enrich_hosts(published, CACHE_PATH)
  promoted = merge.promoted_events(os.environ.get("PROMOTED_CSV_URL", ""), now)
  hidden = merge.reported_ids(os.environ.get("REPORTS_CSV_URL", ""))

  cards = [merge.to_card(e) for e in published + promoted if e["id"] not in hidden]
  cards.sort(key=lambda c: (c["start"], c["title"]))
  output = {
    "generated_at": now.isoformat(),
    "timezone": "America/Chicago",
    "window_days": 7,
    "count": len(cards),
    "events": cards,
  }

  log.info("counts: %s", dict(counts))
  log.info("excluded: %s", dict(reasons))
  log.info("promoted: %d, hidden by reports: %d, cards: %d", len(promoted), len(hidden), len(cards))
  if args.dry_run:
    for card in cards:
      print(f"{card['start'][:16]}  {card['icon']}  {card['title']}  @ {card['location']}")
      print(f"      says: {card['evidence']}")
    return 0

  previous = 0
  if EVENTS_PATH.exists():
    try:
      previous = int(json.loads(EVENTS_PATH.read_text(encoding="utf-8")).get("count", 0))
    except (ValueError, AttributeError):
      previous = 0
  if merge.suspicious_growth(previous, len(cards)):
    log.error("card count jumped from %d to %d; refusing to publish until someone checks the rules", previous, len(cards))
    return 1

  DATA_DIR.mkdir(parents=True, exist_ok=True)
  EVENTS_PATH.write_text(json.dumps(output, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
  log.info("wrote %s", EVENTS_PATH)
  return 0


if __name__ == "__main__":
  sys.exit(main())
