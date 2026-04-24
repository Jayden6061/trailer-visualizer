import { TH, TW } from '../constants/trailerTypes';

export function clamp(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function fmtPct(v) { return `${v.toFixed(1)}%`; }

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

export function snapAway(moving, others, rW, rH) {
  const cands = [{ x: moving.x, y: moving.y }];
  for (const o of others) {
    cands.push(
      { x: o.x + o.w,      y: moving.y },
      { x: o.x - moving.w, y: moving.y },
      { x: moving.x,       y: o.y + o.h },
      { x: moving.x,       y: o.y - moving.h },
    );
  }
  cands.push(
    { x: 0,             y: moving.y },
    { x: rW - moving.w, y: moving.y },
    { x: moving.x,      y: 0 },
    { x: moving.x,      y: rH - moving.h },
  );
  const valid = cands.filter(c =>
    c.x >= 0 && c.y >= 0 && c.x + moving.w <= rW && c.y + moving.h <= rH
  );
  const scored = valid.map(c => ({
    ...c,
    hasC: others.some(o => rectsOverlap({ x: c.x, y: c.y, w: moving.w, h: moving.h }, o)),
    dist: Math.hypot(c.x - moving.x, c.y - moving.y),
  }));
  scored.sort((a, b) => a.hasC !== b.hasC ? (a.hasC ? 1 : -1) : a.dist - b.dist);
  return scored[0] || { x: moving.x, y: moving.y };
}

export const initialRows = [
  { id: 1, qty: 1, length: 48, width: 48, height: 48, weight: "", stackable: false },
  { id: 2, qty: 2, length: 40, width: 48, height: 42, weight: "", stackable: true  },
];

/* ─── Pallet builder ───
 * FIX (v0.5): non-stackable pallets are capped at maxStack=1.
 */
export function buildPallets(rows, TL) {
  const out = [];
  let curX = 0, curY = 0, shelf = 0;
  rows.forEach((row, rowIndex) => {
    const qty      = Math.max(0, Math.floor(clamp(row.qty, 0)));
    const length   = Math.max(1, clamp(row.length, 48));
    const width    = Math.max(1, clamp(row.width,  48));
    const height   = Math.max(1, clamp(row.height, 48));
    const weight   = clamp(row.weight, 0);
    const stackable = Boolean(row.stackable);
    // Non-stackable: always 1 per floor position
    const maxStack = stackable ? Math.max(1, Math.floor(TH / height)) : 1;
    let remaining = qty, stackIdx = 0;
    while (remaining > 0) {
      const pieces = Math.min(remaining, maxStack);
      remaining -= pieces;
      if (curY + width > TW) { curX += shelf; curY = 0; shelf = 0; }
      const fitsL = curX + length <= TL;
      const fitsW = curY + width  <= TW;
      const fit   = fitsL && fitsW ? "fit" : "overflow";
      out.push({
        id:          `${row.id}-${stackIdx}`,
        rowId:       row.id,
        rowNum:      rowIndex + 1,
        length, width, height, weight, stackable,
        pieces,
        stackHeight: pieces * height,
        x:       fit === "fit" ? curX : Math.min(curX, TL),
        y:       fit === "fit" ? curY : Math.min(curY, TW),
        rotated: false,
        fitStatus: fit,
      });
      if (fit === "fit") { curY += width; shelf = Math.max(shelf, length); }
      stackIdx++;
    }
  });
  return out;
}
