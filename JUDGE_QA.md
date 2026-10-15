# Judge Q&A — Cheat Sheet

Keep answers to 2–3 sentences. Numbers in PITCH.md if they probe deeper.

---

**Q: How accurate is this? Would you buy solar on it?**
It's planning-grade, not a quote: real governorate GHI/temperature normals, a documented NOCT cell-temperature model, dust-soiling deposition, and the actual 2025 APSR tariff tiers. For a feasibility estimate that's within a few percent of PVSyst for a north-Oman flat roof; design and licensed installer quotes come after.

**Q: Where does the data come from?**
GHI from the Oman Solar Atlas (5.5–6.5 kWh/m²/day per governorate); climate normals from long-term weather records; tariffs from the Authority for Public Services Regulation effective 1 Jan 2025; grid intensity 0.65 tCO₂/MWh (IEA, mostly gas-fired); tiles from Esri World Imagery (free, no key).

**Q: Why MapLibre and not Google Maps?**
MapLibre is Google-Maps-style mapping that's open-source and tokenless with any tile source — zero per-use cost, and it lets us ship a fully offline tile cache, which is exactly the resilience you'd want in the field. Switch in a Mapbox token and it upgrades automatically.

**Q: What makes it "Oman-specific" and not a generic calculator?**
Four things: per-governorate irradiance and temperatures, Nama tiered tariffs including the May–August summer relief most western tools don't model, desert dust soiling at 0.25%/day with cleaning cycles, and Gulf heat derating via NOCT. Generic tools assume ~15°C and clean panels — they overstate yield by 20–30% here.

**Q: How did you validate the outputs?**
Cross-checked the model against the knowledge-base benchmark: Muscat specific yield ~1,500 kWh/kWp/yr, performance ratio ~0.69, KB cost baseline 300 OMR/kWp. The engine is deliberately conservative — well-maintained real-world Muscat rooftops reach 1,650–1,750 kWh/kWp/yr (PR 0.77–0.81), so a good installation beats our estimate. The monthly bill model round-trips exactly (bill ⇄ consumption is a true inverse).

**Q: Who is the user / business model?**
Phase 1: homeowners + C&I property managers doing self-service feasibility (free). Phase 2: a lead-gen pipeline to licensed installers — the trace + inputs ARE a qualified sales lead. Phase 3: energy-service dashboards for government/utility programs (Vision 2040, Net Zero 2050 reporting).

**Q: How does it scale?**
Everything static except the estimate API — no database, no cloud services. The engine is a pure function of inputs, so it scales to zero-cost. The roadmap (Supabase traces, shareable links, shading analysis) slots in as a drop-in.

**Q: What would you add next?**
3D building shading from LiDAR, battery + inverter co-optimisation, tariff-comparison dashboard, Arabic RTL UI, server-side branded PDFs.

**Q: Security?**
The API sanitises every input (type-checked and clamped at the route), no secrets on the client, no user data stored — estimates live in localStorage until the user prints.

**Q: What happens if the internet drops during your demo?**
That's the part we engineered for. The demo zone around Indian School Muscat is pre-cached at zoom z5–z18 (~2 MB) and the map renders the local layer under the remote one — kill the Wi-Fi and the trace, calculation, 3D scene and report keep working. *Then actually do it on screen — that's the money shot.*