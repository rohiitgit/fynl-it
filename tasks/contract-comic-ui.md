# Contract — Comic UI Revamp (testable "done" criteria)

## Global visual (foundation)
1. Bricolage Grotesque loads and is applied to h1–h3 / display text.
2. Space Grotesk is the body font; JetBrains Mono is applied to `.label`/`.overline`/mono utilities.
3. All cards/buttons/badges render with 0px border-radius.
4. Panels use a solid ink border (≥2px) and a hard offset shadow with 0 blur.
5. Primary action color is yellow (#FFD84D family); no green gradients remain on revamped surfaces.
6. Hover on comic cards: shadow grows and/or tilt straightens; no blurred elevation shadows.
7. `prefers-reduced-motion` disables tilt/transform animations.
8. Text on yellow and on paper meets WCAG AA (≥4.5:1 body, ≥3:1 large).

## Per-surface
9. Landing hero shows the starburst signature + chunky display headline + tilted comic dashboard panel.
10. Landing navbar is a solid comic bar with hard border (no frosted floating pill).
11. Auth page uses comic form inputs (hard border, 0 radius) and yellow primary CTA.
12. Dashboard invoice rows are bordered comic panels; status badges are comic stickers; "Paid" uses starburst/sticker.
13. Sidebar has hard border + comic nav items.
14. NewInvoiceModal, EmailSettings, setup-messages use consistent comic inputs/buttons.

## Non-regression
15. `npx tsc --noEmit` passes (no new type errors).
16. `npm run lint` passes (no new errors) on changed files.
17. Dev server compiles each revamped route without runtime error.
18. No behavior/logic/data-fetching changed — diff is UI/className/style only.
