"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SolarEstimate } from "@/lib/solar/calculator";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SavingsChart({ estimate }: { estimate: SolarEstimate }) {
  const { t, isAr, fmtOmr } = useLanguage();
  const seriesKey = t("chartCumulativeSavings");

  const data = estimate.yearly.map((y) => ({
    year: isAr ? `سنة ${y.year}` : `Yr ${y.year}`,
    [seriesKey]: Math.round(y.cumulativeSavingsOmr),
  }));
  const capex = Math.round(estimate.capexOmr);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
          />
          <Tooltip
            formatter={(value: number) => [fmtOmr(value), seriesKey]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--chart-border, #e5e7eb)",
              background: "var(--chart-bg, #ffffff)",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={capex}
            stroke="#86868b"
            strokeDasharray="4 4"
            label={{ value: `${t("chartCapexRef")} ${fmtOmr(capex, 0)}`, position: "insideTopRight", fontSize: 11, fill: "#6e6e73" }}
          />
          <Area
            type="monotone"
            dataKey={seriesKey}
            stroke="#d97706"
            strokeWidth={2.5}
            fill="url(#savingsGrad)"
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
