// Placement of the hero's background food emojis ("floaters"). The hero component
// owns the numbers; this file only finds empty spots for them.

export type FloaterPick = { emoji: string; size: number; slow: boolean };
export type Floater = FloaterPick & { left: number; top: number };

export type FloaterRules = {
  count: number; // how many to place
  scale: number; // multiply each pick's font size (1 = as picked)
  pad: number; // px of clear space from any keep-out element
  gap: number; // px of clear space between floaters
  edge: number; // px of clear space inside the panel
  tries: number; // random spots to try per floater before giving up on it
  textKeepOut: boolean; // false lets floaters sit behind text (buttons and bird still block)
};

type Rect = { left: number; top: number; right: number; bottom: number };

const overlaps = (a: Rect, b: Rect, margin: number) =>
  a.left < b.right + margin && a.right > b.left - margin && a.top < b.bottom + margin && a.bottom > b.top - margin;

// An emoji glyph draws a little wider than its font size.
const floaterRect = (left: number, top: number, size: number): Rect => {
  const box = size * 1.25;
  return { left, top, right: left + box, bottom: top + box };
};

// Everything a floater must avoid, relative to the panel's top-left corner. Elements
// marked data-keepout="text" are measured line by line, so the space beside a short
// line stays usable; anything else blocks its whole box.
function keepOutRects(panel: HTMLElement, textKeepOut: boolean): Rect[] {
  const origin = panel.getBoundingClientRect();
  const rects: Rect[] = [];
  panel.querySelectorAll<HTMLElement>("[data-keepout]").forEach((el) => {
    if (!textKeepOut && el.tagName !== "DIV") return;
    let boxes: DOMRect[];
    if (el.dataset.keepout === "text") {
      const range = document.createRange();
      range.selectNodeContents(el);
      boxes = Array.from(range.getClientRects());
    } else {
      boxes = [el.getBoundingClientRect()];
    }
    for (const b of boxes) {
      if (b.width === 0 || b.height === 0) continue;
      rects.push({ left: b.left - origin.left, top: b.top - origin.top, right: b.right - origin.left, bottom: b.bottom - origin.top });
    }
  });
  return rects;
}

// Tries random spots for each pick in turn; a pick that finds no room is left out.
// `rand` is a seeded generator so one page load always lays out the same way.
export function placeFloaters(panel: HTMLElement, picks: FloaterPick[], rand: () => number, rules: FloaterRules): Floater[] {
  const keepOut = keepOutRects(panel, rules.textKeepOut);
  const placed: Floater[] = [];
  for (const rawPick of picks.slice(0, rules.count)) {
    const pick = rules.scale === 1 ? rawPick : { ...rawPick, size: Math.round(rawPick.size * rules.scale) };
    const box = pick.size * 1.25;
    const spanX = Math.max(0, panel.clientWidth - box - rules.edge * 2);
    const spanY = Math.max(0, panel.clientHeight - box - rules.edge * 2);
    for (let attempt = 0; attempt < rules.tries; attempt++) {
      const left = Math.round(rules.edge + rand() * spanX);
      const top = Math.round(rules.edge + rand() * spanY);
      const rect = floaterRect(left, top, pick.size);
      if (keepOut.some((k) => overlaps(rect, k, rules.pad))) continue;
      if (placed.some((p) => overlaps(rect, floaterRect(p.left, p.top, p.size), rules.gap))) continue;
      placed.push({ ...pick, left, top });
      break;
    }
  }
  return placed;
}
