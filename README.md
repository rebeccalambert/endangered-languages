# What the Number Doesn't Say

104 endangered languages. The same 104 names rearrange to answer different questions: how many people speak each one, how endangered it is, and which languages are related. The data never changes; the way we look at it does.

**Live:** https://rebeccalambert.github.io/endangered-languages/

## Approach
- **One element per language.** Each language is a single button that moves between views with GSAP Flip, so any language can be followed through the whole piece. Tracking one from its detail panel keeps it highlighted, and the page scrolls with it as the names rearrange.
- **A guided story:** Speakers → Status → Family → Closing, stepped through with a bottom stepper. Reaching the closing turns the steps into tabs.
- **Human-scale counts.** Speaker counts are grouped by rooms and places ("about the size of a bus") instead of a log axis. These sizes are editorial comparisons, not data.
- **Every figure is computed from the JSON** (`src/discoveries.js`), and `npm run verify` prints them all:
  - **Status:** 28 of 94 living languages have a speaker count closer to another label's typical count (median, on a log scale) than to their own.
  - **Family:** 13 of 15 families have members with different statuses. Rust marks each family's least common status.
  - **Closing:** one line back from each view, then the conclusion: how endangered a language is depends on more than how many people speak it. The data doesn't say what else sets the label, so the page doesn't guess.
- **Data notes:** Haida's family is recorded as "Haida (isolate)", so it's counted as an isolate (10 in total). Findings are framed as "in this collection", not as a census.
- **Mobile first:** a bottom-sheet detail panel on phones and a side card on desktop, sticky section headers, 44px tap targets, and WCAG AA contrast. `prefers-reduced-motion` swaps layouts instantly, and rapid taps always end in a consistent layout.
- **Stack:** Vite, vanilla JS, plain CSS, GSAP with Flip, and self-hosted Noto Serif and Noto Sans.

## What I cut
- **A Place view (world map).** At phone width, 41 records in North America and 29 in Europe would need a zoom to be tappable, and the story lands better ending on families. Each language's coordinates are still in its detail panel.
- **Family lines and family selection.** Tracking already lets a viewer follow one language, so these added little.
- **A third discovery:** Comanche and Kiowa are recorded about 9 km apart but in different families. It depended on the map.
- **Story mode,** for another day: ask the viewer to pick a language first, then walk the whole story with it.

## Run locally
Requires Node 18+.

```bash
npm install
npm run dev       # local dev server
npm run verify    # print every computed figure
npm run build     # static build in dist/
npm run preview   # serve the build locally
```
