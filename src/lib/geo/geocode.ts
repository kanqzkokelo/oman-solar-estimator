export interface GeocodeResult {
  placeId: string;
  label: string;
  lng: number;
  lat: number;
  /** Result type from the provider ("city", "poi", "address", "street", …). */
  type?: string;
}

const GEOCODER_URL =
  process.env.NEXT_PUBLIC_GEOCODER_URL ?? "https://nominatim.openstreetmap.org";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** Restricts free providers to a bounding box around Oman to cut global noise. */
const OMAN_BBOX: [number, number, number, number] = [52.0, 16.5, 60.5, 26.6];

async function searchMapbox(q: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const token = MAPBOX_TOKEN;
  if (!token) return [];
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json` +
    `?country=om&limit=8&fuzzyMatch=true&routing=false&access_token=${token}`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      features?: Array<{
        id: string;
        place_name: string;
        center: [number, number];
        place_type?: string[];
      }>;
    };
    return (data.features ?? []).map((f) => ({
      placeId: f.id,
      label: f.place_name,
      lng: f.center[0],
      lat: f.center[1],
      type: f.place_type?.[0],
    }));
  } catch {
    return [];
  }
}

async function searchNominatim(q: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = `${GEOCODER_URL}/search?format=jsonv2&limit=8&countrycodes=om&addressdetails=0&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: "application/json", "User-Agent": "oman-rooftop-solar-estimator/1.0" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      lon: string;
      lat: string;
      type?: string;
    }>;
    return data.map((d) => ({
      placeId: String(d.place_id),
      label: d.display_name.split(",").slice(0, 3).join(","),
      lng: parseFloat(d.lon),
      lat: parseFloat(d.lat),
      type: d.type,
    }));
  } catch {
    return [];
  }
}

async function searchPhoton(q: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en&bbox=${OMAN_BBOX.join(",")}`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      features?: Array<{
        properties: {
          osm_id: number;
          osm_type?: string;
          name?: string;
          type?: string;
          street?: string;
          city?: string;
          state?: string;
          country?: string;
          countrycode?: string;
        };
        geometry: { coordinates: [number, number] };
      }>;
    };
    return (data.features ?? [])
      .filter((f) => f.properties.countrycode === "OM")
      .map((f) => ({
        placeId: `${f.properties.osm_type ?? ""}-${f.properties.osm_id}`,
        label: [f.properties.name, f.properties.street, f.properties.city, f.properties.state]
          .filter(Boolean)
          .join(", "),
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        type: f.properties.type,
      }));
  } catch {
    return [];
  }
}

export async function searchOman(q: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  if (!q.trim()) return [];
  const mapboxResults = await searchMapbox(q, signal);
  if (mapboxResults.length > 0) return mapboxResults;
  const photonResults = await searchPhoton(q, signal);
  if (photonResults.length > 0) return photonResults;
  return searchNominatim(q, signal);
}

export async function reverseOman(lng: number, lat: number): Promise<string | null> {
  const token = MAPBOX_TOKEN;
  if (token) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as { features?: Array<{ place_name?: string }> };
        if (data.features?.[0]?.place_name) return data.features[0].place_name;
      }
    } catch {
      /* fall through to Nominatim */
    }
  }
  const url = `${GEOCODER_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "oman-rooftop-solar-estimator/1.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}
