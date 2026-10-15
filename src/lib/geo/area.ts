/**
 * Geodesic polygon area in square metres.
 * Standard spherical-excess algorithm (same method as turf.area).
 */
const EARTH_RADIUS_M = 6378137;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Accepts GeoJSON position pairs [lng, lat]. Returns area in m². */
export function geodesicArea(positions: [number, number][]): number {
  if (positions.length < 3) return 0;
  let total = 0;
  const n = positions.length;
  for (let i = 0; i < n; i++) {
    const p1 = positions[i];
    const p2 = positions[(i + 1) % n];
    const p3 = positions[(i + 2) % n];
    total +=
      (toRadians(p3[0]) - toRadians(p1[0])) *
      (2 + Math.sin(toRadians(p1[1])) + Math.sin(toRadians(p2[1])));
  }
  return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

/** Planimetric (EPSG:3857-ish local approximation) area for small polygons. */
export function planarArea(positions: [number, number][]): number {
  if (positions.length < 3) return 0;
  const toMeters = (lng: number, lat: number): [number, number] => [
    lng * 111320 * Math.cos(toRadians(lat)),
    lat * 110540,
  ];
  let area = 0;
  const n = positions.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = toMeters(positions[i][0], positions[i][1]);
    const [x2, y2] = toMeters(positions[(i + 1) % n][0], positions[(i + 1) % n][1]);
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}
