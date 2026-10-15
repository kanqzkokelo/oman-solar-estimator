import {
  ANALYSIS_YEARS,
  C_TILT_FLAT,
  C_TILT_TILTED,
  DEGRADATION_RATE,
  DEFAULTS,
  DISCOUNT_RATE,
  DUST_DEPOSITION_RATE,
  IRRADIANCE_AT_CELL_TEMP,
  MONTH_GENERATION_FACTORS,
  MONTH_DEMAND_FACTORS_RESIDENTIAL,
  MONTH_NAMES,
  NOCT,
  O_M_RATE,
  OPEX_INFLATION,
  OPTIMAL_TILT_DEG,
  ORIENTATIONS,
  PANEL_WATTAGE,
  SOILING_LEVELS,
  SYSTEM_LOSS,
  TARIFF_ESCALATION,
  TEMPERATURE_COEFFICIENT,
  getGovernorate,
  normalizeMean,
  type Orientation,
  type PropertyType,
  type RoofType,
  type SoilingLevel,
  type TariffSchedule,
} from "./constants";
import { billFor } from "./tariffs";

export interface SolarInputs {
  roofAreaM2: number;
  propertyType: PropertyType;
  governorate: string;
  roofType: RoofType;
  orientation: Orientation;
  monthlyConsumptionKwh: number;
  tariffSchedule: TariffSchedule;
  soiling: SoilingLevel;
  netMetering: boolean;
  // advanced / configurable
  usableAreaFactor: number;
  capacityDensityKwpM2: number;
  panelWattage: number;
  costPerKwpOmr: number;
  exportRateOmr: number;
  gridEmissionFactor: number; // tCO2/MWh
  tariffEscalation: number;
  analysisYears: number;
}

export interface LossBreakdown {
  temperaturePct: number;
  soilingPct: number;
  inverterPct: number;
  wiringPct: number;
  shadingPct: number;
  otherPct: number;
  totalPct: number;
}

export interface MonthlyPoint {
  month: string;
  index: number;
  generationKwh: number;
  consumptionKwh: number;
  tempC: number;
  temperatureLossPct: number;
  billWithoutOmr: number;
  billWithOmr: number;
  savingsOmr: number;
}

export interface YearlyPoint {
  year: number;
  generationKwh: number;
  savingsOmr: number;
  cumulativeSavingsOmr: number;
  co2AvoidedTons: number;
}

export interface SolarEstimate {
  inputs: SolarInputs;
  grossAreaM2: number;
  usableAreaM2: number;
  roofPotentialKwp: number;
  recommendedKwp: number;
  panels: number;
  panelWattage: number;
  orientationFactor: number;
  tiltDeg: number;
  specificYieldKwhPerKwp: number;
  performanceRatio: number;
  losses: LossBreakdown;
  annualGenerationKwh: number;
  monthly: MonthlyPoint[];
  yearly: YearlyPoint[];
  annualBillWithoutOmr: number;
  annualBillWithOmr: number;
  annualSavingsOmr: number;
  energySelfSufficiencyPct: number;
  capexOmr: number;
  omPerYearOmr: number;
  simplePaybackYears: number;
  npvOmr: number;
  roiPct: number;
  cumulative25SavingsOmr: number;
  lcoeOmrPerKwh: number;
  co2PerYearTons: number;
  co2OverLifeTons: number;
  treesEquivalent: number;
  carsEquivalent: number;
  sdg7Pct: number;
  sdg11Pct: number;
  netZero2050Pct: number;
  oversizedNote: string | null;
}

// Env overrides (static refs so Next.js inlines NEXT_PUBLIC_* into the client bundle)
function envNum(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

const ENV_GRID_EMISSION_FACTOR = envNum(
  process.env.NEXT_PUBLIC_GRID_EMISSION_FACTOR,
  0.65,
  0,
  1
);
const ENV_COST_PER_KWP = envNum(process.env.NEXT_PUBLIC_COST_PER_KWP, DEFAULTS.costPerKwpOmr, 100, 3000);

export const DEFAULT_INPUTS: SolarInputs = {
  roofAreaM2: 0,
  propertyType: "residential",
  governorate: "muscat",
  roofType: "flat",
  orientation: "south",
  monthlyConsumptionKwh: DEFAULTS.monthlyConsumptionResidential,
  tariffSchedule: "primary",
  soiling: "medium",
  netMetering: true,
  usableAreaFactor: DEFAULTS.usableAreaFactor,
  capacityDensityKwpM2: DEFAULTS.capacityDensityKwpM2,
  panelWattage: PANEL_WATTAGE,
  costPerKwpOmr: ENV_COST_PER_KWP,
  exportRateOmr: DEFAULTS.exportRateBaisa / 1000,
  gridEmissionFactor: ENV_GRID_EMISSION_FACTOR,
  tariffEscalation: TARIFF_ESCALATION,
  analysisYears: ANALYSIS_YEARS,
};

export function estimateSolar(inputs: SolarInputs): SolarEstimate {
  const gov = getGovernorate(inputs.governorate);
  const years = Math.max(1, Math.round(inputs.analysisYears));
  const orientationFactor =
    ORIENTATIONS.find((o) => o.key === inputs.orientation)?.factor ?? 1;

  // ---------- System sizing ----------
  const usableAreaM2 = Math.max(0, inputs.roofAreaM2 * inputs.usableAreaFactor);
  const roofPotentialKwp = usableAreaM2 * inputs.capacityDensityKwpM2;

  // Tilt / orientation gain (KB doc 03): C_tilt = 1.035 at the 22° optimal tilt,
  // 1.0 for flat installations, multiplied by the south-facing orientation factor.
  const tiltDeg = inputs.roofType === "sloped" ? OPTIMAL_TILT_DEG : 8;
  const tiltFactor =
    (inputs.roofType === "sloped" ? C_TILT_TILTED : C_TILT_FLAT) * orientationFactor;

  // ---------- Losses ----------
  // NOCT cell-temperature model (KB doc 03):
  //   T_cell = T_amb + (NOCT − 20°C)/800 · GHI_inst
  //   f_temp = 1 + γ·(T_cell − 25°C),  γ = −0.35%/°C
  // Monthly climate normals per governorate (no weather API needed).
  const cellTempRise = ((NOCT - 20) / 800) * IRRADIANCE_AT_CELL_TEMP;
  const monthlyThermalFactor = gov.monthlyTempsC.map((tAmb) =>
    Math.max(0, 1 - TEMPERATURE_COEFFICIENT * (tAmb + cellTempRise - 25))
  );
  const monthlyTemperaturePct = monthlyThermalFactor.map((f) => Math.max(0, 1 - f));
  const annualTemperaturePct = Math.max(
    0,
    1 - monthlyThermalFactor.reduce((a, b) => a + b, 0) / monthlyThermalFactor.length
  );

  // Desert dust soiling (KB doc 03): f_soiling = 1 − r_dust·t_clean/2, r = 0.25%/day.
  // Standard 60-day cleaning cycle → 7.5% mean soiling loss.
  const cleaningDays =
    SOILING_LEVELS.find((s) => s.key === inputs.soiling)?.cleaningDays ?? 60;
  const soilingPct = Math.min(0.3, (DUST_DEPOSITION_RATE * cleaningDays) / 2);

  const fixedLossProduct = [SYSTEM_LOSS.inverter, SYSTEM_LOSS.wiring, SYSTEM_LOSS.shading, SYSTEM_LOSS.other].reduce(
    (acc, l) => acc * (1 - l),
    1
  );
  const annualLossFactors = [annualTemperaturePct, soilingPct, SYSTEM_LOSS.inverter, SYSTEM_LOSS.wiring, SYSTEM_LOSS.shading, SYSTEM_LOSS.other];
  const totalPct = 1 - annualLossFactors.reduce((acc, l) => acc * (1 - l), 1);

  // ---------- Yield (KB master equation: E_AC = A·f_active·η·GHI·C_tilt·PR) ----------
  const annualPoaKwhM2 = gov.ghi * 365 * tiltFactor;
  const performanceRatio = annualLossFactors.reduce((acc, l) => acc * (1 - l), 1);
  const specificYieldKwhPerKwp = annualPoaKwhM2 * performanceRatio;

  // Size recommendation: roof potential vs demand (matched to annual usage)
  const demandKwp = (inputs.monthlyConsumptionKwh * 12) / specificYieldKwhPerKwp;
  const recommendedKwp = Math.min(roofPotentialKwp, demandKwp);
  const oversizedNote =
    roofPotentialKwp > demandKwp
      ? `Your roof can host up to ${roofPotentialKwp.toFixed(1)} kWp, but we recommend ${recommendedKwp.toFixed(1)} kWp to match your annual consumption — avoid paying for unused capacity.`
      : null;

  const panelWattage = inputs.panelWattage || PANEL_WATTAGE;
  const panels = Math.max(0, Math.round((recommendedKwp * 1000) / panelWattage));
  const systemKwp = (panels * panelWattage) / 1000;

  // ---------- Monthly profile ----------
  const genFactors = normalizeMean(MONTH_GENERATION_FACTORS);
  const demandFactors =
    inputs.propertyType === "residential"
      ? normalizeMean(MONTH_DEMAND_FACTORS_RESIDENTIAL)
      : Array(12).fill(1);

  const annualGenerationKwh = systemKwp * specificYieldKwhPerKwp;

  // Monthly generation = annual/12 × clear-sky shape × (monthly PR / annual PR),
  // so each month carries its own seasonal heat loss, then re-normalised to the
  // reported annual total.
  const monthlyPR = monthlyThermalFactor.map((f) => fixedLossProduct * (1 - soilingPct) * f);
  const annualPR = performanceRatio;
  const rawMonthlyGen = MONTH_NAMES.map((_, i) => (annualGenerationKwh / 12) * genFactors[i] * (monthlyPR[i] / annualPR));
  const rawGenSum = rawMonthlyGen.reduce((a, b) => a + b, 0);
  const genScale = rawGenSum > 0 ? annualGenerationKwh / rawGenSum : 1;

  const monthly = MONTH_NAMES.map((name, i) => {
    const generationKwh = rawMonthlyGen[i] * genScale;
    const consumptionKwh = inputs.monthlyConsumptionKwh * demandFactors[i];
    const billWithoutOmr = billFor(consumptionKwh, inputs.tariffSchedule, i);

    let billWithOmr: number;
    if (inputs.netMetering && generationKwh >= consumptionKwh) {
      billWithOmr = 0; // fully covered, surplus credited separately below
    } else {
      const offset = Math.min(generationKwh, consumptionKwh);
      billWithOmr = billFor(consumptionKwh - offset, inputs.tariffSchedule, i);
    }
    // Surplus export credit at configured export rate
    const surplusKwh = Math.max(0, generationKwh - consumptionKwh);
    const exportCredit = inputs.netMetering ? surplusKwh * inputs.exportRateOmr : 0;
    billWithOmr = Math.max(0, billWithOmr - exportCredit);

    return {
      month: name,
      index: i,
      generationKwh,
      consumptionKwh,
      tempC: gov.monthlyTempsC[i],
      temperatureLossPct: monthlyTemperaturePct[i],
      billWithoutOmr,
      billWithOmr,
      savingsOmr: billWithoutOmr - billWithOmr,
    };
  });

  const annualBillWithoutOmr = monthly.reduce((a, m) => a + m.billWithoutOmr, 0);
  const annualBillWithOmr = monthly.reduce((a, m) => a + m.billWithOmr, 0);
  const annualSavingsOmr = annualBillWithoutOmr - annualBillWithOmr;
  const energySelfSufficiencyPct =
    inputs.monthlyConsumptionKwh > 0
      ? Math.min(100, (annualGenerationKwh / (inputs.monthlyConsumptionKwh * 12)) * 100)
      : 0;

  // ---------- Financials (KB doc 04) ----------
  // CAPEX = P_DC × 300 OMR/kWp; OPEX_t = CAPEX × 1.5% × (1 + 2% CPI)^(t−1);
  // savings discounted at the 5.5% Omani market rate for NPV.
  const capexOmr = systemKwp * inputs.costPerKwpOmr;
  const omPerYearOmr = capexOmr * O_M_RATE; // year-1 O&M (escalates via OPEX_INFLATION)

  const yearly: YearlyPoint[] = [];
  let cumulativeSavingsOmr = 0;
  let npvOmr = -capexOmr;
  let paybackYears: number | null = null;
  let opexSum = 0;

  for (let y = 1; y <= years; y++) {
    const genFactor = Math.pow(1 - DEGRADATION_RATE, y - 1);
    const priceFactor = Math.pow(1 + inputs.tariffEscalation, y - 1);
    const opexY = capexOmr * O_M_RATE * Math.pow(1 + OPEX_INFLATION, y - 1);
    const genKwh = annualGenerationKwh * genFactor;
    const savingsOmr = Math.max(0, annualSavingsOmr * genFactor * priceFactor - opexY);
    cumulativeSavingsOmr += savingsOmr;
    npvOmr += savingsOmr / Math.pow(1 + DISCOUNT_RATE, y);
    opexSum += opexY;

    // Interpolated simple payback: year when cumulative net cash flow ≥ CAPEX.
    if (paybackYears === null && cumulativeSavingsOmr >= capexOmr) {
      const prev = cumulativeSavingsOmr - savingsOmr;
      paybackYears =
        y - 1 + (capexOmr - prev) / Math.max(1e-9, cumulativeSavingsOmr - prev);
    }

    yearly.push({
      year: y,
      generationKwh: genKwh,
      savingsOmr,
      cumulativeSavingsOmr,
      co2AvoidedTons: (genKwh / 1000) * inputs.gridEmissionFactor,
    });
  }

  const totalEnergyKwh = yearly.reduce((a, y) => a + y.generationKwh, 0);
  const totalSavings = yearly.reduce((a, y) => a + y.savingsOmr, 0);

  const simplePaybackYears = paybackYears ?? Infinity;
  // KB: ROI = (Σ(S_t − OPEX_t) − CAPEX) / CAPEX × 100
  const roiPct = capexOmr > 0 ? ((totalSavings - capexOmr) / capexOmr) * 100 : 0;

  // ---------- Environmental ----------
  // KB doc 04: EF_grid = 0.65 kg CO₂/kWh; mature tree absorbs 21.77 kg CO₂/yr.
  const co2PerYearTons = (annualGenerationKwh / 1000) * inputs.gridEmissionFactor;
  const co2OverLifeTons = yearly.reduce((a, y) => a + y.co2AvoidedTons, 0);
  const treesEquivalent = (co2PerYearTons * 1000) / 21.77;
  const carsEquivalent = co2PerYearTons / 4.6; // 4.6 t CO2 per average car per year

  // ---------- SDG / Net Zero trackers ----------
  const billOffsetPct =
    annualBillWithoutOmr > 0 ? Math.min(100, (annualSavingsOmr / annualBillWithoutOmr) * 100) : 0;
  const sdg7Pct = energySelfSufficiencyPct;
  const sdg11Pct = Math.round((billOffsetPct + energySelfSufficiencyPct) / 2);
  const netZero2050Pct = energySelfSufficiencyPct;

  return {
    inputs,
    grossAreaM2: inputs.roofAreaM2,
    usableAreaM2,
    roofPotentialKwp: round2(roofPotentialKwp),
    recommendedKwp: round2(systemKwp),
    panels,
    panelWattage,
    orientationFactor,
    tiltDeg,
    specificYieldKwhPerKwp: Math.round(specificYieldKwhPerKwp),
    performanceRatio,
    losses: {
      temperaturePct: annualTemperaturePct,
      soilingPct,
      inverterPct: SYSTEM_LOSS.inverter,
      wiringPct: SYSTEM_LOSS.wiring,
      shadingPct: SYSTEM_LOSS.shading,
      otherPct: SYSTEM_LOSS.other,
      totalPct,
    },
    annualGenerationKwh: Math.round(annualGenerationKwh),
    monthly,
    yearly,
    annualBillWithoutOmr,
    annualBillWithOmr,
    annualSavingsOmr,
    energySelfSufficiencyPct: round1(energySelfSufficiencyPct),
    capexOmr,
    omPerYearOmr,
    simplePaybackYears,
    npvOmr: round1(npvOmr),
    roiPct: round1(roiPct),
    cumulative25SavingsOmr: totalSavings,
    lcoeOmrPerKwh: totalEnergyKwh > 0 ? (capexOmr + opexSum) / totalEnergyKwh : 0,
    co2PerYearTons: round2(co2PerYearTons),
    co2OverLifeTons: round2(co2OverLifeTons),
    treesEquivalent: Math.round(treesEquivalent),
    carsEquivalent: round1(carsEquivalent),
    sdg7Pct: round1(sdg7Pct),
    sdg11Pct: round1(sdg11Pct),
    netZero2050Pct: round1(netZero2050Pct),
    oversizedNote,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
