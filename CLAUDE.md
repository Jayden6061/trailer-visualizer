# Trailer Visualizer — Project Context

## Response style
Be terse. No preamble, no summaries, no explanations unless asked. Code only; skip prose. One sentence max per non-code response. If the answer is a code change, make it — don't describe it first.

## What this is
A load planning tool for Diamond Line Delivery (28' trailers only).
Built in React with shadcn/ui and lucide-react.

## Current version
v0.5

## Key specs (do not change without instruction)
- Trailer: 28' long (336"), 94" wide, 102" tall
- Half-trailer line: 14' (168")
- Weight threshold: 12,000 lbs

## Known history
- 3D view was attempted (v0.6/v0.7) and discarded — do not re-introduce
- Non-stackable stacking bug was fixed in v0.5 — maxStack=1 when stackable=false
- Height changed from 107" to 102" in v0.9

## File structure
src/components/   — React components
src/constants/    — trailer specs, thresholds
src/utils/        — buildPallets, rectsOverlap, snapAway
src/styles/       — CSS