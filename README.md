# Oman Rooftop Solar Estimator ☀️🇴🇲

A production-ready web platform that lets property owners in the Sultanate of Oman trace their rooftop on a satellite map and instantly receive an Oman-specific estimate of:

- **Energy** — recommended system size (kWp), panel count, monthly & annual generation (kWh)
- **Financials** — installation cost (OMR), bill savings, payback period, ROI, LCOE
- **Environment** — CO₂ avoided, tree & car equivalents
- **Impact** — visual trackers for **SDG 7**, **SDG 11** and **Oman Net Zero 2050**
- **Report** — a clean, printable/downloadable PDF report

Built on real Omani data: solar irradiance per governorate, ambient temperatures, Nama tariff tiers, and the grid emission factor.

> **One-line pitch:** *Trace your roof, know your solar future — Oman's irradiance, climate, tariffs and SDG impact computed in seconds, on a satellite map that even works with no internet.*

---

## Offline demo mode (judge-proof)

The demo zone — the Indian School Muscat campus, Darsait — ships with **pre-cached satellite tiles** so the map keeps working when the network drops mid-demo.

- `npm run cache-tiles` warms a zoom ladder (z5 country view → z18 roof detail) into `public/tiles/{z}/{x}/{y}.jpg` (currently ~107 tiles, ~2 MB).
- The map renders a local raster layer **under** the remote Esri layer — identical imagery, zero visual seam online; local tiles take over offline.
- Clicking **Demo roof** flies you to the cached zone automatically.
- Outside the cached box the map falls back to a flat intentional backdrop colour instead of a broken-looking grid.

```bash
npm run cache-tiles   # re-warm the tile cache (needs internet, then works offline)
```

---

## Tech stack

| Layer        | Technology                                                     |
| ------------ | -------------------------------------------------------------- |
| Frontend     | Next.js 15 (App Router) · React 19 · Tailwind CSS 3             |
| Mapping      | MapLibre GL JS (Mapbox-GL-compatible) + custom polygon drawing |
| Imagery      | Esri World Imagery (free, no key) or Mapbox Satellite v9       |
| Geocoding    | Mapbox Geocoding (when token set) → Photon → Nominatim fallback |
| Charts       | Recharts                                                       |
| Motion / 3D  | `motion` (framer-motion) transitions + animated counters · react-three-fiber live 3D roof scene (code-split) |
| Backend      | Next.js API route (`/api/estimate`) + shared TS calc engine    |
| Storage      | `localStorage` (report persistence) — swap for Supabase/PostGIS|

> Why MapLibre? It is API-compatible with Mapbox GL JS but works tokenless with any tile source, so the demo runs out of the box. Drop a Mapbox token in `.env.local` to switch to Mapbox Satellite v9 tiles automatically.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the app works with no env vars
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

---

## Environment variables (all optional)

| Variable                       | Default               | Purpose                                            |
| ------------------------------ | --------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_MAPBOX_TOKEN`     | *(none)*              | Mapbox Satellite tiles + Mapbox Geocoding when set; Photon→Nominatim fallback when empty |
| `NEXT_PUBLIC_GRID_EMISSION_FACTOR` | `0.65`            | tCO₂/MWh for Oman's gas-fired grid                     |
| `NEXT_PUBLIC_COST_PER_KWP`     | `300`                 | Default installed cost, OMR/kWp (KB baseline; range 250–350) |
| `NEXT_PUBLIC_GEOCODER_URL`     | `https://nominatim.openstreetmap.org` | Address search endpoint         |

---

## Calculation engine (Oman-specific)

All logic lives in `src/lib/solar/` and is shared by the UI and the API route.

### 1. Irradiance & climate (`constants.ts`)
- Per-governorate **GHI** (5.5–6.5 kWh/m²/day, Oman Solar Atlas) and average ambient temperature.
- Plane-of-array transposition (KB doc 03): C_tilt = 1.035 at the 22° optimal tilt, 1.0 flat, × orientation factors (south = 1.0 … east/west = 0.92).

### 2. Losses / derating factors
- **Heat derating**: NOCT cell-temperature model — `T_cell = T_amb + (NOCT−20)/800 × 950`, −0.35 %/°C above 25 °C STC (≈ 11.5 % mean annual heat loss; up to ~17 % in summer peaks).
- **Dust & soiling**: daily deposition model `f = 1 − r·t/2` with r = 0.25 %/day; 60-day cleaning cycle → 7.5 % loss (configurable by cleaning frequency).
- **Inverter 5 % · wiring 2 % · shading 5 % · other 7 %** (product ≈ PR_base 0.82).
- Combined performance ratio ≈ **0.69** → typical specific yield ≈ **1,500 kWh/kWp/yr** for Muscat (calibrated: deliberately conservative — well-run real-world rooftops hit 1,650–1,750 kWh/kWp/yr, PR 0.77–0.81).

### 3. Sizing
- Usable roof = traced area × 75 % (excludes AC units, tanks, walkways).
- Panel-area based density 0.21 kWp/m² (550 Wp on a 2.583 m² panel) → panels of 550 Wp.
- Recommended size = min(roof potential, demand-matched size), with an honest note when the roof can host more than consumption needs.

### 4. Tariffs (`tariffs.ts`) — APSR regulation, effective 1 Jan 2025
| Category           | Rate                                                        |
| ------------------ | ----------------------------------------------------------- |
| Residential primary | 14 b/kWh ≤4,000 kWh · 18 b 4,001–6,000 · 32 b >6,000       |
| Residential add'l   | 22 b ≤4,000 · 26 b 4,001–6,000 · 32 b >6,000               |
| Non-residential     | flat 25 b/kWh                                               |

Monthly bills are computed **tier-by-tier** (with vs without solar), seasonal summer demand weighting for homes, **Nama summer relief for primary accounts (May 15 % / 10 % / 5 %, Jun–Aug 20 % / 15 % / 10 % off per slab)** and surplus export credited under net metering.

### 5. Financials & carbon
- Capex = kWp × cost/kWp (default **300 OMR/kWp**; KB turnkey range 250–350).
- O&M 1.5 %/yr (inflated at 2 % CPI/yr) · panel degradation 0.55 %/yr · tariff escalation 2 %/yr · 5.5 % discount rate · 25-year horizon.
- Payback, 25-yr ROI, NPV, LCOE.
- CO₂ = kWh × 0.65 tCO₂/MWh (Oman grid, ~96 % gas-fired); trees (**21.77 kg/tree/yr**) and cars (4.6 t/yr) equivalents.

---

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                # Landing + wizard
│  ├─ layout.tsx              # Theme provider, fonts, metadata
│  ├─ globals.css             # Tailwind + print styles
│  ├─ report/page.tsx         # Printable PDF report
│  └─ api/estimate/route.ts   # POST estimate API (sanitized inputs)
├─ components/
│  ├─ map/RoofMap.tsx         # MapLibre map + custom polygon tracer + offline tile fallback
│  ├─ wizard/                 # 3-step wizard (map → details → results)
│  ├─ charts/                 # Recharts (monthly energy, cumulative savings)
│  ├─ sdg/SdgBadges.tsx       # SDG 7 / SDG 11 / Net Zero 2050 rings
│  ├─ ui.tsx, Header.tsx, Footer.tsx, ThemeProvider.tsx
├─ lib/
│  ├─ solar/                  # constants, tariffs, calculator (shared engine)
│  ├─ geo/                    # geodesic area, Nominatim geocoding
│  └─ format.ts
├─ types/index.ts
└─ public/tiles/              # pre-cached satellite tiles (offline demo zone)
scripts/
└─ cache-tiles.mjs            # warms public/tiles from Esri World Imagery
```

---

## API

```bash
curl -X POST http://localhost:3000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"roofAreaM2":350,"propertyType":"residential","governorate":"muscat","monthlyConsumptionKwh":3500,"tariffSchedule":"primary"}'
```

Returns the full estimate object (system, monthly/yearly series, financials, environmental, SDG scores). Inputs are validated and clamped server-side.

---

## Roadmap ideas

- Supabase/PostGIS persistence of traces and estimates; shareable links
- Shading analysis from 3D buildings (LiDAR/solar potential layer)
- Real-time inverter & battery option modelling
- Arabic (RTL) UI
- PDF generation server-side (jsPDF) with branded template

---

## Data sources

- Irradiance: Oman Solar Atlas / Global Solar Atlas (GHI 5.5–6.5 kWh/m²/day)
- Tariffs: Authority for Public Services Regulation (APSR), effective 1 Jan 2025
- Emission factor: IEA-based grid intensity for Oman ≈ 0.65 tCO₂/MWh
- Imagery: Esri World Imagery / Mapbox Satellite v9
- Geocoding: © OpenStreetMap contributors via Nominatim

*Estimates are indicative planning figures, not financial advice or quotations.*
