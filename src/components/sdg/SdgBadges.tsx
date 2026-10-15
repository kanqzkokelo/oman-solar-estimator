"use client";

import { motion } from "motion/react";
import { ProgressBar } from "@/components/ui";
import { SPRING_UI } from "@/lib/motion";
import type { SolarEstimate } from "@/lib/solar/calculator";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function Ring({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-dune-100 dark:stroke-dune-800" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: dash / c }}
            transition={SPRING_UI}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-bold text-dune-900 dark:text-dune-100">
          {Math.round(value)}%
        </span>
      </div>
      <span className="text-center text-[11px] font-semibold leading-tight text-dune-700 dark:text-dune-200">{label}</span>
    </div>
  );
}

export function SdgBadges({ estimate }: { estimate: SolarEstimate }) {
  const { t } = useLanguage();

  return (
    <div className="card p-5">
      <h3 className="mb-1 text-sm font-bold text-dune-900 dark:text-dune-100">{t("sdgTrackerTitle")}</h3>
      <p className="mb-4 text-xs text-dune-500 dark:text-dune-400">
        {t("sdgTrackerSub")}
      </p>
      <div className="grid grid-cols-3 gap-4">
        <Ring value={estimate.sdg7Pct} color="#d97706" label={t("sdg7Ring")} />
        <Ring value={estimate.sdg11Pct} color="#0284c7" label={t("sdg11Ring")} />
        <Ring value={estimate.netZero2050Pct} color="#2c7f3b" label={t("netZeroRing")} />
      </div>
      <div className="mt-5 space-y-3 border-t border-dune-100 pt-4 dark:border-dune-800">
        <ProgressBar
          value={estimate.energySelfSufficiencyPct}
          label={t("selfSufficiencyBar")}
        />
        <ProgressBar
          value={
            estimate.annualBillWithoutOmr > 0
              ? (estimate.annualSavingsOmr / estimate.annualBillWithoutOmr) * 100
              : 0
          }
          label={t("billOffsetBar")}
        />
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-dune-400 dark:text-dune-500">
        {t("sdgFootnote")}
      </p>
    </div>
  );
}
