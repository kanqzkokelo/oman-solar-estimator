import { NextResponse } from "next/server";
import { estimateSolar, DEFAULT_INPUTS, type SolarInputs } from "@/lib/solar/calculator";
import { GOVERNORATES, PROPERTY_TYPES, ROOF_TYPES, ORIENTATIONS, SOILING_LEVELS } from "@/lib/solar/constants";
import type { TariffSchedule } from "@/lib/solar/tariffs";

const TARIFF_SCHEDULES: TariffSchedule[] = ["primary", "additional", "nonResidential"];

function sanitizeInputs(body: unknown): SolarInputs {
  const b = (body ?? {}) as Record<string, unknown>;
  const num = (v: unknown, d: number, min: number, max: number): number => {
    const parsed = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    const n = Number.isFinite(parsed) ? parsed : d;
    return Math.min(max, Math.max(min, n));
  };
  const str = <T extends string>(v: unknown, d: T, allowed: T[]): T =>
    typeof v === "string" && (allowed as string[]).includes(v) ? (v as T) : d;

  return {
    roofAreaM2: num(b.roofAreaM2, DEFAULT_INPUTS.roofAreaM2, 0, 100000),
    propertyType: str(b.propertyType, DEFAULT_INPUTS.propertyType, ["residential", "commercial"]),
    governorate: str(b.governorate, DEFAULT_INPUTS.governorate, GOVERNORATES.map((g) => g.key)),
    roofType: str(b.roofType, DEFAULT_INPUTS.roofType, ["flat", "sloped"]),
    orientation: str(b.orientation, DEFAULT_INPUTS.orientation, ORIENTATIONS.map((o) => o.key)),
    monthlyConsumptionKwh: num(b.monthlyConsumptionKwh, DEFAULT_INPUTS.monthlyConsumptionKwh, 0, 1000000),
    tariffSchedule: str(b.tariffSchedule, DEFAULT_INPUTS.tariffSchedule, TARIFF_SCHEDULES),
    soiling: str(b.soiling, DEFAULT_INPUTS.soiling, SOILING_LEVELS.map((s) => s.key)),
    netMetering: typeof b.netMetering === "boolean" ? b.netMetering : typeof b.netMetering === "string" ? b.netMetering === "true" : DEFAULT_INPUTS.netMetering,
    usableAreaFactor: num(b.usableAreaFactor, DEFAULT_INPUTS.usableAreaFactor, 0.3, 1),
    capacityDensityKwpM2: num(b.capacityDensityKwpM2, DEFAULT_INPUTS.capacityDensityKwpM2, 0.05, 0.5),
    panelWattage: num(b.panelWattage, DEFAULT_INPUTS.panelWattage, 250, 800),
    costPerKwpOmr: num(b.costPerKwpOmr, DEFAULT_INPUTS.costPerKwpOmr, 100, 3000),
    exportRateOmr: num(b.exportRateOmr, DEFAULT_INPUTS.exportRateOmr, 0, 0.1),
    gridEmissionFactor: num(b.gridEmissionFactor, DEFAULT_INPUTS.gridEmissionFactor, 0, 1),
    tariffEscalation: num(b.tariffEscalation, DEFAULT_INPUTS.tariffEscalation, 0, 0.2),
    analysisYears: num(b.analysisYears, DEFAULT_INPUTS.analysisYears, 1, 40),
    batteryKwh: num(b.batteryKwh, DEFAULT_INPUTS.batteryKwh ?? 0, 0, 1000),
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "Oman Rooftop Solar Estimator API",
    version: "1.0.0",
    endpoints: ["POST /api/estimate"],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const inputs = sanitizeInputs(body);
    const estimate = estimateSolar(inputs);
    return NextResponse.json({ ok: true, estimate });
  } catch (err) {
    console.error("Estimate API error:", err);
    return NextResponse.json({ ok: false, error: "Failed to compute estimate" }, { status: 500 });
  }
}
