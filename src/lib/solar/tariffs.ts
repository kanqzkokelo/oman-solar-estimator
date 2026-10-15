import type { TariffSchedule } from "./constants";

export type { TariffSchedule };

/**
 * Oman electricity tariffs (OMR per kWh), per the tariff regulation
 * effective 1 January 2025 (Authority for Public Services Regulation):
 *
 * Residential - Primary account:
 *   0 - 4,000 kWh:  14 baisa/kWh
 *   4,001 - 6,000:  18 baisa/kWh
 *   > 6,000 kWh:    32 baisa/kWh
 *
 * Residential - Additional account:
 *   0 - 4,000 kWh:  22 baisa/kWh
 *   4,001 - 6,000:  26 baisa/kWh
 *   > 6,000 kWh:    32 baisa/kWh
 *
 * Non-residential (commercial, government, industrial, tourism):
 *   flat 25 baisa/kWh
 */
export interface TariffTier {
  upToKwh: number; // exclusive upper bound; Infinity for last tier
  omrPerKwh: number;
}

export const TARIFFS: Record<TariffSchedule, TariffTier[]> = {
  primary: [
    { upToKwh: 4000, omrPerKwh: 0.014 },
    { upToKwh: 6000, omrPerKwh: 0.018 },
    { upToKwh: Infinity, omrPerKwh: 0.032 },
  ],
  additional: [
    { upToKwh: 4000, omrPerKwh: 0.022 },
    { upToKwh: 6000, omrPerKwh: 0.026 },
    { upToKwh: Infinity, omrPerKwh: 0.032 },
  ],
  nonResidential: [{ upToKwh: Infinity, omrPerKwh: 0.025 }],
};

export const TARIFF_LABELS: Record<TariffSchedule, string> = {
  primary: "Residential – primary account (14/18/32 baisa)",
  additional: "Residential – additional account (22/26/32 baisa)",
  nonResidential: "Non-residential flat rate (25 baisa)",
};

/**
 * Summer relief for primary accounts only (KB doc 02). Month index 0 = Jan.
 * Each entry is the per-tier multiplier applied to the base slab rates.
 * May: 15% / 10% / 5% off · Jun–Aug: 20% / 15% / 10% off.
 * Additional accounts and non-residential are NOT eligible.
 */
const PRIMARY_SUMMER_MULTIPLIERS: Record<number, readonly number[]> = {
  4: [0.85, 0.90, 0.95], // May
  5: [0.80, 0.85, 0.90], // Jun
  6: [0.80, 0.85, 0.90], // Jul
  7: [0.80, 0.85, 0.90], // Aug
};

/** Monthly bill (OMR) for a given monthly consumption (kWh) under a tariff schedule. */
export function billFor(kwh: number, schedule: TariffSchedule, month?: number): number {
  if (kwh <= 0) return 0;
  const discount =
    schedule === "primary" && month !== undefined
      ? PRIMARY_SUMMER_MULTIPLIERS[month]
      : undefined;
  let remaining = kwh;
  let cost = 0;
  let floor = 0;
  let tierIndex = 0;
  for (const tier of TARIFFS[schedule]) {
    const band = Math.min(remaining, tier.upToKwh - floor);
    if (band <= 0) break;
    const multiplier = discount?.[tierIndex] ?? 1;
    cost += band * tier.omrPerKwh * multiplier;
    remaining -= band;
    floor = tier.upToKwh;
    tierIndex += 1;
    if (remaining <= 0) break;
  }
  return cost;
}

/** Effective average price (OMR/kWh) paid on a full monthly bill. */
export function effectiveRate(kwh: number, schedule: TariffSchedule): number {
  return kwh > 0 ? billFor(kwh, schedule) / kwh : TARIFFS[schedule][0].omrPerKwh;
}

/**
 * Inverse of billFor(): estimate the monthly consumption (kWh) that produces
 * the given bill (OMR) under a tariff schedule. Used to let users enter their
 * bill amount in OMR instead of kWh. Round-trips exactly: billFor(billToConsumption(b)) === b.
 */
export function billToConsumption(omr: number, schedule: TariffSchedule): number {
  if (omr <= 0) return 0;
  const tiers = TARIFFS[schedule];
  let remainingBill = omr;
  let consumption = 0;
  let floor = 0;

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const ceiling = tier.upToKwh;
    const band = tier.upToKwh === Infinity ? Math.max(100000, remainingBill / tier.omrPerKwh) : tier.upToKwh - floor;
    const costOfBand = band * tier.omrPerKwh;

    if (remainingBill <= costOfBand) {
      consumption += remainingBill / tier.omrPerKwh;
      break;
    }
    consumption += band;
    remainingBill -= costOfBand;
    floor = ceiling;
  }
  return Math.round(consumption);
}
