"""Fill in the host for calendars.illinois.edu events from each event's detail page.

The .ics feed has no sponsor field. Results are cached in data/details-cache.json
so each event page is fetched once.
"""
import html
import json
import logging
import re
from pathlib import Path

import requests

from .sources import TIMEOUT_SECONDS, USER_AGENT

log = logging.getLogger(__name__)

SPONSOR = re.compile(r"<dt>\s*Sponsor\s*</dt>\s*<dd>(.*?)</dd>", re.I | re.S)
ORIGIN = re.compile(r"<dt>\s*Originating Calendar\s*</dt>\s*<dd>(.*?)</dd>", re.I | re.S)
TAG = re.compile(r"<[^>]+>")


def _strip(fragment):
  return re.sub(r"\s+", " ", html.unescape(TAG.sub("", fragment))).strip()


def lookup(url, session=None):
  http = session or requests
  response = http.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_SECONDS)
  response.raise_for_status()
  page = response.text
  sponsor = SPONSOR.search(page)
  origin = ORIGIN.search(page)
  return {
    "sponsor": _strip(sponsor.group(1)) if sponsor else "",
    "calendar": _strip(origin.group(1)) if origin else "",
  }


def load_cache(path):
  path = Path(path)
  if not path.exists():
    return {}
  try:
    return json.loads(path.read_text(encoding="utf-8"))
  except json.JSONDecodeError:
    log.warning("details cache unreadable, starting fresh")
    return {}


def save_cache(path, cache):
  path = Path(path)
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(json.dumps(cache, indent=1, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")


def enrich_hosts(events, cache_path, lookup_fn=lookup):
  cache = load_cache(cache_path)
  fresh = {}
  session = requests.Session()
  for event in events:
    if event["source"] != "calendars":
      continue
    info = cache.get(event["id"])
    if info is None:
      try:
        info = lookup_fn(event["url"], session) if lookup_fn is lookup else lookup_fn(event["url"])
      except requests.RequestException as exc:
        log.warning("detail lookup failed for %s: %s", event["id"], exc)
        info = None
    if info is not None:
      fresh[event["id"]] = info
    info = info or {}
    if not event["host"]:
      event["host"] = info.get("sponsor") or info.get("calendar") or ""
  # Keep only entries for events still being published so the cache stays small.
  save_cache(cache_path, fresh)
  return events
