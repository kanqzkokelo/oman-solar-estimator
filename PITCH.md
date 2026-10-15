# Oman Rooftop Solar Estimator — Pitch Kit

## One-liner
**Trace your roof, know your solar future** — Oman's irradiance, climate, tariffs and SDG impact computed in seconds, on a satellite map that works even offline.

## 60-second verbal pitch

> Oman has among the best solar resources on earth — 5.5 to 6.5 kWh per square metre per day — yet deciding "is solar right for my roof?" still means sales calls, foreign spreadsheets, and guesswork. Our tool fixes that: you trace your actual rooftop on a satellite map, and within seconds you get an Oman-specific answer — system size, generation, bill savings, payback, CO₂ avoided — built on real governorate irradiance, Nama's 2025 tariff tiers with summer relief, and a cell-temperature model that accounts for the Gulf heat and desert dust.
>
> We also visualise the outcome the way policymakers care about: SDG 7 affordable clean energy, SDG 11 sustainable cities, and Oman's Net Zero 2050 target. And it's engineered for the classroom-to-field reality — the satellite imagery in the demo zone is pre-cached, so the entire flow keeps working with the internet cut off.

## 150-word written pitch (paste-ready)

Oman Rooftop Solar Estimator turns any rooftop into an instant, Oman-specific solar business case. Users trace their roof on satellite imagery, and a shared TypeScript engine — used by both the UI and a sanitized API — computes system sizing, monthly generation shaped by per-governorate irradiance and temperature normals, dust-soiling losses, tiered Nama billing with summer relief, net-metering credits, payback, ROI, NPV, LCOE, and CO₂ impact with SDG 7 / SDG 11 / Net Zero 2050 trackers.

Built with Next.js 15, React 19, MapLibre GL and a live 3D roof model (react-three-fiber), it runs without external keys and degrades gracefully offline: the Muscat demo zone ships with ~2 MB of pre-cached satellite tiles across a full zoom ladder, so a dropped Wi-Fi never kills the demo.

The result: an educational-grade, royalty-free solar feasibility tool aligned with Oman Vision 2040 and national net-zero goals.

## Key numbers to drop during Q&A

- GHI 5.5–6.5 kWh/m²/day (Oman Solar Atlas) — among the world's best
- Specific yield: engine ≈ 1,500 kWh/kWp/yr in Muscat (PR ~0.69, deliberately conservative) vs. real-world well-run rooftops 1,650–1,750 (PR 0.77–0.81) ≈ 1.5× Europe average
- Heat derating ~11.5% annual mean (NOCT model), up to ~17% summer peaks
- Dust soiling 7.5% at the standard 60-day cleaning cycle (0.25%/day deposition)
- Nama 2025 tariffs: 14/18/32 baisa residential tiers + May–Aug summer relief
- Default capex 300 OMR/kWp, O&M 1.5%/yr, 0.55%/yr degradation, 5.5% discount rate
- Grid factor 0.65 tCO₂/MWh (≈96% gas-fired) → trees (21.77 kg/yr) & cars (4.6 t/yr)
- Offline tile cache: ~107 tiles, ~2 MB, zoom ladder z5–z18

## Differentiators (why this beats "a survey + a spreadsheet")

1. **Locally grounded** — data is Oman-specific (governorate GHI, temps, APSR tariffs), not Western defaults slapped on.
2. **Monetisable pipeline** — tuned for the 100–300 kWp C&I segment and Nama's net-metering rule.
3. **Actually demoable offline** — judges' favourite question answered before it's asked.
4. **Extensible** — maps to a real product roadmap (3D shading, batteries, Arabic RTL, dashboard).