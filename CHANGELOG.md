# Trailer Visualizer — Changelog

---

## v0.5 — Auto-Optimize
**Date:** 2026-04-24

### Added
- **Auto-Optimize button** — added to the Trailer Views toolbar alongside Reset Layout. Runs a Bottom-Left Fill algorithm with rotation support: sorts pallets by floor area (largest first), then places each one at the lowest-X, lowest-Y valid position, trying both orientations. Goal is to minimize total linear feet used. Pallets that cannot fit are marked overflow.

---

## v0.4.3 — Height Correction & Simplified Trailer Selection
**Date:** 2026-04-23

### Changed
- **Trailer height corrected** — interior height updated from 107" to **102"**. All references updated: ceiling line label, height violation stat card, warning banner message, stacking cap (`floor(102 / pallet_height)`), and info note text.
- **Trailer selector removed** — the app is now locked to the 28' trailer. The dropdown has been removed from the header and replaced with a static badge displaying the fixed spec (28' · 94" wide · 102" tall). The `TRAILER_TYPES` object retains only the 28' entry; the `trailerKey` state and `changeTrailer` function have been removed.

---

## v0.4.2 — Diamond Line Branding, Side View Fixes & Stack Dividers
**Date:** 2026-03-31

### Added
- **Diamond Line Delivery logo banner** — full-width banner at the top of the page displaying the company logo (transparent-background PNG, embedded directly in the HTML so it works offline). Background is white with a light bottom border.

### Changed
- **Side elevation right wall** — the right edge of the side elevation canvas now has a matching `3px solid #334155` border, enclosing the trailer profile symmetrically on both sides.
- **Stacked pallet divider lines (fixed)** — divider lines between stacked units in the side elevation are now rendered as separate zero-height absolute `div` elements positioned precisely at each pallet-height boundary (`bottom: i * layerHeightPct + layerHeightPct`), with `zIndex: 20` and `overflow: visible` on the parent. Style is `2px dashed #fff`. Previous attempts used `borderTop` on the layer div itself which caused the line to appear at the top of the entire stack rather than between units.
- Banner background changed from black to white.

---

## v0.4.1 — Stacking Fix, View Alignment, Trailer Selector & Layered Side View
**Date:** 2026-03-31

### Fixed
- **Stacking bug** — non-stackable pallets were incorrectly grouping into stacked positions. Fixed by enforcing `maxStack = 1` when Stackable is off, ensuring each non-stackable unit always occupies its own floor position.

### Added
- **Trailer size dropdown** — selector in the header for 28', 35', and 53' trailers. Width (94") and height (107") are constant; only length and half-trailer midpoint change:
  - 28' Trailer — 336" long, half at 14'
  - 35' Trailer — 420" long, half at 17.5'
  - 53' Trailer — 636" long, half at 26.5'
- **Layered side elevation** — each pallet stack renders as individual unit segments in the side view with per-layer labels (e.g. P2·1, P2·2) and individual heights.
- **Height overflow strip** — red strip above ceiling line showing exact excess in inches (e.g. `+12"`) when a stack exceeds 107".

### Changed
- **Side view aligned with top-down view** — both views share a fixed-width ruler column spacer so their left edges line up exactly.
- Half-trailer label and linear usage stat dynamically reference the selected trailer.

---

## v0.4 — Side Elevation View & Height Violation Detection
**Date:** 2026-03-31

### Added
- Side elevation view (length × height) with ceiling line at 107", inch ruler, half-trailer vertical line, and foot-interval grid.
- Height violation detection: any pallet or stack exceeding 107" turns red in both views; +N" overflow tag in the side view.
- Height violations stat card added to the stats panel.
- Height violation condition added to the volume warning banner.

### Changed
- Top-down and side elevation views grouped in a single "Trailer Views" card.

---

## v0.3 — Interactive Pallets & Full-Height Stacking
**Date:** 2026-03-31

### Added
- **Drag & drop** — pallets are freely draggable in the top-down view. They snap to trailer walls and adjacent pallet edges while dragging.
- **Collision resolution on drop** — if a dropped pallet overlaps another, it snaps to the nearest clear position.
- **Rotate** — click to select a pallet, then use the on-pallet rotate handle or toolbar button to flip 90°. Position is clamped to stay inside the trailer.
- **Reset Layout** — restores auto-placement without losing freight entries.
- **Height-based stacking** — stacking is no longer capped at 2. Pallets now stack `floor(107" / height)` units deep. Stack count badge (purple ×N) shows the count per floor position.
- **Selected pallet info bar** — toolbar shows floor footprint and stacked height when a pallet is selected.

### Changed
- Stack count display updated from fixed 2-high to full N-high model.
- Legend updated to include stack badge entry.

---

## v0.2 — Dimensions, Weight & Volume Warnings
**Date:** 2026-03-27

### Added
- **Weight field** per freight line (optional, lbs per pallet). Summed into a total shipment weight stat.
- **Per-pallet weight** shown inside each pallet block in the trailer view.
- **Total weight stat card** — highlights red when the 12,000 lb threshold is exceeded.
- **Volume quote warning banner** — appears when shipment exceeds the half-trailer line (14') OR total weight exceeds 12,000 lbs. Message: *"Warning: due to size this shipment may require a volume quote."*
- **Trailer graphic highlight** — border turns red and a subtle red tint overlays the trailer when warning is active.

### Changed
- Trailer width updated from 102" to **94"**; height added at **107"**. Badge updated.
- Freight entry column layout updated to accommodate the Weight column.

---

## v0.1 — Initial Release
**Date:** 2026-03-26

### Features
- 28' × 102" trailer floor plan visualizer
- Freight entry table: Qty, Length, Width, Height, Stackable toggle
- Stackable logic: 2-high pairing; odd quantities leave one unstacked
- Color-coded pallet blocks: blue (non-stackable), green (stackable), red (overflow)
- Half-trailer line marker at 14'
- Stats panel: linear usage (ft + %), floor coverage (%), overflow count
- Legend panel, Nose/Doors orientation labels
- Responsive layout, self-contained HTML file

---

<!-- TEMPLATE FOR FUTURE ENTRIES

## v0.X — Short Title
**Date:** YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Removed
-

-->
