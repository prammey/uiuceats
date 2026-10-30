"""Decide whether a collector run's data/events.json is worth a commit (and a Vercel deploy).

The workflow runs hourly so a few skipped GitHub runs never leave the site stale. Publishing
every hour would mean 24 deploys a day for a timestamp, so a run publishes when the listings
changed, or when the published "Last checked" is about three hours old.

Exit 0: commit and push. Exit 1: skip.
Usage: python -m collector.publish_gate [path-to-new-events.json] [path-to-published-events.json]
"""
import json
import subprocess
import sys
from datetime import datetime, timedelta

REFRESH_EVERY = timedelta(hours=2, minutes=45)  # a little under 3h so an hourly run always lands in time


def should_publish(new, old, refresh_every=REFRESH_EVERY):
  if old is None:
    return True
  strip = lambda data: {k: v for k, v in data.items() if k != "generated_at"}
  if strip(new) != strip(old):
    return True
  age = datetime.fromisoformat(new["generated_at"]) - datetime.fromisoformat(old["generated_at"])
  return age >= refresh_every


def _published():
  try:
    out = subprocess.run(["git", "show", "HEAD:data/events.json"], capture_output=True, text=True, check=True).stdout
    return json.loads(out)
  except (subprocess.CalledProcessError, json.JSONDecodeError):
    return None


def main(argv=None):
  argv = sys.argv[1:] if argv is None else argv
  with open(argv[0] if argv else "data/events.json", encoding="utf-8") as fh:
    new = json.load(fh)
  if len(argv) > 1:
    with open(argv[1], encoding="utf-8") as fh:
      old = json.load(fh)
  else:
    old = _published()
  publish = should_publish(new, old)
  print("publish" if publish else "skip: listings unchanged and the last refresh is recent")
  return 0 if publish else 1


if __name__ == "__main__":
  sys.exit(main())
