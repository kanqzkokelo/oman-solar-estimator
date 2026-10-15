"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-dune-200/60 bg-dune-100 py-10 dark:border-white/10 dark:bg-dune-900">
      <div className="mx-auto max-w-6xl space-y-4 px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[15px] font-semibold tracking-[-0.01em] text-dune-900 dark:text-dune-50">{t("footerTitle")}</p>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-dune-500 dark:text-dune-400">
              {t("footerText")}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="chip">5.5–6.5 kWh/m²/day</span>
            <span className="chip">300+ days</span>
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-dune-400 dark:text-dune-500">
          {t("footerDisclaimer")}
        </p>
      </div>
    </footer>
  );
}
