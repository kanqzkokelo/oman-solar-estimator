"use client";

import { CountUp, Reveal } from "@/components/anim";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** Huge 01/02/03 numerals — pure type, no cards. */
export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { n: "01", title: t("how1Title"), body: t("how1Body") },
    { n: "02", title: t("how2Title"), body: t("how2Body") },
    { n: "03", title: t("how3Title"), body: t("how3Body") },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <Reveal y={8}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-600 dark:text-solar-400">
          {t("howEyebrow")}
        </p>
      </Reveal>
      <div className="mt-10 grid gap-12 sm:grid-cols-3 sm:gap-10">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08} y={8}>
            <div>
              <span className="block text-6xl font-semibold tabular-nums tracking-[-0.04em] text-solar-500 dark:text-solar-400">
                {s.n}
              </span>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-dune-900 dark:text-dune-50">
                {s.title}
              </h3>
              <p className="mt-2 max-w-[26ch] text-[15px] leading-relaxed text-dune-500 dark:text-dune-400">
                {s.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Oversized Omani-data figures on a full-width band. */
export function OmanStats() {
  const { t, isAr } = useLanguage();

  return (
    <section className="bg-dune-100 dark:bg-dune-900">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal y={8}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-600 dark:text-solar-400">
            {t("statsEyebrow")}
          </p>
        </Reveal>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {[
            {
              value: <span className="text-5xl font-semibold tabular-nums tracking-[-0.03em] text-dune-900 dark:text-dune-50 sm:text-6xl">5.5–6.5</span>,
              unit: t("heroStat1Unit"),
              label: t("heroStat1Label"),
            },
            {
              value: (
                <span className="text-5xl font-semibold tabular-nums tracking-[-0.03em] text-dune-900 dark:text-dune-50 sm:text-6xl">
                  <CountUp value={300} formatter={(v) => `${isAr ? "+" : ""}${v}${!isAr ? "+" : ""}`} />
                </span>
              ),
              unit: t("heroStat2Unit"),
              label: t("heroStat2Label"),
            },
            {
              value: <span className="text-5xl font-semibold tabular-nums tracking-[-0.03em] text-dune-900 dark:text-dune-50 sm:text-6xl">2050</span>,
              unit: t("heroStat3Unit"),
              label: t("heroStat3Label"),
            },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.08} y={8}>
              <div>
                {s.value}
                <p className="mt-3 text-[13px] leading-tight text-dune-500 dark:text-dune-400">
                  <b className="block font-semibold text-dune-900 dark:text-dune-100">{s.unit}</b>
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}