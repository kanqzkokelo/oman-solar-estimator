export function fmtInt(v: number): string {
  return Math.round(v).toLocaleString("en-US");
}

export function fmtOmr(v: number, digits = 2): string {
  return `${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })} OMR`;
}

export function fmtBaisaPerKwh(v: number): string {
  return `${Math.round(v * 1000)} baisa/kWh`;
}

export function fmtM2(v: number): string {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 1 })} m²`;
}

export function fmtPct(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`;
}

export function fmtTons(v: number): string {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} t`;
}

export function fmtKwh(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 10_000) return `${(v / 1000).toFixed(1)}k`;
  return Math.round(v).toLocaleString("en-US");
}

export function fmtYears(v: number): string {
  if (!isFinite(v)) return "—";
  if (v < 0.05) return "< 1 yr";
  if (v > 50) return "> 50 yrs";
  return `${v.toFixed(1)} yrs`;
}
