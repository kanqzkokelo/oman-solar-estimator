import {
  ANALYSIS_YEARS,
  BATTERY_COST_PER_KWH_OMR,
  BATTERY_DOD,
  BATTERY_RTE,
  C_TILT_FLAT,
  C_TILT_TILTED,
  DEGRADATION_RATE,
  DEFAULTS,
  DISCOUNT_RATE,
  DUST_DEPOSITION_RATE,
  IRRADIANCE_AT_CELL_TEMP,
  MONTH_GENERATION_FACTORS,
  MONTH_GENERATION_FACTORS_DHOFAR,
  MONTH_DEMAND_FACTORS_RESIDENTIAL,
  MONTH_NAMES,
  NOCT,
  O_M_RATE,
  OPEX_INFLATION,
  OPTIMAL_TILT_DEG,
  ORIENTATIONS,
  PANEL_WATTAGE,
  SOILING_LEVELS,
  STANDARD_INVERTER_KW,
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
  batteryKwh?: number; // Optional LFP battery capacity (kWh)
  locale?: "en" | "ar";
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
  selfConsumedKwh: number;
  exportedKwh: number;
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

export interface EpcSpecs {
  inverterKwAc: number;
  dcAcRatio: number;
  stringsCount: number;
  panelsPerString: number;
  directSelfConsumptionPct: number;
  batteryKwh: number;
  batteryCapexOmr: number;
}

export interface SolarEstimate {
  inputs: SolarInputs;
  grossAreaM2: number;
  usableAreaM2: number;
  roofPotentialKwp: number;
  recommendedKwp: number;
  panels: number;
  panelWattage: number;
  epc: EpcSpecs;
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
  batteryKwh: 0,
};

export function estimateSolar(inputs: SolarInputs): SolarEstimate {
  const gov = getGovernorate(inputs.governorate);
  const years = Math.max(1, Math.round(inputs.analysisYears));
  const orientationFactor =
    ORIENTATIONS.find((o) => o.key === inputs.orientation)?.factor ?? 1;

  // ---------- System sizing ----------
  const usableAreaM2 = Math.max(0, inputs.roofAreaM2 * inputs.usableAreaFactor);
  const roofPotentialKwp = usableAreaM2 * inputs.capacityDensityKwpM2;

  const tiltDeg = inputs.roofType === "sloped" ? OPTIMAL_TILT_DEG : 8;
  const tiltFactor =
    (inputs.roofType === "sloped" ? C_TILT_TILTED : C_TILT_FLAT) * orientationFactor;

  // ---------- Losses ----------
  const cellTempRise = ((NOCT - 20) / 800) * IRRADIANCE_AT_CELL_TEMP;
  const monthlyThermalFactor = gov.monthlyTempsC.map((tAmb) =>
    Math.max(0, 1 - TEMPERATURE_COEFFICIENT * (tAmb + cellTempRise - 25))
  );
  const monthlyTemperaturePct = monthlyThermalFactor.map((f) => Math.max(0, 1 - f));
  const annualTemperaturePct = Math.max(
    0,
    1 - monthlyThermalFactor.reduce((a, b) => a + b, 0) / monthlyThermalFactor.length
  );

  const cleaningDays =
    SOILING_LEVELS.find((s) => s.key === inputs.soiling)?.cleaningDays ?? 60;
  const soilingPct = Math.min(0.3, (DUST_DEPOSITION_RATE * cleaningDays) / 2);

  const fixedLossProduct = [SYSTEM_LOSS.inverter, SYSTEM_LOSS.wiring, SYSTEM_LOSS.shading, SYSTEM_LOSS.other].reduce(
    (acc, l) => acc * (1 - l),
    1
  );
  const annualLossFactors = [annualTemperaturePct, soilingPct, SYSTEM_LOSS.inverter, SYSTEM_LOSS.wiring, SYSTEM_LOSS.shading, SYSTEM_LOSS.other];
  const totalPct = 1 - annualLossFactors.reduce((acc, l) => acc * (1 - l), 1);

  // ---------- Yield ----------
  const annualPoaKwhM2 = gov.ghi * 365 * tiltFactor;
  const performanceRatio = annualLossFactors.reduce((acc, l) => acc * (1 - l), 1);
  const specificYieldKwhPerKwp = annualPoaKwhM2 * performanceRatio;

  const demandKwp = (inputs.monthlyConsumptionKwh * 12) / specificYieldKwhPerKwp;
  const recommendedKwp = Math.min(roofPotentialKwp, demandKwp);
  const oversizedNote =
    roofPotentialKwp > demandKwp
      ? inputs.locale === "ar"
        ? `يمكن لسقفك استيعاب حتى ${roofPotentialKwp.toFixed(1)} ك.و.ب، ولكننا نوصي بـ ${recommendedKwp.toFixed(1)} ك.و.ب لمطابقة استهلاكك السنوي — تجنباً لدفع تكلفة قدرة غير مستغلة.`
        : `Your roof can host up to ${roofPotentialKwp.toFixed(1)} kWp, but we recommend ${recommendedKwp.toFixed(1)} kWp to match your annual consumption — avoid paying for unused capacity.`
      : null;

  const panelWattage = inputs.panelWattage || PANEL_WATTAGE;
  const panels = Math.max(0, Math.round((recommendedKwp * 1000) / panelWattage));
  const systemKwp = (panels * panelWattage) / 1000;

  // ---------- EPC Inverter & String Architecture ----------
  // Target a 1.18 DC/AC ratio and snap to nearest standard commercial inverter rating
  const targetAcKw = systemKwp / 1.18;
  const inverterKwAc =
    systemKwp <= 0
      ? 0
      : STANDARD_INVERTER_KW.reduce((prev, curr) =>
          Math.abs(curr - targetAcKw) < Math.abs(prev - targetAcKw) ? curr : prev
        );
  const dcAcRatio = inverterKwAc > 0 ? round2(systemKwp / inverterKwAc) : 1.0;
  // Standard 1000V/1100V MPPT string sizing (10–18 panels per string)
  const panelsPerString = panels > 0 ? Math.min(16, Math.max(6, Math.round(panels / Math.max(1, Math.ceil(panels / 14))))) : 0;
  const stringsCount = panelsPerString > 0 ? Math.max(1, Math.round(panels / panelsPerString)) : 0;

  // ---------- Monthly profile (with Dhofar Khareef monsoon awareness) ----------
  const rawSeasonality =
    gov.key === "dhofar" ? MONTH_GENERATION_FACTORS_DHOFAR : MONTH_GENERATION_FACTORS;
  const genFactors = normalizeMean(rawSeasonality);
  const demandFactors =
    inputs.propertyType === "residential"
      ? normalizeMean(MONTH_DEMAND_FACTORS_RESIDENTIAL)
      : Array(12).fill(1);

  const annualGenerationKwh = systemKwp * specificYieldKwhPerKwp;

  const monthlyPR = monthlyThermalFactor.map((f) => fixedLossProduct * (1 - soilingPct) * f);
  const annualPR = performanceRatio;
  const rawMonthlyGen = MONTH_NAMES.map((_, i) => (annualGenerationKwh / 12) * genFactors[i] * (monthlyPR[i] / annualPR));
  const rawGenSum = rawMonthlyGen.reduce((a, b) => a + b, 0);
  const genScale = rawGenSum > 0 ? annualGenerationKwh / rawGenSum : 1;

  const batteryKwh = Math.max(0, inputs.batteryKwh ?? 0);
  const batteryCapexOmr = batteryKwh * BATTERY_COST_PER_KWH_OMR;
  // Daily usable battery cycling capacity (30.4 days/month)
  const monthlyBatteryShiftMaxKwh = batteryKwh * BATTERY_DOD * BATTERY_RTE * 30.4;

  let totalSelfConsumedKwh = 0;

  const monthly = MONTH_NAMES.map((name, i) => {
    const generationKwh = rawMonthlyGen[i] * genScale;
    const consumptionKwh = inputs.monthlyConsumptionKwh * demandFactors[i];
    const billWithoutOmr = billFor(consumptionKwh, inputs.tariffSchedule, i);

    // If battery > 0, daytime surplus is shifted into night load before exporting
    const rawSurplus = Math.max(0, generationKwh - consumptionKwh);
    const shiftedByBattery = Math.min(
      Math.max(0, consumptionKwh - generationKwh * 0.65),
      monthlyBatteryShiftMaxKwh
    );
    const effectiveSelfConsumed = Math.min(
      consumptionKwh,
      Math.min(generationKwh, consumptionKwh) + (batteryKwh > 0 ? shiftedByBattery * 0.25 : 0)
    );
    const exportedKwh = Math.max(0, generationKwh - effectiveSelfConsumed);
    totalSelfConsumedKwh += effectiveSelfConsumed;

    let billWithOmr: number;
    if (inputs.netMetering && effectiveSelfConsumed >= consumptionKwh) {
      billWithOmr = 0;
    } else {
      billWithOmr = billFor(consumptionKwh - effectiveSelfConsumed, inputs.tariffSchedule, i);
    }
    const exportCredit = inputs.netMetering ? exportedKwh * inputs.exportRateOmr : 0;
    // Battery evening peak-shaving bonus for primary/commercial accounts
    const batteryPeakBonus =
      batteryKwh > 0
        ? Math.min(monthlyBatteryShiftMaxKwh, generationKwh * 0.35) * 0.012
        : 0;
    billWithOmr = Math.max(0, billWithOmr - exportCredit - batteryPeakBonus);
    const extraSurplusCredit =
      inputs.netMetering && rawSurplus > 0 && billWithOmr === 0
        ? rawSurplus * inputs.exportRateOmr
        : 0;

    return {
      month: name,
      index: i,
      generationKwh,
      consumptionKwh,
      selfConsumedKwh: effectiveSelfConsumed,
      exportedKwh,
      tempC: gov.monthlyTempsC[i],
      temperatureLossPct: monthlyTemperaturePct[i],
      billWithoutOmr,
      billWithOmr,
      savingsOmr: billWithoutOmr - billWithOmr + extraSurplusCredit * 0.15,
    };
  });

  const annualBillWithoutOmr = monthly.reduce((a, m) => a + m.billWithoutOmr, 0);
  const annualBillWithOmr = monthly.reduce((a, m) => a + m.billWithOmr, 0);
  const annualSavingsOmr = Math.max(0, annualBillWithoutOmr - annualBillWithOmr);
  const energySelfSufficiencyPct =
    inputs.monthlyConsumptionKwh > 0
      ? Math.min(100, (annualGenerationKwh / (inputs.monthlyConsumptionKwh * 12)) * 100)
      : 0;

  const directSelfConsumptionPct =
    annualGenerationKwh > 0 ? round1((totalSelfConsumedKwh / annualGenerationKwh) * 100) : 0;

  // ---------- Financials ----------
  const capexOmr = systemKwp * inputs.costPerKwpOmr + batteryCapexOmr;
  const omPerYearOmr = capexOmr * O_M_RATE;

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
  const roiPct = capexOmr > 0 ? ((totalSavings - capexOmr) / capexOmr) * 100 : 0;

  // ---------- Environmental ----------
  const co2PerYearTons = (annualGenerationKwh / 1000) * inputs.gridEmissionFactor;
  const co2OverLifeTons = yearly.reduce((a, y) => a + y.co2AvoidedTons, 0);
  const treesEquivalent = (co2PerYearTons * 1000) / 21.77;
  const carsEquivalent = co2PerYearTons / 4.6;

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
    epc: {
      inverterKwAc,
      dcAcRatio,
      stringsCount,
      panelsPerString,
      directSelfConsumptionPct,
      batteryKwh,
      batteryCapexOmr,
    },
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
