"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { SolarEstimate, SolarInputs } from "@/lib/solar/calculator";
import { MonthlyEnergyChart } from "@/components/charts/MonthlyEnergyChart";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { SdgBadges } from "@/components/sdg/SdgBadges";
import { Callout, ProgressBar } from "@/components/ui";
import { Reveal, CountUp } from "@/components/anim";
import { STORAGE_KEY } from "@/types";
import { getGovernorate } from "@/lib/solar/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const SolarScene = dynamic(
  () =>
    import("@/components/three/SolarSceneSafe").then((m) => m.SolarSceneSafe),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[380px] w-full place-items-center rounded-3xl bg-[#04070d] sm:h-[440px]">
        <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-solar-400 border-t-transparent" />
      </div>
    ),
  }
);

export function StepResults({
  estimate,
  onBack,
  onReset,
  onUpdateInputs,
}: {
  estimate: SolarEstimate;
  onBack: () => void;
  onReset: () => void;
  onUpdateInputs: (patch: Partial<SolarInputs>) => void;
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

      {/* Live What-If Engineering Sandbox Bar */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="text-xs font-bold text-dune-900 dark:text-dune-100">⚡ {isAr ? "شريط محاكاة الهندسة الحية (What-If)" : "Live EPC Sensitivity Sandbox"}</p>
          <p className="text-[11px] text-dune-500">{isAr ? "اختبر سعة البطاريات وتراكم الغبار مباشرة على النتائج" : "Test battery storage and dust maintenance live on results"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-dune-500 font-medium">{isAr ? "البطارية (LFP):" : "Battery (LFP):"}</span>
            {[0, 5, 10, 15].map((kwh) => (
              <button
                key={kwh}
                onClick={() => onUpdateInputs({ batteryKwh: kwh })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  (e.inputs.batteryKwh ?? 0) === kwh
                    ? "bg-solar-500 text-dune-950 shadow-sm"
                    : "bg-dune-200/60 dark:bg-dune-800 text-dune-700 dark:text-dune-300 hover:bg-dune-300/60 dark:hover:bg-dune-700"
                }`}
              >
                {kwh === 0 ? (isAr ? "بدون" : "None") : `${kwh} ${isAr ? "ك.و.س" : "kWh"}`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-dune-500 font-medium">{isAr ? "الغبار:" : "Dust:"}</span>
            {(["low", "medium", "high"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onUpdateInputs({ soiling: s })}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase transition ${
                  e.inputs.soiling === s
                    ? "bg-leaf-600 text-white shadow-sm"
                    : "bg-dune-200/60 dark:bg-dune-800 text-dune-700 dark:text-dune-300 hover:bg-dune-300/60 dark:hover:bg-dune-700"
                }`}
              >
                {s === "low" ? (isAr ? "منخفض" : "Low") : s === "medium" ? (isAr ? "متوسط" : "Med") : (isAr ? "مرتفع" : "High")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D live model with Hour Scrubber */}
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
          </div>

          {/* EPC Engineering Specs Card */}
          <div className="card p-5">
            <h3 className="mb-1 text-sm font-bold text-dune-900 dark:text-dune-100">🏗️ {isAr ? "المواصفات الهندسية (EPC Specs)" : "EPC Engineering Specs"}</h3>
            <p className="mb-3 text-xs text-dune-500">{isAr ? "قدرة المحول وتوزيع السلاسل ومخطط الخط الأحادي (SLD)" : "Inverter sizing, strings & SLD parameters"}</p>
            <dl className="space-y-2.5 text-sm">
              {[
                [isAr ? "قدرة المحول العاكس (AC)" : "Inverter AC Rating", `${e.epc.inverterKwAc} kW AC`],
                [isAr ? "نسبة تحجيم DC إلى AC" : "DC:AC Sizing Ratio", `${e.epc.dcAcRatio} : 1`],
                [isAr ? "توزيع السلاسل (Strings)" : "String Configuration", isAr ? `${e.epc.stringsCount} سلاسل × ${e.epc.panelsPerString} ألواح` : `${e.epc.stringsCount} strings × ${e.epc.panelsPerString} panels`],
                [isAr ? "الاستهلاك الذاتي المباشر" : "Daytime Self-Consumption", `${e.epc.directSelfConsumptionPct}%`],
                [isAr ? "سعة تخزين البطاريات (LFP)" : "Battery Storage (LFP)", e.epc.batteryKwh > 0 ? `${e.epc.batteryKwh} kWh (${fmtOmr(e.epc.batteryCapexOmr, 0)})` : (isAr ? "غير مشمولة" : "Not included")],
                [isAr ? "درجة الحرارة القصوى للبيئة" : "Peak Ambient Temp", `${Math.max(...gov.monthlyTempsC)}°C (${gov.name})`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dune-100 pb-2 last:border-0 dark:border-dune-800">
                  <dt className="text-xs text-dune-500 dark:text-dune-400">{k}</dt>
                  <dd className={`text-sm font-bold text-leaf-700 dark:text-leaf-300 ${isAr ? "text-left" : "text-right"}`}>{v}</dd>
                </div>
              ))}
            </dl>
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
          </div>
        </div>
      </Reveal>

      {/* SDG + assumptions */}
      <Reveal delay={0.05} y={8}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SdgBadges estimate={e} />
          </div>
          <div className="card p-5">
            <h3 className="mb-2 text-sm font-bold text-dune-900 dark:text-dune-100">{t("assumptionsTitle")}</h3>
            <ul className="space-y-2 text-xs leading-relaxed text-dune-600 dark:text-dune-300">
              <li>• GHI {gov.ghi} kWh/m²/day · {getGovName(gov.key)}</li>
              <li>• {getTariffLabel(e.inputs.tariffSchedule)}</li>
              <li>• {t("soilingLabel")}: {e.inputs.soiling} dust level</li>
              <li>• APSR tariff regulation effective 1 Jan 2025</li>
            </ul>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
