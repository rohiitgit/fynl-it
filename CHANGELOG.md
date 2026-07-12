
## [2026-07-11 13:06] Comic UI — Phase 1: Foundation
- New comic design system: yellow (#FFD84D) + warm gray paper + ink (#16130E), 0px radius, 2.5px ink borders, hard offset shadows (0 blur), tilt/halftone/starburst/sticker utilities.
- Fonts swapped: Inter → Bricolage Grotesque (display), Space Grotesk (body), JetBrains Mono (labels).
- Files: src/app/layout.tsx, src/app/globals.css, src/components/ui/{button,card,badge,input,textarea,label}.tsx
- Verified: production build "Compiled successfully"; dev server 200 on / and /auth; screenshot confirms primitives render in comic style. (Pre-existing tsc error in send-due-emails route + storybook stories unchanged/unrelated.)

## [2026-07-11 13:15] Comic UI — Phase 2: Landing page
- page.tsx rewritten in comic style: solid comic navbar, yellow-highlight headline, tilted invoice panel + PAID! starburst signature, sticker statuses, gray band with tilted stat panels, 3 numbered how-it-works panels, speech-bubble founder card, comic footer. Removed floating green icons/gradients.
- Softened comic-paper-bg halftone dots (globals.css) — texture, not noise.
- Auth/redirect/loading logic unchanged. Verified: eslint + tsc clean on page.tsx, full-page screenshot via puppeteer-core.

## [2026-07-11 13:25] Comic UI — Phase 3: Auth page
- auth/page.tsx comic revamp: tilted comic form panel, yellow highlight headline, benefit rows with yellow icon chips, comic Google button/banner/chips, comic alert styling. Removed floating green icons. Sign-in logic unchanged.
- Verified: eslint + tsc clean, screenshot crisp (fullPage capture artifact identified and worked around in shot harness).

## [2026-07-11 13:40] Comic UI — Phase 4: Dashboard + Sidebar
- dashboard/page.tsx: stat cards → flat comic panels (yellow/paid-green/due-amber fills, ink borders, hard shadows, display numerals, mono labels); InvoiceCard → comic panel with 6px status stripe (green/amber/overdue), square yellow avatar, display amounts; skeletons + auth screens comic-styled.
- dashboard/layout.tsx: paper background, comic loading spinner.
- Sidebar: ink border rail, yellow logo mark (IndianRupee), mono section headers, active nav = yellow chip with ink border + hard shadow, square avatar, overdue sign-out.
- Verified: eslint + tsc clean; / and /dashboard 200. Data/auth logic unchanged.
- Note: founder image URL on landing 404s upstream (pre-existing twitter URL, not UI regression).

## [2026-07-11 14:00] Comic UI — Phase 5 + 6: Modals, forms, sweep, final verify
- NewInvoiceModal: AI upload zone (dashed ink border, yellow chip), payment-option panels, BETA comic sticker, follow-up banner, spinners de-greened.
- EmailSettings: yellow icon chip, comic template panels.
- setup-messages: comic tone-sticker escalation scale (green→blue→amber→overdue→ink/yellow), comic timeline (yellow step chips, ink connectors, "Edited" sticker), Actions/Schedule/Pro-Tips panels comic-styled, sticky header with ink rule.
- Sweep: auth/callback comic states, sonner toasts (square, ink border, hard shadow), skeleton squared.
- Final verify: eslint clean on all of src; no new tsc errors vs baseline (pre-existing: tests/stories/email-service/send-due-emails); all 5 routes 200; full-page screenshots confirm cohesive comic system.

## [2026-07-11 14:35] Landing hero: dashboard mock → comic money-shock illustration
- Replaced the DashboardPreview panel with HeroMoneyArt: inline SVG in Spider-Verse-inspired comic treatment — man's eyes pop out on springs with ₹ pupils at flying rupee notes; Ben-Day dots, radial action lines, CMYK misregistration ghosts, KA-CHING! sticker. PAID! starburst + Payment! sticker retained on the frame.
- Files: src/app/page.tsx (also removed now-unused FileText import; repaired a corrupted cy attribute found mid-edit).
- Verified: eslint + tsc clean, screenshots at 3 iterations (fixed clipped sticker, eyebrow/hairline crowding, eyeball–mouth collision).

## [2026-07-11 15:05] Hero art: extracted to component + pop-art fidelity rebuild
- New src/components/HeroMoneyArt.tsx (art now lives in its own file; page.tsx imports it, inline version + unused Bell import removed).
- Man rebuilt at pop-art vector fidelity (yourherocare-style): constructed face (jaw, nose+nostrils, teeth row, tongue, chin crease, nasolabial folds, forehead creases), combed-back hair with strand lines + temple fade, filled tapered brows, halftone skin/shirt shading patterns, neck SCM lines + chin shadow, collar band, shirt folds, reaching arm with splayed-finger hand, iris/pupil/vein/highlight eyeballs with gold ₹ pupils, pop-art halftone circle + accent dots.
- Every animatable part has an id/class hook (hma-eye-l/r, hma-spring-l/r, hma-note-1..3, hma-sweat, hma-kaching, hma-arm, hma-head) for the future animation pass.
- Verified: eslint + tsc clean, 2 screenshot iterations (socket/sticker fixes).

## [2026-07-11 15:40] Hero art: integrated public-domain Openclipart head
- HeroMoneyArt.tsx: replaced the hand-constructed head with the organic face from Openclipart "greeters" (public domain), scaled/positioned into the scene, recolored (ink outlines via CSS var, skin consts). Original eyes painted over with empty sockets; coil springs re-anchored to the new socket positions. Neck/forearm/hand lightened to match the face's skin tone.
- Scene (halftone circle, notes, KA-CHING!, ghosts, arm, stickers) and all hma-* animation hooks unchanged.
- Verified: eslint + tsc clean, screenshots confirm blend.

## [2026-07-11 14:50] Hero art: restored greeter's original face (dropped eye-pop gag)
- HeroMoneyArt.tsx: removed sockets, coil springs, popped eyeballs, and shock ticks; restored the source SVG's original irises (#2F4769) and white highlights. Updated aria-label + header comment.
- Scene unchanged (notes, halftone circle, KA-CHING!, PAID!, Payment!, sweat, arm). Animation hooks remain on hma-head/notes/sweat/kaching/arm.
- Verified: eslint + tsc clean, screenshot confirms.

## [2026-07-11 15:20] Hero art: replaced hand-drawn figure with professionally inked "Thumbs up guy"
- Searched openclipart/publicdomainvectors mirrors for a better-drawn figure; picked "Thumbs up guy" (publicdomainvectors.org 47515, public domain) — 1950s retro comic bust with professionally inked hand, wink, and shirt.
- Integrated as a tilted panel-in-panel in HeroMoneyArt.tsx (generated programmatically from the source SVG): sky recolored to brand yellow, shirt pattern → yellow-deep, black linework → var(--ink); CMYK misregistration echo frames behind the panel. Removed all hand-drawn body/arm/hand/head/neck/collar paths.
- Scene retained: halftone circle, ₹ notes, KA-CHING!, PAID!, Payment!, action lines, accent dots. Hooks: hma-guy, hma-notes, hma-note-1..3, hma-kaching, hma-bg-circle.
- Verified: eslint + tsc clean, screenshot confirms.

## [2026-07-11 15:45] Hero art: circle-framed figure (square frame removed)
- Figure now clipped into the halftone circle (clipPath + 2.15x zoom so the source panel's square frame falls outside the clip). Circle gets an ink ring, hard offset ink shadow, and cyan/magenta echo rings.
- Bug found & fixed: the hero renders the art twice (mobile + desktop), so duplicate SVG defs ids made url(#...) references resolve to the hidden instance — Chrome ignored the clip. All defs ids (clip + patterns) are now namespaced per-instance via useId.
- Opaque #FDEBA9 circle fill (translucent yellow over the shadow circle read as olive).
- Verified: eslint + tsc clean, DOM probe + screenshot confirm the clip applies.

## [2026-07-11 16:05] Display text in comic dialogue clouds
- New src/components/ComicCloud.tsx: reusable scalloped dialogue cloud (stretchable lobed SVG, non-scaling ink stroke, hard offset ink shadow, optional left/right speech tail).
- Landing headings wrapped: hero h1 (mobile + desktop, tail pointing at the figure), "Why choose Fynl-It?", "Simple. Automated. Professional.", "Ready to stop chasing payments?" (tail toward founder card).
- Verified: eslint + tsc clean, screenshots confirm shape/tails.

## [2026-07-11 16:15] ComicCloud: more inner padding
- Text was hugging the lobes; padding raised (px-10 py-8, sm:px-16 sm:py-12) so headings sit clear of the scalloped edge at all sizes.

## [2026-07-11 16:30] ComicCloud: elliptical reshape + 2-line hero
- Cloud path redrawn as lobes around an ellipse (480x180) — reads as a natural comic dialogue cloud instead of a scalloped rectangle.
- Hero headline forced to exactly two lines ("Never chase clients" / "for payment again") via block spans; desktop cloud widened (lg:118%/xl:112%, overlaps toward the art with z-20); sizes tuned per breakpoint (mobile 1.6rem → xl 3.3rem).
- Verified: eslint clean; desktop + 390px mobile screenshots confirm 2-line wrap and shape.

## [2026-07-11 16:40] ComicCloud: uncut borders
- Cloud lobes/shadow were clipped at the SVG bounds (curves + shadow offset exceed the viewBox); svg now overflow-visible so the full ink outline renders.

## [2026-07-11 16:50] ComicCloud: text centered in bubble
- Inner text container is now text-center (comic dialogue convention) — lines keep even clearance from the lobes on both sides and can no longer touch the border.

## [2026-07-11 17:00] Hero art: KA-CHING! sticker fits its rect
- Sticker rect widened (182→220) and text resized (40→36) + recentered so the lettering no longer overflows the rectangle.

## [2026-07-11 17:20] Display face: Bricolage Grotesque → Bangers
- Tried Mochiy Pop One (user request) — rejected on sight; settled on Bangers, the classic comic-book cover lettering face. Single 400 weight with font-synthesis: none and +0.035em tracking (globals.css). Dev server restart required after next/font swap (stale HMR module referenced the old font binding).

## [2026-07-11 17:45] Hero art: scroll-driven animation
- HeroMoneyArt now animates on scroll: the man rises in his circle porthole, the three ₹ notes scatter up at different speeds (parallax), floating ₹ glyphs drift fastest, KA-CHING! lifts with a slight twist.
- Mechanics per the animation skill: every transform is a pure smoothstep function of scrollY (provably reversible — verified via DOM probe: exact base transforms restored at scrollY 0), rAF-throttled passive scroll/resize listeners, transform attributes (not CSS transforms) to avoid origin pitfalls, disabled entirely under prefers-reduced-motion.
- Verified: eslint + tsc clean; screenshots at scrollY 0/250/550 + reversibility probe (reversible: true).

## [2026-07-11 18:10] Hero: money-thrower machine
- New src/components/MoneyThrower.tsx: comic money-cannon SVG (gray body, yellow tilted barrel with burst lines, ₹ emblem, gauge, vents, BRRR! sticker) anchored bottom-left of the hero, with a mechanical chug loop.
- 9 green ₹500 bills continuously launch from the barrel in staggered parabolas across the hero (CSS keyframes bill-fly in globals.css, per-bill travel/peak/rotation via custom properties). Whole layer is absolute inset-0 z-0 + pointer-events-none, so bills always stay behind the hero's text, clouds, and banners (z-10+).
- prefers-reduced-motion: bills hidden, machine static.
- Verified: eslint + tsc clean; two timed screenshots confirm motion + correct layering (bills render behind cloud/text).

## [2026-07-12] Founder photo URL updated
- Replaced dead twimg profile URL (404) with the current one; photo now renders in the founder card.

## [2026-07-12] Fix: AI endpoints called without auth token (401)
- The security hardening made /api/process-invoice, /api/enhance-message, /api/generate-message require a Supabase Bearer token, but their client callers never sent one — invoice scan failed with "Failed to process invoice" (server: 401).
- NewInvoiceModal upload fetch now attaches the session token (same pattern as the existing create-link call); use-message-generation gained a getAuthHeaders() helper used by both AI fetches. Clear "signed in" error when no session.

## [2026-07-12] Fix: /api/process-invoice 500 — pino worker crash under Next
- Root cause: dev logger used pino-pretty transport, which spawns a thread-stream worker Next/Turbopack can't resolve ("the worker has exited"). Any aiLogger.error() call — including inside the catch block — crashed, turning handled errors into unhandled 500s. This broke the AI invoice scanner (after the earlier auth fix let requests reach the server).
- Fix: src/lib/logger/config.ts detects the Next runtime (NEXT_RUNTIME) and skips the worker transport there, logging plain JSON instead. pino-pretty still used for standalone/CLI runs.
- Verified: no "worker has exited" across repeated requests; endpoint returns clean status codes (401 without token) instead of 500.
