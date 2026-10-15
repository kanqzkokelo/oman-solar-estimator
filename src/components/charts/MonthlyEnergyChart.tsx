"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SolarEstimate } from "@/lib/solar/calculator";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function MonthlyEnergyChart({ estimate }: { estimate: SolarEstimate }) {
  const { t, isAr } = useLanguage();

  const solarKey = t("chartSolarGen");
  const consKey = t("chartConsumption");

  const data = estimate.monthly.map((m, i) => ({
    month: isAr ? AR_MONTHS[i] : m.month,
    rawMonth: m.month,
    [solarKey]: Math.round(m.generationKwh),
    [consKey]: Math.round(m.consumptionKwh),
    tempC: m.tempC,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
          />
          <Tooltip
            content={(props) => {
              const p = props.payload?.[0]?.payload as { month?: string; rawMonth?: string; tempC?: number } | undefined;
              return (
                <div
                  className="rounded-xl border border-dune-200 bg-white px-3 py-2 text-xs shadow-soft dark:border-dune-700 dark:bg-dune-800"
                >
                  <p className="font-bold text-dune-900 dark:text-dune-100">{p?.month ?? ""}</p>
                  {props.payload?.map((entry) => (
                    <p key={String(entry.name)} className="text-dune-600 dark:text-dune-300">
                      <span className="inline-block h-2 w-2 rounded-full mx-1" style={{ background: entry.color }} />
                      {String(entry.name)}: {Number(entry.value).toLocaleString()} {isAr ? "ك.و.س" : "kWh"}
                    </p>
                  ))}
                  {typeof p?.tempC === "number" && p && (
                    <p className="mt-0.5 text-dune-500 dark:text-dune-400">
                      {t("chartMeanTemp")} {p.tempC}°C · {t("chartHeatLoss")}{" "}
                      {(() => {
                        const m = p ? estimate.monthly.find((mm) => mm.month === p.rawMonth || (isAr && AR_MONTHS[mm.index] === p.month)) : undefined;
                        return m ? `${(m.temperatureLossPct * 100).toFixed(1)}%` : "—";
                      })()}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={solarKey} fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={600} animationEasing="ease-out" />
          <Bar dataKey={consKey} fill="#6e6e73" radius={[4, 4, 0, 0]} animationDuration={600} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
