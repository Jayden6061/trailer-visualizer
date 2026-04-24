/* ─── Trailer configurations ─── */
export const TRAILER_TYPES = {
  "28": { label: "28' Trailer", lengthFt: 28, lengthIn: 28 * 12, halfFt: 14,   halfIn: 14 * 12             },
  "35": { label: "35' Trailer", lengthFt: 35, lengthIn: 35 * 12, halfFt: 17.5, halfIn: Math.round(35*12/2) },
  "53": { label: "53' Trailer", lengthFt: 53, lengthIn: 53 * 12, halfFt: 26.5, halfIn: Math.round(53*12/2) },
};

/* ─── Shared constants ─── */
export const TW      = 94;     // trailer interior width  (inches) — same for all types
export const TH      = 107;    // trailer interior height (inches) — same for all types
export const MAX_W   = 12000;  // weight threshold (lbs)
export const SNAP_PX = 8;      // snap-to-edge threshold in screen pixels
export const RULER_W = 44;     // px — must match --ruler-w in CSS
