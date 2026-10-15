"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SolarEstimate } from "@/lib/solar/calculator";
import { STORAGE_KEY } from "@/types";
import { getGovernorate } from "@/lib/solar/constants";
import { SavingsChart } from "@/components/charts/SavingsChart";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function isSolarEstimate(value: unknown): value is SolarEstimate {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  const inputs = e.inputs as Record<string, unknown> | undefined;
  return (
    typeof inputs?.governorate === "string" &&
    typeof inputs?.propertyType === "string" &&
    typeof e.recommendedKwp === "number" &&
    typeof e.annualGenerationKwh === "number" &&
    typeof e.annualSavingsOmr === "number" &&
    Array.isArray(e.monthly) &&
    Array.isArray(e.yearly)
  );
}

function ReportContent() {
  const { t, isAr, fmtInt, fmtOmr, fmtPct, fmtTons, fmtYears } = useLanguage();
  const [estimate, setEstimate] = useState<SolarEstimate | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { estimate?: unknown; generatedAt?: string };
        if (isSolarEstimate(data.estimate)) {
          setEstimate(data.estimate);
          if (typeof data.generatedAt === "string") {
            setGeneratedAt(new Date(data.generatedAt).toLocaleString(isAr ? "ar-OM" : "en-US"));
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, [isAr]);

  const gov = useMemo(() => (estimate ? getGovernorate(estimate.inputs.governorate) : null), [estimate]);

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

  if (!estimate || !gov) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-sm text-dune-500">{t("noEstimateFound")}</p>
        <Link href="/#estimator" className="btn-primary mt-5">
          {t("backToMapBtn")}
        </Link>
      </div>
    );
  }

  const e = estimate;
  const billOffsetPct =
    e.annualBillWithoutOmr > 0 ? (e.annualSavingsOmr / e.annualBillWithoutOmr) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div id="print-report" className="card overflow-hidden">
        {/* Report header */}
        <div className="bg-gradient-to-r from-leaf-700 to-leaf-600 px-6 py-6 text-white print-break">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-leaf-200">
                {t("headerTitle")}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold">{t("reportMainTitle")}</h1>
              <p className="mt-1 text-xs text-leaf-100">
                {getGovName(gov.key)}, {isAr ? "سلطنة عُمان" : "Sultanate of Oman"} · {generatedAt || "—"}
              </p>
            </div>
            <div className={`rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm ${isAr ? "text-left" : "text-right"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-leaf-200">{t("reportAlignedWith")}</p>
              <p className="text-xs font-extrabold tracking-wide">{t("sdg7Tag")} · {t("sdg11Tag")} · {t("netZeroTag")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Key numbers */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print-break">
            {[
              [t("statSystemSize"), `${e.recommendedKwp.toFixed(1)} ${isAr ? "ك.و.ب" : "kWp"}`],
              [t("statAnnualGen"), `${fmtInt(e.annualGenerationKwh)} ${isAr ? "ك.و.س" : "kWh"}`],
              [t("statAnnualSavings"), fmtOmr(e.annualSavingsOmr)],
              [t("statPaybackPeriod"), fmtYears(e.simplePaybackYears)],
              [t("co2PerYrItem"), fmtTons(e.co2PerYearTons)],
              [t("selfSufficiencyLabel"), fmtPct(e.energySelfSufficiencyPct)],
              [t("billOffsetLabel"), fmtPct(billOffsetPct)],
              [t("roiItem"), fmtPct(e.roiPct)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-dune-200 p-3 dark:border-dune-700">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-dune-500">{k}</p>
                <p className="mt-0.5 text-base font-bold text-dune-900 dark:text-dune-100">{v}</p>
              </div>
            ))}
          </div>

          {/* Inputs summary */}
          <section className="print-break">
            <h2 className="mb-2 border-b border-dune-200 pb-1 text-sm font-bold text-dune-900 dark:border-dune-700 dark:text-dune-100">
              {t("reportSec1Title")}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-3">
              {[
                [t("drawnRooftop"), `${e.grossAreaM2.toFixed(0)} m²`],
                [t("usable75"), `${e.usableAreaM2.toFixed(0)} m²`],
                [t("propTypeLabel"), e.inputs.propertyType === "residential" ? t("residentialLabel") : t("commercialLabel")],
                [t("govLabel"), `${getGovName(gov.key)} (GHI ${gov.ghi})`],
                [t("avgConsumptionLabel"), `${e.inputs.monthlyConsumptionKwh.toLocaleString()} ${isAr ? "ك.و.س" : "kWh"}`],
                [t("tariffScheduleLabel"), getTariffLabel(e.inputs.tariffSchedule)],
                [t("roofTypeLabel"), e.inputs.roofType === "flat" ? t("flatRoofLabel") : t("slopedRoofLabel")],
                [t("orientationLabel"), getOrientLabel(e.inputs.orientation)],
                [t("statPanels"), `${e.panels} × ${e.panelWattage} ${isAr ? "واط" : "Wp"}`],
                [t("costPerKwpLabel"), `${fmtOmr(e.inputs.costPerKwpOmr, 0)}/${isAr ? "ك.و.ب" : "kWp"}`],
                [t("netMeteringToggle"), e.inputs.netMetering ? (isAr ? "نعم" : "Yes") : (isAr ? "لا" : "No")],
                [t("analysisPeriodLabel"), `${e.inputs.analysisYears} ${isAr ? "سنوات" : "years"}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-dune-500">{k}</span>
                  <span className={`font-semibold text-dune-800 dark:text-dune-200 ${isAr ? "text-left" : "text-right"}`}>{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Generation */}
          <section className="print-break">
            <h2 className="mb-2 border-b border-dune-200 pb-1 text-sm font-bold text-dune-900 dark:border-dune-700 dark:text-dune-100">
              {t("reportSec2Title")}
            </h2>
            <p className="mb-3 text-xs leading-relaxed text-dune-600 dark:text-dune-300">
              {t("reportYieldSummary")
                .replace("{yield}", String(e.specificYieldKwhPerKwp))
                .replace("{pr}", fmtPct(e.performanceRatio * 100))
                .replace("{tempLoss}", fmtPct(e.losses.temperaturePct * 100))
                .replace("{soilingLoss}", fmtPct(e.losses.soilingPct * 100))
                .replace("{billWithout}", fmtOmr(e.annualBillWithoutOmr))
                .replace("{billWith}", fmtOmr(e.annualBillWithOmr))}
            </p>
            <div className="h-56">
              <SavingsChart estimate={e} />
            </div>
            <table className={`mt-3 w-full text-xs ${isAr ? "text-right" : "text-left"}`}>
              <thead>
                <tr className="border-b border-dune-200 text-dune-500 dark:border-dune-700">
                  <th className="py-1.5 px-2 font-semibold">{t("reportTableYear")}</th>
                  <th className="py-1.5 px-2 font-semibold">{t("reportTableGen")}</th>
                  <th className="py-1.5 px-2 font-semibold">{t("reportTableNetSavings")}</th>
                  <th className="py-1.5 px-2 font-semibold">{t("reportTableCumulative")}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 5, 10, 15, 20, e.yearly.length].filter((y, i, a) => i === 0 || y !== a[i - 1]).map((y) => {
                  const row = e.yearly[y - 1];
                  if (!row) return null;
                  return (
                    <tr key={y} className="border-b border-dune-100 dark:border-dune-800">
                      <td className="py-1.5 px-2 font-semibold text-dune-800 dark:text-dune-200">{isAr ? `السنة ${y}` : `Year ${y}`}</td>
                      <td className="py-1.5 px-2 text-dune-600 dark:text-dune-300">{fmtInt(row.generationKwh)}</td>
                      <td className="py-1.5 px-2 text-dune-600 dark:text-dune-300">{fmtOmr(row.savingsOmr)}</td>
                      <td className="py-1.5 px-2 font-semibold text-leaf-700 dark:text-leaf-300">{fmtOmr(row.cumulativeSavingsOmr)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Environment */}
          <section className="print-break">
            <h2 className="mb-2 border-b border-dune-200 pb-1 text-sm font-bold text-dune-900 dark:border-dune-700 dark:text-dune-100">
              {t("reportSec3Title")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [t("co2PerYrItem"), `${fmtTons(e.co2PerYearTons)}`],
                [t("co2LifeItem"), `${fmtTons(e.co2OverLifeTons)}`],
                [t("treesItem"), `${fmtInt(e.treesEquivalent)} ${isAr ? "شجرة" : "trees"}`],
                [t("carsItem"), `${e.carsEquivalent} ${isAr ? "سيارة" : "cars"}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-leaf-200 bg-leaf-50 p-3 dark:border-leaf-800 dark:bg-leaf-950">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-leaf-700 dark:text-leaf-400">{k}</p>
                  <p className="mt-0.5 text-sm font-bold text-leaf-800 dark:text-leaf-300">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-dune-400">
              {t("gridFactorItem")} {e.inputs.gridEmissionFactor.toFixed(2)} {isAr ? "طن CO₂/م.و.س" : "tCO₂/MWh"} ({isAr ? "شبكة عُمان الكهربائية" : "Oman grid"}).
            </p>
          </section>

          {/* Disclaimer */}
          <section className="rounded-xl border border-dune-200 bg-dune-50 p-4 text-[11px] leading-relaxed text-dune-500 dark:border-dune-700 dark:bg-dune-900 dark:text-dune-400 print-break">
            <b>{t("reportDisclaimerTitle")}</b> {t("reportDisclaimerBody")}
          </section>
        </div>
      </div>

      <div className="no-print mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="btn-primary !px-7 !py-3"
        >
          <svg className="h-4 w-4 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
          </svg>
          {t("printPdfBtn")}
        </button>
        <Link href="/#estimator" className="btn-secondary">
          {t("editInputsBtn")}
        </Link>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return <ReportContent />;
}
