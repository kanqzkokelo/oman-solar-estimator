"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { geodesicArea } from "@/lib/geo/area";
import { searchOman, type GeocodeResult } from "@/lib/geo/geocode";
import { DEFAULTS, getGovernorate, nearestGovernorate } from "@/lib/solar/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const BASE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    "satellite-local": {
      type: "raster",
      tiles: ["/tiles/{z}/{x}/{y}.jpg"],
      tileSize: 256,
      maxzoom: 18,
    },
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Tiles © Esri — Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#17222f" } },
    { id: "satellite-local", type: "raster", source: "satellite-local" },
    { id: "satellite", type: "raster", source: "satellite" },
  ],
};

const MAPBOX_STYLE_URL = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9?access_token=${MAPBOX_TOKEN}`;

type LngLat = [number, number];

const QUICK_PLACES = [
  { key: "muscat", en: "Muscat", ar: "مسقط", lng: 58.3829, lat: 23.588, zoom: 12 },
  { key: "dhofar", en: "Salalah", ar: "صلالة", lng: 54.0924, lat: 17.0151, zoom: 12 },
  { key: "batinah_north", en: "Sohar", ar: "صحار", lng: 56.7299, lat: 24.3424, zoom: 12 },
  { key: "dakhiliyah", en: "Nizwa", ar: "نزوى", lng: 57.5333, lat: 22.9333, zoom: 12 },
  { key: "sharqiyah_south", en: "Sur", ar: "صور", lng: 59.5289, lat: 22.5667, zoom: 12 },
  { key: "dhahirah", en: "Ibri", ar: "عبري", lng: 56.5159, lat: 23.2257, zoom: 12 },
];

const SAMPLE_POLYGON: LngLat[] = [
  [58.53781, 23.61759],
  [58.53826, 23.61759],
  [58.53826, 23.61768],
  [58.53781, 23.61768],
];

const OMAN_BOUNDS: [[number, number], [number, number]] = [
  [52.0, 16.5],
  [60.5, 26.6],
];

/** Decelerate-in camera landing — arrives and stops, matching the UI springs. */
const flyEase = (t: number) => 1 - Math.pow(1 - t, 4);

export function RoofMap({
  area,
  onAreaChange,
  governorate,
  onGovernorateChange,
}: {
  area: number;
  onAreaChange: (m2: number) => void;
  governorate?: string;
  onGovernorateChange?: (key: string) => void;
}) {
  const { t, isAr, fmtInt, fmtM2 } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [webglError, setWebglError] = useState(false);

  // drawing state
  const drawingRef = useRef(false);
  const polygonRef = useRef<LngLat[]>([]);
  const verticesRef = useRef<LngLat[]>([]);
  const cursorRef = useRef<LngLat | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [vertexCount, setVertexCount] = useState(0);
  const [areaM2, setAreaM2] = useState(0);

  // search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // governorate detection
  const [govKey, setGovKey] = useState<string | null>(null);

  const detectGovernorate = useCallback(
    (lng: number, lat: number) => {
      const key = nearestGovernorate(lng, lat);
      setGovKey(key);
      onGovernorateChange?.(key);
    },
    [onGovernorateChange]
  );

  const commitPolygon = useCallback(
    (pts: LngLat[]) => {
      const a = geodesicArea(pts);
      polygonRef.current = pts;
      setAreaM2(a);
      onAreaChange(a);
      if (pts.length) {
        const c = pts.reduce(
          (acc, p) => [acc[0] + p[0], acc[1] + p[1]] as [number, number],
          [0, 0] as [number, number]
        );
        detectGovernorate(c[0] / pts.length, c[1] / pts.length);
      }
    },
    [onAreaChange, detectGovernorate]
  );

  const syncLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const src = (id: string) => map.getSource(id) as GeoJSONSource | undefined;
    const polygon = polygonRef.current;
    const drawingNow = drawingRef.current;

    const polygonCoords = polygon.length >= 3 ? [[...polygon, polygon[0]]] : [];

    src("polygon")?.setData({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: polygonCoords,
      },
      properties: {},
    });
    src("polygon-verts")?.setData({
      type: "FeatureCollection",
      features: polygon.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: p },
        properties: {},
      })),
    });

    const preview = drawingNow && verticesRef.current.length > 0
      ? [...verticesRef.current, ...(cursorRef.current ? [cursorRef.current] : [])]
      : [];
    const previewCoords = preview.length >= 2 ? preview : [];

    src("preview-line")?.setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: previewCoords,
      },
      properties: {},
    });
    src("preview-verts")?.setData({
      type: "FeatureCollection",
      features: verticesRef.current.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: p },
        properties: {},
      })),
    });
  }, []);

  const startDrawing = useCallback(() => {
    drawingRef.current = true;
    verticesRef.current = [];
    cursorRef.current = null;
    setVertexCount(0);
    setDrawing(true);
    syncLayers();
  }, [syncLayers]);

  const cancelDrawing = useCallback(() => {
    drawingRef.current = false;
    verticesRef.current = [];
    cursorRef.current = null;
    setVertexCount(0);
    setDrawing(false);
    syncLayers();
  }, [syncLayers]);

  const finishDrawing = useCallback(() => {
    if (verticesRef.current.length < 3) {
      cancelDrawing();
      return;
    }
    drawingRef.current = false;
    commitPolygon(verticesRef.current);
    setDrawing(false);
    const map = mapRef.current;
    if (map) {
      const coords = verticesRef.current;
      const bounds = coords.reduce(
        (b, [lng, lat]) => b.extend([lng, lat]),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 40, duration: 500 });
    }
    syncLayers();
  }, [cancelDrawing, commitPolygon, syncLayers]);

  const undoVertex = useCallback(() => {
    verticesRef.current = verticesRef.current.slice(0, -1);
    setVertexCount(verticesRef.current.length);
    syncLayers();
  }, [syncLayers]);

  const clearAll = useCallback(() => {
    cancelDrawing();
    polygonRef.current = [];
    setAreaM2(0);
    onAreaChange(0);
  }, [cancelDrawing, onAreaChange]);

  const loadSample = useCallback(() => {
    cancelDrawing();
    polygonRef.current = [];
    setAreaM2(0);
    onAreaChange(0);
    const map = mapRef.current;
    if (map) {
      map.flyTo({ center: [58.538, 23.6176], zoom: 17.5, essential: true, easing: flyEase });
      detectGovernorate(58.538, 23.6176);
    }
    syncLayers();
  }, [cancelDrawing, onAreaChange, detectGovernorate, syncLayers]);

  const flyTo = useCallback(
    (lng: number, lat: number, zoom = 15) => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({ center: [lng, lat], zoom, essential: true, easing: flyEase });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new maplibregl.Marker({ color: "#2c7f3b" }).setLngLat([lng, lat]).addTo(map);
      detectGovernorate(lng, lat);
    },
    [detectGovernorate]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAPBOX_TOKEN ? MAPBOX_STYLE_URL : BASE_STYLE,
        center: [56.2, 21.2],
        zoom: 5.6,
        minZoom: 4.5,
        maxBounds: OMAN_BOUNDS,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch (err) {
      console.warn("MapLibre WebGL initialization error:", err);
      setWebglError(true);
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );

    map.on("error", () => {
      // Suppress unhandled tile/network error overlays in MapLibre
    });

    map.on("load", () => {
      try {
        if (!map.getSource("satellite-local")) {
          map.addSource("satellite-local", {
            type: "raster",
            tiles: ["/tiles/{z}/{x}/{y}.jpg"],
            tileSize: 256,
            maxzoom: 18,
          });
          try {
            map.addLayer({ id: "satellite-local", type: "raster", source: "satellite-local" }, "satellite");
          } catch {
            map.addLayer({ id: "satellite-local", type: "raster", source: "satellite-local" });
          }
        }
      } catch {
        /* style fallback */
      }

      const sources: Array<{ id: string; data: unknown; layers: any[] }> = [
        {
          id: "polygon",
          data: { type: "Feature", geometry: { type: "Polygon", coordinates: [[]] }, properties: {} },
          layers: [
            { id: "polygon-fill", type: "fill", source: "polygon", paint: { "fill-color": "#0284c7", "fill-opacity": 0.48 } },
            { id: "polygon-outline", type: "line", source: "polygon", paint: { "line-color": "#38bdf8", "line-width": 3 } },
          ],
        },
        {
          id: "polygon-verts",
          data: { type: "FeatureCollection", features: [] },
          layers: [
            { id: "polygon-verts-layer", type: "circle", source: "polygon-verts", paint: { "circle-radius": 5, "circle-color": "#0284c7", "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" } },
          ],
        },
        {
          id: "preview-line",
          data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
          layers: [
            { id: "preview-line-layer", type: "line", source: "preview-line", paint: { "line-color": "#f59e0b", "line-width": 2, "line-dasharray": [2, 1.5] } },
          ],
        },
        {
          id: "preview-verts",
          data: { type: "FeatureCollection", features: [] },
          layers: [
            { id: "preview-verts-layer", type: "circle", source: "preview-verts", paint: { "circle-radius": 4, "circle-color": "#f59e0b", "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" } },
          ],
        },
      ];

      for (const s of sources) {
        map.addSource(s.id, { type: "geojson", data: s.data as any });
        for (const l of s.layers) map.addLayer(l);
      }

      setMapReady(true);
      map.resize();
    });

    map.on("click", (e) => {
      if (!drawingRef.current) return;
      verticesRef.current = [...verticesRef.current, [e.lngLat.lng, e.lngLat.lat]];
      setVertexCount(verticesRef.current.length);
      syncLayers();
    });

    map.on("mousemove", (e) => {
      if (!drawingRef.current) return;
      cursorRef.current = [e.lngLat.lng, e.lngLat.lat];
      syncLayers();
    });

    map.on("dblclick", (e) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      finishDrawing();
    });

    map.on("contextmenu", (e) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      cancelDrawing();
    });

    map.on("mouseenter", () => {
      if (drawingRef.current) map.getCanvas().style.cursor = "crosshair";
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    syncLayers();
  }, [syncLayers, drawing, vertexCount, areaM2]);

  useEffect(() => {
    if (governorate) setGovKey(governorate);
  }, [governorate]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const tTimer = setTimeout(async () => {
      const r = await searchOman(q, controller.signal);
      if (controller.signal.aborted) return;
      setResults(r);
      setSearching(false);
      setSearchOpen(true);
    }, 450);
    return () => {
      clearTimeout(tTimer);
      controller.abort();
    };
  }, [query]);

  const usable = areaM2 * DEFAULTS.usableAreaFactor;
  const panels = Math.floor((usable * DEFAULTS.capacityDensityKwpM2 * 1000) / 550);

  const getGovName = (key: string) => {
    const g = getGovernorate(key);
    switch (g.key) {
      case "muscat": return t("govMuscat");
      case "dhofar": return t("govDhofar");
      case "al-batinah-north": return t("govBatinahNorth");
      case "al-batinah-south": return t("govBatinahSouth");
      case "al-dakhiliyah": return t("govDakhiliyah");
      case "al-sharqiyah-north": return t("govSharqiyahNorth");
      case "al-sharqiyah-south": return t("govSharqiyahSouth");
      case "al-dhahirah": return t("govDhahirah");
      case "al-buraimi": return t("govBuraimi");
      case "musandam": return t("govMusandam");
      case "al-wusta": return t("govWusta");
      default: return g.name;
    }
  };

  if (webglError) {
    return (
      <div className="relative flex h-[420px] w-full flex-col items-center justify-center rounded-2xl border border-dune-200 bg-dune-900 p-6 text-center shadow-soft dark:border-dune-800 sm:h-[500px]">
        <div className="mx-auto max-w-md space-y-4">
          <span className="inline-block rounded-full bg-solar-500/20 px-3 py-1 text-xs font-semibold text-solar-300">
            {isAr ? "الخريطة التفاعلية غير متاحة" : "Interactive Map Fallback"}
          </span>
          <h3 className="text-lg font-bold text-white">
            {isAr ? "عذراً، تسريع WebGL غير مفعل على هذا الجهاز" : "WebGL is unavailable on this device"}
          </h3>
          <p className="text-xs leading-relaxed text-dune-300">
            {isAr
              ? "يمكنك إدخال مساحة سقفك التقديرية بالـ (م²) مباشرة أدناه أو اختيار إحدى المساحات النموذجية لمتابعة التقييم."
              : "No problem! You can enter your estimated rooftop area in m² directly below or click a preset to proceed."}
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min={20}
                max={50000}
                value={areaM2 > 0 ? areaM2 : ""}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  setAreaM2(val);
                  onAreaChange(val);
                }}
                placeholder={isAr ? "أدخل مساحة السقف (م²)" : "Enter roof area (m²)"}
                className="input-base text-center text-sm font-bold max-w-[200px]"
              />
              <span className="text-xs font-semibold text-dune-300">m²</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: isAr ? "150 م² (فيلا صغيرة)" : "150 m² (Villa)", val: 150 },
                { label: isAr ? "300 م² (منزل كبير)" : "300 m² (Home)", val: 300 },
                { label: isAr ? "600 م² (مبنى سكني)" : "600 m² (Building)", val: 600 },
                { label: isAr ? "1200 م² (مؤسسة تجارية)" : "1200 m² (Commercial)", val: 1200 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => {
                    setAreaM2(p.val);
                    onAreaChange(p.val);
                  }}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    areaM2 === p.val
                      ? "border-leaf-400 bg-leaf-950 text-leaf-300"
                      : "border-dune-700 bg-dune-800 text-dune-200 hover:border-dune-600"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-dune-200/60 shadow-soft dark:border-dune-800">
      <div ref={containerRef} className="h-[420px] w-full sm:h-[500px]" />

      {/* Search bar */}
      <div className={`absolute top-3 z-10 w-[calc(100%-24px)] max-w-sm ${isAr ? "right-3" : "left-3"}`}>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            placeholder={t("mapSearchPlaceholder")}
            className={`input-base !rounded-xl border-dune-300/70 shadow-soft ${isAr ? "pl-9 pr-3 text-right" : "pr-9 pl-3 text-left"}`}
          />
          <span className={`absolute top-1/2 -translate-y-1/2 text-dune-400 ${isAr ? "left-3" : "right-3"}`}>
            {searching ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-dune-300 border-t-leaf-500" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            )}
          </span>
        </div>
        {searchOpen && results.length > 0 && (
          <ul className="card mt-1 max-h-56 overflow-y-auto !rounded-xl p-1">
            {results.map((r) => (
              <li key={r.placeId}>
                <button
                  className={`w-full rounded-lg px-3 py-2 text-xs text-dune-700 hover:bg-leaf-50 dark:text-dune-200 dark:hover:bg-dune-800 ${isAr ? "text-right" : "text-left"}`}
                  onMouseDown={() => {
                    flyTo(r.lng, r.lat);
                    setSearchOpen(false);
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick places */}
      <div className={`absolute top-14 z-10 flex max-w-[calc(100%-24px)] flex-wrap gap-1.5 ${isAr ? "right-3" : "left-3"}`}>
        {QUICK_PLACES.map((p) => (
          <button
            key={p.key}
            onClick={() => flyTo(p.lng, p.lat)}
            className="rounded-full border border-dune-200/70 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-dune-700 shadow-soft backdrop-blur transition hover:bg-leaf-50 dark:border-dune-700 dark:bg-dune-900/90 dark:text-dune-200 dark:hover:bg-dune-800"
          >
            {isAr ? p.ar : p.en}
          </button>
        ))}
      </div>

      {/* Draw toolbar */}
      <div className={`absolute bottom-3 z-10 flex flex-wrap items-center gap-2 ${isAr ? "right-3" : "left-3"}`}>
        {!drawing ? (
          <>
            <button onClick={startDrawing} className="btn-accent !px-4 !py-2 !text-xs shadow-soft">
              {t("traceRoofBtn")}
            </button>
            <button
              onClick={loadSample}
              className="rounded-xl border border-dune-200/70 bg-white/90 px-3.5 py-2 text-xs font-semibold text-dune-700 shadow-soft backdrop-blur transition hover:bg-dune-50 dark:border-dune-700 dark:bg-dune-900/90 dark:text-dune-200"
            >
              {t("demoRoofBtn")}
            </button>
            {areaM2 > 0 && (
              <button
                onClick={clearAll}
                className="rounded-xl border border-red-200/70 bg-white/90 px-3.5 py-2 text-xs font-semibold text-red-600 shadow-soft backdrop-blur transition hover:bg-red-50 dark:border-red-900 dark:bg-dune-900/90 dark:text-red-400"
              >
                {t("clearBtn")}
              </button>
            )}
          </>
        ) : (
          <>
            <span className="rounded-xl bg-dune-950/85 px-3.5 py-2 text-xs font-medium text-white shadow-soft backdrop-blur">
              {t("tracingInProgress")}
            </span>
            <button
              onClick={undoVertex}
              disabled={vertexCount === 0}
              className="rounded-xl border border-dune-200/70 bg-white/90 px-3.5 py-2 text-xs font-semibold text-dune-700 shadow-soft backdrop-blur transition hover:bg-dune-50 disabled:opacity-40 dark:border-dune-700 dark:bg-dune-900/90 dark:text-dune-200"
            >
              {t("undoBtn")} ({vertexCount})
            </button>
            <button
              onClick={finishDrawing}
              disabled={vertexCount < 3}
              className="btn-primary !px-4 !py-2 !text-xs shadow-soft disabled:opacity-40"
            >
              {t("finishPolygonBtn")}
            </button>
            <button
              onClick={cancelDrawing}
              className="rounded-xl border border-dune-200/70 bg-white/90 px-3.5 py-2 text-xs font-semibold text-dune-700 shadow-soft backdrop-blur transition hover:bg-dune-50 dark:border-dune-700 dark:bg-dune-900/90 dark:text-dune-200"
            >
              {t("cancelBtn")}
            </button>
          </>
        )}
      </div>

      {/* Area readout */}
      {(areaM2 > 0 || drawing || govKey) && (
        <div className={`absolute bottom-3 z-10 rounded-xl bg-dune-950/85 px-4 py-2.5 shadow-soft backdrop-blur ${isAr ? "left-3 text-left" : "right-3 text-right"}`}>
          {drawing && areaM2 === 0 ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-dune-400">{t("tracingInProgress")}</p>
              <p className="text-xs text-dune-200">
                {vertexCount} {t("cornersPlaced")}
              </p>
            </>
          ) : areaM2 > 0 ? (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-dune-400">{t("rooftopAreaLabel")}</p>
              <p className="text-lg font-bold leading-tight text-solar-300">{fmtM2(areaM2)}</p>
              <p className="text-[11px] text-dune-300">
                {t("usableApprox")} {fmtInt(usable)} m² · ≈ {Math.max(0, panels)} {t("panelsApprox")}
              </p>
            </>
          ) : null}
          {govKey && (
            <p className="mt-1 border-t border-white/10 pt-1 text-[11px] font-medium text-leaf-300">
              📍 {getGovName(govKey)}
            </p>
          )}
        </div>
      )}

      {!mapReady && (
        <div className="absolute inset-0 z-0 grid place-items-center bg-dune-100 dark:bg-dune-900">
          <div className="text-center">
            <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-leaf-500 border-t-transparent" />
            <p className="mt-3 text-xs font-medium text-dune-500 dark:text-dune-400">{t("loadingSatellite")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
