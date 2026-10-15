# BRIEF — Oman Rooftop Solar Estimator · live showcase

## Workflow
workflow: product-launch-video
flow: standard

## Intent
Show the product as-is: the agent drives the real app on camera — cursor moves,
clicks land, punch-in zooms follow attention, UI sounds (click/whoosh) sync to
every action. A "live operated" showcase, not a narrated promo. Captured screens
from the real app (localhost:3000, dark theme) are the video's assets.

## Subject
Oman Rooftop Solar Estimator — trace your roof on a satellite map, get an
Oman-specific solar business case (system size, generation, savings, payback,
CO₂, SDG 7/11, Net Zero 2050). Built on real Omani data (governorate irradiance,
Nama 2025 tariffs, desert dust). Demo zone: Indian School Muscat campus, cached
tiles, works offline.

## Angle
"The live demo" — hero → trace demo roof (satellite fly-in + polygon snap) →
property details (bill in OMR → auto kWh) → Calculate → results cards + chart +
impact. No narration; on-screen captions carry the story.

## Must-haves
- length: ~45–60s
- aspect: 16:9 1080p
- sound: UI click/whoosh SFX synced to actions + subtle music bed
- cursor: animated pointer with click ripples at exact captured click coords
- zooms: punch-in on the panel/number being "looked at" each step
- captions: short kinetic captions per scene
- palette: app's own dark + amber (#F5A623-ish) identity
- keep: the offline-survival story out of this cut (VO script shot 5) — separate
  video later if wanted

## Assets
- showcase-video/assets/*.png — real captures via Playwright (SwiftShader/WebGL
  permitting) + actions.json with exact click coords per scene
- Fallback if WebGL capture fails: hero satellite still + manual-area path, or
  drive user's desktop browser via computer-use

## VO_MODE
none (SFX + music only)
