"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { SolarEstimate } from "@/lib/solar/calculator";
import { MonthlyEnergyChart } from "@/components/charts/MonthlyEnergyChart";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { SdgBadges } from "@/components/sdg/SdgBadges";
import { Callout, ProgressBar } from "@/components/ui";
import { Reveal, CountUp } from "@/components/anim";
import { STORAGE_KEY } from "@/types";
import { getGovernorate, type Orientation } from "@/lib/solar/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const SolarScene = dynamic(
  () =>
    import("@/components/three/SolarSceneSafe").then((m) => m.SolarSceneSafe),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[340px] w-full place-items-center rounded-3xl bg-[#04070d] sm:h-[400px]">
        <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-solar-400 border-t-transparent" />
      </div>
    ),
  }
);

export function StepResults({
  estimate,
  onBack,
  onReset,
}: {
  estimate: SolarEstimate;
  onBack: () => void;
  onReset: () => void;
}) {
  const router = useRouter();
  const { t, isAr, fmtInt, fmtOmr, fmtPct, fmtTons, fmtYears } = useLanguage();
  const e = estimate;
  const gov = getGovernorate(e.inputs.governorate);

  const getGovName = (key: string) => {
    switch (key) {
      case "muscat": return t("govMuscat");
      case "dhofar": return t("govDhofar");
      case "al-batinah-north": return t("govBatinahNorth");
      case "al-batinah-south": return t("govBatinahSouth");
      case "al-dakhiliyah": return t("govDakhiliyah");
      case "al-sharqiyah-north": return t("govSharqiyahNorth");
      case "al-sharqiyah-south": return t("govSharqiyahSouth");
      case "al-dhahirah": return t("govDhahirah");
      case "al-buraimi": return t("govBuraimi");
      case "musandam": return t("govMusandam");
      case "al-wusta": return t("govWusta");
      default: return key;
    }
  };

  const getTariffLabel = (key: string) => {
    switch (key) {
      case "primary": return t("tariffPrimary");
      case "additional": return t("tariffAdditional");
      case "nonResidential": return t("tariffNonRes");
      default: return key;
    }
  };

  const getOrientLabel = (key: string) => {
    switch (key) {
      case "south": return t("orientSouth");
      case "southeast": return t("orientSoutheast");
      case "southwest": return t("orientSouthwest");
      case "east": return t("orientEast");
      case "west": return t("orientWest");
      case "mixed": return t("orientMixed");
      default: return key;
    }
  };

  const getSoilingLabel = (key: string) => {
    switch (key) {
      case "low": return t("soilingLow");
      case "medium": return t("soilingMedium");
      case "high": return t("soilingHigh");
      default: return key;
    }
  };

  const downloadReport = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ estimate: e, generatedAt: new Date().toISOString() })
      );
      router.push("/report");
    } catch {
      window.print();
    }
  }, [e, router]);

  const billOffsetPct =
    e.annualBillWithoutOmr > 0
      ? Math.min(100, (e.annualSavingsOmr / e.annualBillWithoutOmr) * 100)
      : 0;

  const lossItems = [
    { key: "temperaturePct" as const, label: t("lossTemp"), color: "bg-orange-400" },
    { key: "soilingPct" as const, label: t("lossSoiling"), color: "bg-amber-400" },
    { key: "inverterPct" as const, label: t("lossInverter"), color: "bg-sky-400" },
    { key: "wiringPct" as const, label: t("lossWiring"), color: "bg-indigo-400" },
    { key: "shadingPct" as const, label: t("lossShading"), color: "bg-violet-400" },
    { key: "otherPct" as const, label: t("lossOther"), color: "bg-dune-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold leading-tight tracking-[-0.03em] text-dune-900 dark:text-dune-50 sm:text-3xl">{t("resultsTitle")}</h2>
          <p className="mt-0.5 text-xs text-dune-500 dark:text-dune-400">
            {getGovName(gov.key)}, {isAr ? "سلطنة عُمان" : "Oman"} · {e.inputs.propertyType === "residential" ? t("residentialPropText") : t("commercialPropText")} ·{" "}
            {e.inputs.roofType === "flat" ? t("flatRoofText") : t("slopedRoofText")} · {e.inputs.monthlyConsumptionKwh.toLocaleString()} {isAr ? "ك.و.س/شهرياً" : "kWh/month"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onBack}>{t("editInputsBtn")}</button>
          <button className="btn-accent" onClick={downloadReport}>
            <svg className="h-4 w-4 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></svg>
            {t("pdfReportBtn")}
          </button>
          <button className="btn-secondary" onClick={onReset}>{t("newEstimateBtn")}</button>
        </div>
      </div>

      {e.oversizedNote && (
        <Callout tone="warn">
          {t("oversizedNote")
            .replace("{max}", e.roofPotentialKwp.toFixed(1))
            .replace("{rec}", e.recommendedKwp.toFixed(1))}
        </Callout>
      )}

      {/* 3D live model */}
      <Reveal y={8}>
        <SolarScene
          data={{
            panels: e.panels,
            systemKwp: e.recommendedKwp,
            roofType: e.inputs.roofType,
            orientation: e.inputs.orientation,
            orientationLabel: getOrientLabel(e.inputs.orientation),
            month: e.monthly.every((m) => m.generationKwh === 0)
              ? "Estimate"
              : e.monthly.reduce((a, b) => (b.generationKwh > a.generationKwh ? b : a), e.monthly[0]).month,
          }}
        />
      </Reveal>

      {/* Giant-number hero band */}
      <Reveal delay={0.05} y={8}>
        <div className="rounded-3xl bg-dune-950 p-8 text-dune-50 sm:p-10">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dune-400">{t("statAnnualSavings")}</p>
              <p className="mt-2 text-5xl font-semibold tabular-nums tracking-[-0.03em] text-solar-400 sm:text-6xl">
                <CountUp value={e.annualSavingsOmr} formatter={(v) => fmtOmr(v, 0)} />
              </p>
              <p className="mt-3 text-xs leading-relaxed text-dune-400">
                {t("statSystemSize")} {e.recommendedKwp.toFixed(1)} {isAr ? "ك.و.ب" : "kWp"} · {e.panels} × {e.panelWattage} Wp
                <br />
                {t("statBillFromTo")} {fmtOmr(e.annualBillWithoutOmr)} → {fmtOmr(e.annualBillWithOmr)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dune-400">{t("statPaybackPeriod")}</p>
              <p className="mt-2 text-5xl font-semibold tabular-nums tracking-[-0.03em] text-dune-50 sm:text-6xl">
                {fmtYears(e.simplePaybackYears)}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-dune-400">
                {t("costPerKwpLabel")}: {fmtOmr(e.capexOmr, 0)}
                <br />
                {t("statAnnualGen")}: {fmtInt(e.annualGenerationKwh)} {isAr ? "ك.و.س" : "kWh"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dune-400">
                {e.inputs.analysisYears}-{isAr ? "سنة" : "yr"} {t("statRoi")}
              </p>
              <p className="mt-2 text-5xl font-semibold tabular-nums tracking-[-0.03em] text-dune-50 sm:text-6xl">
                {fmtPct(e.roiPct, 0)}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-dune-400">
                {t("statLcoe")} {fmtOmr(e.lcoeOmrPerKwh, 3)}/kWh
                <br />
                {t("co2PerYrItem")}: {fmtTons(e.co2PerYearTons)}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Sufficiency */}
      <Reveal delay={0.1} y={8}>
        <div className="card space-y-4 p-5">
          <ProgressBar value={e.energySelfSufficiencyPct} label={t("selfSufficiencyLabel")} />
          <ProgressBar value={billOffsetPct} label={t("billOffsetLabel")} />
        </div>
      </Reveal>

      {/* Charts */}
      <Reveal delay={0.05} y={8}>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold text-dune-900 dark:text-dune-100">{t("chartMonthlyTitle")}</h3>
            <MonthlyEnergyChart estimate={e} />
          </div>
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold text-dune-900 dark:text-dune-100">
              {t("chartSavingsTitle").replace("{years}", String(e.inputs.analysisYears))}
            </h3>
            <SavingsChart estimate={e} />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05} y={8}>
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Financial detail */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold text-dune-900 dark:text-dune-100">{t("financialBreakdownTitle")}</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                [t("capexItem"), fmtOmr(e.capexOmr)],
                [t("omPerYearItem"), fmtOmr(e.omPerYearOmr)],
                [t("cumulativeSavingsItem").replace("{years}", String(e.inputs.analysisYears)), fmtOmr(e.cumulative25SavingsOmr)],
                [t("roiItem"), fmtPct(e.roiPct)],
                [t("paybackItem"), fmtYears(e.simplePaybackYears)],
                [t("npvItem"), fmtOmr(e.npvOmr)],
                [t("lcoeItem"), `${fmtOmr(e.lcoeOmrPerKwh, 3)}/${isAr ? "ك.و.س" : "kWh"}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dune-100 pb-2 last:border-0 dark:border-dune-800">
                  <dt className="text-xs text-dune-500 dark:text-dune-400">{k}</dt>
                  <dd className={`text-sm font-bold text-dune-900 dark:text-dune-100 ${isAr ? "text-left" : "text-right"}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-dune-400 dark:text-dune-500">
              {t("financialsFootnote")
                .replace("{escalation}", fmtPct(e.inputs.tariffEscalation * 100, 1))
                .replace("{netMeteringNote}", e.inputs.netMetering ? t("netMeteringYes") : t("netMeteringNo"))}
            </p>
          </div>

          {/* Losses */}
          <div className="card p-5">
            <h3 className="mb-1 text-sm font-bold text-dune-900 dark:text-dune-100">
              {t("performanceRatioTitle")} {fmtPct(e.performanceRatio * 100)}
            </h3>
            <p className="mb-3 text-xs text-dune-500 dark:text-dune-400">
              {t("totalLossesSub").replace("{pct}", fmtPct(e.losses.totalPct * 100))}
            </p>
            <div className="space-y-2.5">
              {lossItems.map(({ key, label, color }) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-dune-600 dark:text-dune-300">{label}</span>
                    <span className="font-bold text-dune-800 dark:text-dune-100">{fmtPct((e.losses[key] as number) * 100)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-dune-100 dark:bg-dune-800">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (e.losses[key] as number) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-dune-400 dark:text-dune-500">
              {t("multiplicativeLossNote")}
            </p>
          </div>

          {/* Environmental */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold text-dune-900 dark:text-dune-100">{t("environmentalTitle")}</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                [t("co2PerYrItem"), fmtTons(e.co2PerYearTons)],
                [t("co2LifeItem"), fmtTons(e.co2OverLifeTons)],
                [t("treesItem"), fmtInt(e.treesEquivalent)],
                [t("carsItem"), `${e.carsEquivalent} ${isAr ? "سيارة" : "cars"}`],
                [t("gridFactorItem"), `${e.inputs.gridEmissionFactor.toFixed(2)} ${isAr ? "طن CO₂/م.و.س" : "tCO₂/MWh"}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dune-100 pb-2 last:border-0 dark:border-dune-800">
                  <dt className="text-xs text-dune-500 dark:text-dune-400">{k}</dt>
                  <dd className={`text-sm font-bold text-leaf-700 dark:text-leaf-300 ${isAr ? "text-left" : "text-right"}`}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-dune-400 dark:text-dune-500">
              {t("environmentalFootnote")}
            </p>
          </div>
        </div>
      </Reveal>

      {/* SDG + tariff note */}
      <Reveal delay={0.05} y={8}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SdgBadges estimate={e} />
          </div>
          <div className="card p-5">
            <h3 className="mb-2 text-sm font-bold text-dune-900 dark:text-dune-100">{t("assumptionsTitle")}</h3>
            <ul className="space-y-2 text-xs leading-relaxed text-dune-600 dark:text-dune-300">
              <li>• GHI {gov.ghi} {isAr ? "ك.و.س/م²/يوم" : "kWh/m²/day"} · {getGovName(gov.key)} ({Math.min(...gov.monthlyTempsC)}–{Math.max(...gov.monthlyTempsC)}°C)</li>
              <li>• {getTariffLabel(e.inputs.tariffSchedule)}</li>
              <li>• {t("usableRoofFactorLabel")} {fmtPct(e.inputs.usableAreaFactor * 100, 0)}</li>
              <li>• {e.inputs.capacityDensityKwpM2.toFixed(2)} {isAr ? "ك.و.ب/م²" : "kWp/m²"}</li>
              <li>• {fmtOmr(e.inputs.costPerKwpOmr, 0)}/{isAr ? "ك.و.ب" : "kWp"}</li>
              <li>• {t("soilingLabel")}: {getSoilingLabel(e.inputs.soiling)} ({fmtPct((e.losses.soilingPct as number) * 100)})</li>
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-dune-400 dark:text-dune-500">
              {t("disclaimerFootnote")}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
