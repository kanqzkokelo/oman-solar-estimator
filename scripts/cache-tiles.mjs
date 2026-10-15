/**
 * Pre-cache Esri World Imagery tiles for the ISM / Darsait demo zone
 * so the map keeps satellite imagery when offline (school Wi-Fi drop etc.).
 *
 * Zooms 15–17 are cached for a ~2 km² box around the Indian School Muscat
 * campus; zoom 18 (roof-trace detail) for a tight core around the building.
 * Tiles are written to public/tiles/{z}/{x}/{y}.jpg and served by Next.js
 * itself at /tiles/... — no runtime backend needed.
 *
 * Usage: node scripts/cache-tiles.mjs   (required only once, while online)
 */
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "tiles");

const TILE_BASE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile";

const UA = "Mozilla/5.0 (X11; Linux x86_64) oman-solar-estimator-tile-cache/1.0";

const CENTER = { lng: 58.538, lat: 23.6176 }; // Indian School Muscat, Darsait
const FULL_BOX = { lngKm: 0.7, latKm: 0.7 }; // ± → ~2 km² total
const CORE_BOX = { lngKm: 0.25, latKm: 0.25 }; // z18 detail around the campus

/** Zoom ladder: wider coverage at low zoom so every zoom-in step shows
 *  imagery, from the default country view (z5) down to roof detail (z18).
 *  Box is half-extent in km for both axes. */
const ZOOM_PLAN = [
  { z: 5, box: { lngKm: 600, latKm: 600 } },   // ~1–2 tiles: country context
  { z: 6, box: { lngKm: 300, latKm: 300 } },
  { z: 7, box: { lngKm: 150, latKm: 150 } },
  { z: 8, box: { lngKm: 75, latKm: 75 } },
  { z: 9, box: { lngKm: 35, latKm: 35 } },
  { z: 10, box: { lngKm: 16, latKm: 16 } },
  { z: 11, box: { lngKm: 8, latKm: 8 } },
  { z: 12, box: { lngKm: 4, latKm: 4 } },
  { z: 13, box: { lngKm: 2, latKm: 2 } },
  { z: 14, box: { lngKm: 1, latKm: 1 } },
  { z: 15, box: FULL_BOX },
  { z: 16, box: FULL_BOX },
  { z: 17, box: FULL_BOX },
  { z: 18, box: CORE_BOX },
];

const KM_PER_DEG_LNG = (lat) => 111.32 * Math.cos((lat * Math.PI) / 180);
const KM_PER_DEG_LAT = 110.9;

function tileRange(z, box) {
  const dLng = box.lngKm / KM_PER_DEG_LNG(CENTER.lat); // degrees of longitude
  const dLat = box.latKm / KM_PER_DEG_LAT; // degrees of latitude
  const x0 = lngToX(CENTER.lng - dLng, z);
  const x1 = lngToX(CENTER.lng + dLng, z);
  const y0 = latToY(CENTER.lat + dLat, z);
  const y1 = latToY(CENTER.lat - dLat, z);
  return { x0, x1, y0, y1 };
}

function lngToX(lng, z) {
  return Math.floor(((lng + 180) / 360) * 2 ** z);
}
function latToY(lat, z) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z);
}

async function fetchTile(z, x, y) {
  const dest = join(OUT_DIR, String(z), String(x), `${y}.jpg`);
  try {
    await stat(dest);
    return "skip";
  } catch {
    /* not cached yet */
  }
  const url = `${TILE_BASE}/${z}/${y}/${x}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      return "new";
    } catch (err) {
      if (attempt === 3) {
        console.error(`  FAIL ${url}: ${err.message}`);
        return "err";
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

const jobs = [];
for (const { z, box } of ZOOM_PLAN) {
  const { x0, x1, y0, y1 } = tileRange(z, box);
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) jobs.push({ z, x, y });
}

console.log(`Queued ${jobs.length} tiles (zoom ladder z5–18 around ISM)`);
let done = 0;
const counts = { new: 0, skip: 0, err: 0 };
const CONCURRENCY = 6;
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    const result = await fetchTile(job.z, job.x, job.y);
    counts[result]++;
    if (++done % 20 === 0 || done === jobs.length) {
      console.log(`  ${done}/${jobs.length} (new ${counts.new}, skipped ${counts.skip})`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const totalBytes = await (async () => {
  let bytes = 0;
  const dirs = await import("node:fs/promises").then((f) => f.readdir(OUT_DIR).catch(() => []));
  for (const z of dirs) {
    for (const x of await import("node:fs/promises").then((f) => f.readdir(join(OUT_DIR, z)).catch(() => []))) {
      for (const f of await import("node:fs/promises").then((f) => f.readdir(join(OUT_DIR, z, x)).catch(() => []))) {
        bytes += (await stat(join(OUT_DIR, z, x, f))).size;
      }
    }
  }
  return bytes;
})();

console.log(
  `Done: ${counts.new} new, ${counts.skip} skipped, ${counts.err} errors — ${(totalBytes / 1024 / 1024).toFixed(1)} MB in ${OUT_DIR}`
);