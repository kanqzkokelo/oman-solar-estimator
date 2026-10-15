"use client";

import type { ReactNode } from "react";
import { DEFAULTS } from "@/lib/solar/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function StepLocation({
  area,
  children,
}: {
  area: number;
  onAreaChange: (m2: number) => void;
  children: ReactNode;
}) {
  const { t, fmtInt, fmtM2 } = useLanguage();
  const usable = area * DEFAULTS.usableAreaFactor;
  const panels = Math.floor((usable * DEFAULTS.capacityDensityKwpM2 * 1000) / 550);

  return (
    <div className="relative">
      <div className="min-w-0">{children}</div>

      {/* Floating glass panels over the map (stack below it on small screens) */}
      <aside className="mt-4 space-y-4 lg:absolute lg:end-4 lg:top-4 lg:z-10 lg:mt-0 lg:w-72">
        <div className="rounded-2xl border border-dune-200/70 bg-white/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-dune-900/70">
          <h3 className="text-sm font-bold text-dune-900 dark:text-dune-100">{t("step1Title")}</h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-dune-600 dark:text-dune-300">
            <li className="flex gap-2">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-leaf-100 text-[10px] font-bold text-leaf-700 dark:bg-leaf-900 dark:text-leaf-300">1</span>
              {t("step1Inst1")}
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-leaf-100 text-[10px] font-bold text-leaf-700 dark:bg-leaf-900 dark:text-leaf-300">2</span>
              {t("step1Inst2")}
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-leaf-100 text-[10px] font-bold text-leaf-700 dark:bg-leaf-900 dark:text-leaf-300">3</span>
              {t("step1Inst3")}
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-leaf-100 text-[10px] font-bold text-leaf-700 dark:bg-leaf-900 dark:text-leaf-300">4</span>
              {t("step1Inst4")}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-dune-200/70 bg-white/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-dune-900/70">
          <p className="label">{t("drawnRooftop")}</p>
          <p className="text-3xl font-semibold tracking-[-0.02em] text-solar-600 dark:text-solar-400">{area > 0 ? fmtM2(area) : "—"}</p>
          <dl className="mt-3 space-y-1.5 text-xs text-dune-600 dark:text-dune-300">
            <div className="flex justify-between">
              <dt>{t("usable75")}</dt>
              <dd className="font-semibold">{area > 0 ? fmtM2(usable) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("panelsCount")}</dt>
              <dd className="font-semibold">≈ {area > 0 ? fmtInt(panels) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("capacityDensity")}</dt>
              <dd className="font-semibold">170 W/m²</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-solar-200/70 bg-solar-50/80 p-4 backdrop-blur-xl dark:border-solar-900/60 dark:bg-solar-950/60">
          <p className="text-xs font-bold text-solar-700 dark:text-solar-300">{t("whyTraceTitle")}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-dune-600 dark:text-dune-300">
            {t("whyTraceBody")}
          </p>
        </div>
      </aside>
    </div>
  );
}
