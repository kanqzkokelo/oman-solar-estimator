# Interview Cram Card (read 3x before, keep on phone)

## 1. THE PITCH (20 seconds, say this when asked "what is it?")
"I built a web app where anyone in Oman traces their roof on a satellite map and instantly gets an Oman-specific
solar estimate: system size, energy yield, bill savings, payback, and CO2 avoided — using real Omani data:
per-governorate irradiance, monthly temperatures, the actual Nama 2025 tariffs, desert dust, and our gas-fired
grid. It also shows how each installation advances SDG 7, SDG 11 and Oman Net Zero 2050."

## 2. THE 5 ANCHOR NUMBERS (recite these on demand)
1. Oman receives **5.5–6.5 kWh/m²/day** of sun — among the best in the world.
2. Muscat example: 100 m² roof → **~16 kWp, ~24,000 kWh/yr, ~67% performance ratio**.
3. **Specific yield ~1,495 kWh/kWp/yr** — matches published Oman literature.
4. Tariffs: **14/18/32** baisa residential primary, flat **25** non-residential, summer relief May/Jun–Aug.
5. Grid is ~96% gas → **0.65 tCO2/MWh**; typical payback **~17–19 yrs** (tariffs are cheap — be honest).

## 3. WHY OMAN-SPECIFIC (the moat — say this when they ask "why does this exist")
"Generic calculators assume flat prices and temperate climate. Oman has tiered tariffs, extreme summer heat that
derates panels ~12%, dust that costs ~7.5% between cleanings, and a gas grid — all of which I built into the
models. The algorithm is textbook PV engineering; what's specific to Oman is the data."

## 4. THE DEMO NARRATION (while clicking in the app — read numbers off the screen)
1. Search "Salalah" → fly to it → "Demo roof" → area appears live (governorate auto-detects).
2. Step 2: type bill **50 OMR** → watch it convert to kWh (say: "users can enter a bill, not energy units").
3. Calculate → narrate the results screen top row: system size, generation, savings, payback.
4. Show the loss breakdown card and assumptions card — the app lists every input, so you're reading it live.
5. Toggle dust level Low/High and watch yield change ("sensitivity in front of the user").
6. Download the PDF report.

## 5. THE 3 SCRIPTS YOU MUST KNOW VERBATIM

**"Did you build this yourself?"**
"With heavy AI assistance, yes — the concept, the Omani data research and every product decision are mine; AI
wrote most of the code and I reviewed everything end to end. That's how teams my size ship in 2026."

**"The payback is 17 years — who would buy this?"**
"It's honest numbers, not a sales pitch. The economics are driven by high consumers above 4,000 kWh/month and
by non-residential users on the flat 25-baisa tariff; the 14-baisa first tier is among the world's cheapest
power. The real customers are installers using it for lead generation, and awareness partners like Nama — the
homeowner version is the education layer."

**"Walk me through the calculation."**
(Open the results/assumptions cards) "The app documents it better than I can from memory — the assumptions card
lists GHI, temperatures, tariff, usable factor, capacity density, cost per kWp and dust loss. The key physics:
cell temperature follows the NOCT model — about 30°C above ambient — so panels lose ~0.35% per °C over 25°C;
dust accumulates 0.25% a day until cleaning; and I size to demand, not to what the roof can fit."

## 6. IF YOU DON'T KNOW (never freeze)
- "I don't have that memorized — let me show you in the app, it documents itself." (always true — the results
  screen shows every number)
- "That's a fair question. The honest answer is I focused the build on X, and Y is a roadmap item."
- Never invent a formula. Say "I'd have to check the source" and move on.

## 7. WHAT NOT TO SAY
- "It's just a calculator" — no: "a local decision tool aligned with a national target".
- "It's finished" — no: "the core engine is solid; persistence, Arabic UI and battery modelling are next".
- "AI wrote the whole thing" without the "I chose the data and the design" follow-up.

## 8. DATA SOURCES (say these words exactly)
"Oman Solar Atlas and Global Solar Atlas for irradiance · the Authority for Public Services Regulation tariff
effective 1 January 2025 · IEA-based grid intensity for Oman · Esri World Imagery/Mapbox for the map ·
OpenStreetMap for address search."