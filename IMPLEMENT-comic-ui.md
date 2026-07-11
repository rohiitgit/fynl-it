# IMPLEMENT — Comic UI Revamp

## Decided (with user)
- **Direction:** Yellow + gray modern comic. 0px radius, 2–3px solid ink borders, hard offset shadows (zero blur), tilted frames, halftone dots.
- **Display font:** Bricolage Grotesque. **Body:** Space Grotesk. **Labels:** JetBrains Mono (mono).
- **Tilt intensity:** Playful (2–4°), straighten on hover.
- **Scope:** Everything — foundation → landing → auth → dashboard/sidebar → modals/forms → polish. Phased, pause between phases.
- **Dark mode:** Light-first. Dark tokens kept functional, crafted later.
- **UI only.** No logic/data/behavior changes.

## Signature element
Comic "starburst / POW!" panel anchoring the hero, reused as the "Paid!" confirmation state.

## Phases
1. Foundation: fonts (layout.tsx), globals.css tokens + comic utilities, Button/Card/Badge primitives.
2. Landing page (page.tsx).
3. Auth page.
4. Dashboard page + Sidebar components.
5. NewInvoiceModal, EmailSettings, setup-messages page.
6. Motion + a11y polish + final verify.

## Status
- Phase 1: complete (verified)
- Phase 2 (landing): complete (verified)
- Phase 3 (auth): complete (verified)
- Phase 4 (dashboard+sidebar): complete (verified)
- Phase 5 (modals+forms+sweep): complete (verified)
- Phase 6 (final verify): complete — eslint clean, no new tsc errors, routes 200, screenshots confirm
