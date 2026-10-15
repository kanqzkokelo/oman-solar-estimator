# Design Checklist — Definition of Done

Every session of the Apple-style design pass is finished only when **all five** hold:

1. **Build green** — `npm run typecheck` and `npm run build` both exit 0.
2. **Bundle budget** — first-load JS for `/` grows ≤ **+10 kB** vs. the 274 kB baseline (compare `next build` output).
3. **Matrix pass** — every touched surface checked in all states:
   - [ ] English ↔ Arabic (directional motion mirrors in RTL)
   - [ ] Light ↔ Dark (each new material ships with its dark variant)
   - [ ] `prefers-reduced-motion: reduce` ON → travel becomes cross-fade/instant, counters snap, feedback still visible
   - [ ] Keyboard: `:focus-visible` ring visible on every interactive element
4. **Slow-motion review** — record step transitions + results reveal; review at ¼ speed (or frame-by-frame) for jumps, direction errors, overlap glitches.
5. **Console clean** — zero new warnings/errors in the browser console.

## Session plan

- [x] **S1 foundation** — press/focus CSS, typography, reduced-motion infra, spring tokens + direction hook ✅ *typecheck+build green, +6 kB (budget ≤10), smoke-tested*
- [x] **S2 wizard** — directional popLayout transitions (RTL-mirrored via `useSlideDirection` + AnimatePresence `custom`), results choreography (8px staggered Reveals, spring-drawn SDG rings, 600ms chart rhythm) ✅ *build green*
- [x] **S3 map + header** — skeleton loading states, eased flyTo (easeOutQuart), always-on glass header with scroll shadow, pill controls ✅ *build green*
- [x] **S4 QA** — browser-verified EN↔AR (RTL mirrors) × light↔dark (pure-black dark theme); bundle 280 kB (+6 ≤ +10 budget); zero console/server errors; slow-motion video review still manual-pending

## Visual redesign addendum (Apple-product-page direction)

- **Single accent**: solar-gold (green retired from UI chrome; SDG rings keep official UN colors as data ink)
- **Near-monochrome**: cool gray scale (`dune` → Apple grays, `dune-950` = pure black)
- **Pill buttons** (near-black primary, inverted white in dark), **`rounded-3xl` gray-fill cards**, hairline shadows
- **Giant type**: hero at `text-7xl/-0.04em`, results at `text-3xl`, `font-semibold` weights, tabular figures

## Locked motion vocabulary

- **Springs:** critically damped only, zero overshoot — `SPRING_SMALL` (0.30s) · `SPRING_UI` (0.35s) · `SPRING_SURFACE` (0.40s) in `src/lib/motion.ts`
- **Direction:** `useSlideDirection(forward)` mirrors LTR/RTL — never hardcode x-offsets
- **Press:** `:active` → `scale(0.97)` + darken, 100 ms, starts on pointer-down (global, `globals.css`)
- **Numbers:** `font-variant-numeric: tabular-nums` on `body` — figures never jitter
- **Reduced motion:** `MotionConfig reducedMotion="user"` + CSS media block + `CountUp` snap
- **Out of scope:** `src/lib/solar/**` and `/api/estimate` (business logic frozen), `/report` page
