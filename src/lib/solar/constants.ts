export interface Governorate {
  key: string;
  name: string;
  /** Average annual Global Horizontal Irradiance, kWh/m²/day (Oman Solar Atlas) */
  ghi: number;
  /**
   * Monthly mean ambient temperatures, °C (Jan–Dec) — long-term climate normals,
   * no weather API required. avgTempC is derived as the mean of this array.
   */
  monthlyTempsC: number[];
  /** Average annual ambient temperature, °C (derived from monthlyTempsC) */
  avgTempC: number;
  lat: number;
  lng: number;
}

interface GovernorateRaw {
  key: string;
  name: string;
  ghi: number;
  monthlyTempsC: number[];
  lat: number;
  lng: number;
}

const RAW_GOVERNORATES: GovernorateRaw[] = [
  {
    key: "muscat",
    name: "Muscat",
    ghi: 5.9,
    monthlyTempsC: [21.3, 22.3, 25.2, 30.2, 34.4, 35.6, 35.9, 34.7, 32.4, 29.7, 25.8, 22.4],
    lat: 23.588,
    lng: 58.3829,
  },
  {
    key: "dhofar",
    name: "Dhofar",
    // Highly seasonal (Khareef monsoon Jun–Sep) — KB doc 05: 1,600–2,200 kWh/m²/yr
    ghi: 6.0,
    monthlyTempsC: [23.4, 24.2, 26.2, 28.6, 29.9, 28.6, 26.8, 26.0, 26.9, 27.9, 26.3, 24.0],
    lat: 17.0151,
    lng: 54.0924,
  },
  {
    key: "al-batinah-north",
    name: "Al Batinah North",
    ghi: 6.0,
    monthlyTempsC: [19.7, 20.8, 23.7, 28.6, 33.4, 35.1, 35.6, 34.2, 32.2, 28.6, 24.5, 20.9],
    lat: 24.3424,
    lng: 56.7299,
  },
  {
    key: "al-batinah-south",
    name: "Al Batinah South",
    ghi: 6.0,
    monthlyTempsC: [18.8, 20.2, 23.4, 28.4, 33.3, 35.4, 35.9, 34.4, 32.2, 28.2, 23.6, 20.0],
    lat: 23.6496,
    lng: 57.7213,
  },
  {
    key: "al-dakhiliyah",
    name: "Al Dakhiliyah",
    ghi: 6.2,
    monthlyTempsC: [18.2, 19.9, 23.3, 28.5, 33.5, 35.4, 35.8, 34.5, 32.5, 28.0, 23.0, 19.3],
    lat: 22.9333,
    lng: 57.5333,
  },
  {
    key: "al-sharqiyah-north",
    name: "Al Sharqiyah North",
    ghi: 6.1,
    monthlyTempsC: [18.5, 20.1, 23.5, 28.6, 33.5, 35.3, 35.7, 34.4, 32.3, 28.1, 23.2, 19.5],
    lat: 22.7358,
    lng: 58.7448,
  },
  {
    key: "al-sharqiyah-south",
    name: "Al Sharqiyah South",
    ghi: 6.1,
    monthlyTempsC: [21.0, 21.9, 24.6, 28.8, 32.8, 34.0, 34.2, 33.1, 31.4, 28.4, 24.6, 21.8],
    lat: 22.5667,
    lng: 59.5289,
  },
  {
    key: "al-dhahirah",
    name: "Al Dhahirah",
    ghi: 6.2,
    monthlyTempsC: [17.2, 19.0, 22.8, 28.2, 33.4, 36.0, 36.6, 35.2, 32.9, 27.8, 22.4, 18.2],
    lat: 23.2257,
    lng: 56.5159,
  },
  {
    key: "al-buraimi",
    name: "Al Buraimi",
    ghi: 6.0,
    monthlyTempsC: [17.0, 18.8, 22.6, 28.0, 33.6, 36.6, 37.6, 36.4, 33.8, 28.4, 22.6, 18.2],
    lat: 24.2509,
    lng: 55.7851,
  },
  {
    key: "musandam",
    name: "Musandam",
    ghi: 5.6,
    monthlyTempsC: [20.4, 21.3, 24.0, 28.7, 32.9, 34.9, 35.4, 34.3, 32.2, 28.4, 24.3, 21.2],
    lat: 26.1991,
    lng: 56.2436,
  },
  {
    key: "al-wusta",
    name: "Al Wusta",
    ghi: 6.3,
    monthlyTempsC: [20.3, 21.5, 24.3, 28.3, 31.3, 31.5, 30.6, 29.6, 29.4, 28.2, 25.0, 21.8],
    lat: 20.0201,
    lng: 57.7436,
  },
];

function meanTemp(temps: number[]): number {
  return Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
}

export const GOVERNORATES: Governorate[] = RAW_GOVERNORATES.map((g) => ({
  ...g,
  avgTempC: meanTemp(g.monthlyTempsC),
}));

export function getGovernorate(key: string): Governorate {
  return GOVERNORATES.find((g) => g.key === key) ?? GOVERNORATES[0];
}

/**
 * Nearest-governorate lookup by coordinates (squared lat/lng distance — fine
 * for coarse assignment from a map trace or search fly-to). Returns a governorate key.
 */
export function nearestGovernorate(lng: number, lat: number): string {
  let bestKey = GOVERNORATES[0].key;
  let bestD = Infinity;
  for (const g of GOVERNORATES) {
    const d = (g.lng - lng) ** 2 + (g.lat - lat) ** 2;
    if (d < bestD) {
      bestD = d;
      bestKey = g.key;
    }
  }
  return bestKey;
}

export type PropertyType = "residential" | "commercial";
export type RoofType = "flat" | "sloped";
export type Orientation =
  | "south"
  | "southeast"
  | "southwest"
  | "east"
  | "west"
  | "mixed";
export type SoilingLevel = "low" | "medium" | "high";
export type TariffSchedule = "primary" | "additional" | "nonResidential";

export const PROPERTY_TYPES: { key: PropertyType; label: string; hint: string }[] = [
  { key: "residential", label: "Home / Villa", hint: "Nama residential tiers" },
  { key: "commercial", label: "Business / Building", hint: "Nama non-residential flat rate" },
];

export const ROOF_TYPES: { key: RoofType; label: string; hint: string }[] = [
  { key: "flat", label: "Flat roof", hint: "Tilted arrays on supports (~8°)" },
  { key: "sloped", label: "Sloped roof", hint: "Follows roof pitch (~15°)" },
];

export const ORIENTATIONS: { key: Orientation; label: string; factor: number }[] = [
  { key: "south", label: "South", factor: 1.0 },
  { key: "southeast", label: "Southeast", factor: 0.97 },
  { key: "southwest", label: "Southwest", factor: 0.97 },
  { key: "east", label: "East", factor: 0.92 },
  { key: "west", label: "West", factor: 0.92 },
  { key: "mixed", label: "Mixed", factor: 0.95 },
];

export const SOILING_LEVELS: { key: SoilingLevel; label: string; cleaningDays: number; hint: string }[] = [
  { key: "low", label: "Low dust", cleaningDays: 30, hint: "Frequent cleaning (~30-day cycle)" },
  { key: "medium", label: "Typical", cleaningDays: 60, hint: "Standard 60-day washing cycle" },
  { key: "high", label: "High dust", cleaningDays: 120, hint: "Rarely cleaned / desert fringes (~120 days)" },
];

/**
 * Fixed system losses (Oman / desert climate).
 * Their product ≈ PR_base 0.85 (15 % combined); calibrated so a flat-roof
 * Muscat system lands at ~1,500 kWh/kWp/yr (conservative vs the 1,650–1,750
 * that well-run real-world systems achieve).
 */
export const SYSTEM_LOSS = {
  inverter: 0.05, // inverter efficiency + MPPT
  wiring: 0.02, // DC/AC wiring
  shading: 0.05, // local shading
  other: 0.038, // mismatch, reflection, mounting hardware
} as const;

/** Panel data (knowledge base, doc 03/04): 2.278 × 1.134 m at 550 Wp */
export const PANEL_WATTAGE = 550; // Wp per panel (N-type TOPCon)
export const PANEL_EFFICIENCY = 0.213; // 21.3% module efficiency
export const PANEL_AREA_M2 = 2.583; // 2.278 m × 1.134 m

/** Thermal model (knowledge base, doc 03) */
export const TEMPERATURE_COEFFICIENT = 0.0035; // -0.35%/°C above 25°C STC
export const NOCT = 45; // °C nominal operating cell temperature
export const IRRADIANCE_AT_CELL_TEMP = 950; // W/m² peak irradiance at the cell

/** Desert dust deposition for the soiling model (doc 03): 0.25%/day */
export const DUST_DEPOSITION_RATE = 0.0025; // per day

/** Sun-facing tilt transposition (doc 03): C_tilt 1.035 at 22° tilt, 1.0 flat */
export const OPTIMAL_TILT_DEG = 22;
export const C_TILT_TILTED = 1.035;
export const C_TILT_FLAT = 1.0;

export const ANALYSIS_YEARS = 25;
export const DEGRADATION_RATE = 0.0055; // 0.55%/yr (doc 04)
export const TARIFF_ESCALATION = 0.02; // 2%/yr
export const O_M_RATE = 0.015; // 1.5% of capex per year (year-1 OPEX, doc 04)
export const OPEX_INFLATION = 0.02; // Omani CPI, OPEX inflates 2%/yr (doc 04)
export const DISCOUNT_RATE = 0.055; // 5.5% financial discount rate (doc 04)

/** Monthly generation shape factors (clear-sky index, normalized to mean 1) */
export const MONTH_GENERATION_FACTORS: number[] = [
  0.86, 0.92, 1.0, 1.06, 1.09, 1.07, 1.03, 1.04, 1.05, 1.0, 0.9, 0.82,
];

/** Residential summer cooling demand shape (normalized to mean 1) */
export const MONTH_DEMAND_FACTORS_RESIDENTIAL: number[] = [
  1.0, 1.0, 1.05, 1.1, 1.25, 1.4, 1.4, 1.35, 1.2, 1.05, 0.95, 0.95,
];

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const DEFAULTS = {
  usableAreaFactor: 0.75,
  /** Equivalent of the KB panel-area sizing: 0.55 kWp / 2.583 m² ≈ 0.21 kWp/m² */
  capacityDensityKwpM2: 0.21,
  /** Turnkey CAPEX baseline 300 OMR/kWp (KB range 250–350) */
  costPerKwpOmr: 300,
  exportRateBaisa: 14, // net-metering credit for exported surplus (tier-1 rate)
  monthlyConsumptionResidential: 3500,
  monthlyConsumptionCommercial: 8000,
};

export function normalizeMean(arr: number[]): number[] {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.map((v) => v / mean);
}
