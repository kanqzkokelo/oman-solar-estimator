"use client";

import { useState } from "react";
import { GOVERNORATES, DEFAULTS, getGovernorate } from "@/lib/solar/constants";
import type { SolarInputs as Inputs } from "@/lib/solar/calculator";
import { billFor, billToConsumption, type TariffSchedule } from "@/lib/solar/tariffs";
import { Accordion, Callout, Field, Segmented, Toggle } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-dune-600 dark:text-dune-300">{label}</span>
        <span className="text-xs font-bold text-leaf-700 dark:text-leaf-300">
          {display}
          {unit && <span className="mx-0.5 font-medium text-dune-400">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-leaf-600"
      />
    </div>
  );
}

export function StepProperty({
  inputs,
  onChange,
}: {
  inputs: Inputs;
  onChange: (patch: Partial<Inputs>) => void;
}) {
  const { t, isAr, fmtOmr, fmtPct } = useLanguage();
  const gov = getGovernorate(inputs.governorate);
  const bill = billFor(inputs.monthlyConsumptionKwh, inputs.tariffSchedule);
  const kwh = inputs.monthlyConsumptionKwh;
  const [consumptionMode, setConsumptionMode] = useState<"omr" | "kwh">("omr");

  const setPropertyType = (tType: Inputs["propertyType"]) => {
    onChange({
      propertyType: tType,
      tariffSchedule: tType === "commercial" ? "nonResidential" : "primary",
      monthlyConsumptionKwh:
        tType === "commercial" ? DEFAULTS.monthlyConsumptionCommercial : DEFAULTS.monthlyConsumptionResidential,
    });
  };

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

  const getTariffLabel = (key: TariffSchedule) => {
    switch (key) {
      case "primary": return t("tariffPrimary");
      case "additional": return t("tariffAdditional");
      case "nonResidential": return t("tariffNonRes");
    }
  };

  const propertyTypeOptions = [
    { key: "residential" as const, label: t("residentialLabel"), hint: t("residentialHint") },
    { key: "commercial" as const, label: t("commercialLabel"), hint: t("commercialHint") },
  ];

  const roofTypeOptions = [
    { key: "flat" as const, label: t("flatRoofLabel"), hint: t("flatRoofHint") },
    { key: "sloped" as const, label: t("slopedRoofLabel"), hint: t("slopedRoofHint") },
  ];

  const orientationOptions = [
    { key: "south" as const, label: t("orientSouth") },
    { key: "southeast" as const, label: t("orientSoutheast") },
    { key: "southwest" as const, label: t("orientSouthwest") },
    { key: "east" as const, label: t("orientEast") },
    { key: "west" as const, label: t("orientWest") },
    { key: "mixed" as const, label: t("orientMixed") },
  ];

  const soilingOptions = [
    { key: "low" as const, label: t("soilingLow"), hint: t("soilingLowHint") },
    { key: "medium" as const, label: t("soilingMedium"), hint: t("soilingMediumHint") },
    { key: "high" as const, label: t("soilingHigh"), hint: t("soilingHighHint") },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <div className="card space-y-5 p-5">
          <div>
            <h3 className="text-sm font-bold text-dune-900 dark:text-dune-100">{t("step2Title")}</h3>
            <p className="mt-0.5 text-xs text-dune-500 dark:text-dune-400">{t("step2Sub")}</p>
          </div>

          <Field label={t("propTypeLabel")}>
            <Segmented value={inputs.propertyType} options={propertyTypeOptions} onChange={setPropertyType} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("avgConsumptionLabel")}>
              <div className="mb-2 grid grid-cols-2 gap-1.5">
                {(
                  [
                    { key: "omr", label: t("billOmrTab") },
                    { key: "kwh", label: t("usageKwhTab") },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setConsumptionMode(o.key)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      consumptionMode === o.key
                        ? "border-leaf-500 bg-leaf-50 text-leaf-700 dark:border-leaf-400 dark:bg-leaf-950 dark:text-leaf-300"
                        : "border-dune-200 text-dune-500 hover:border-dune-300 dark:border-dune-700 dark:text-dune-400"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {consumptionMode === "omr" ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-secondary !px-3 !py-2.5"
                      onClick={() => onChange({ monthlyConsumptionKwh: billToConsumption(Math.max(0, bill - 10), inputs.tariffSchedule) })}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={Math.round(bill * 10) / 10}
                      onChange={(e) =>
                        onChange({
                          monthlyConsumptionKwh: billToConsumption(Math.max(0, Number(e.target.value) || 0), inputs.tariffSchedule),
                        })
                      }
                      className="input-base text-center font-bold"
                    />
                    <button
                      className="btn-secondary !px-3 !py-2.5"
                      onClick={() => onChange({ monthlyConsumptionKwh: billToConsumption(bill + 10, inputs.tariffSchedule) })}
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-dune-500 dark:text-dune-400">
                    ≈ {kwh.toLocaleString()} {t("approxKwhMonth")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[20, 50, 100, 150, 250].map((p) => (
                      <button
                        key={p}
                        onClick={() => onChange({ monthlyConsumptionKwh: billToConsumption(p, inputs.tariffSchedule) })}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                          Math.round(bill) === p
                            ? "border-leaf-500 bg-leaf-50 text-leaf-700 dark:bg-leaf-950 dark:text-leaf-300"
                            : "border-dune-200 text-dune-500 hover:border-dune-300 dark:border-dune-700 dark:text-dune-400"
                        }`}
                      >
                        {p} {isAr ? "ر.ع." : "OMR"}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-secondary !px-3 !py-2.5"
                      onClick={() => onChange({ monthlyConsumptionKwh: Math.max(100, kwh - 500) })}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={kwh}
                      onChange={(e) => onChange({ monthlyConsumptionKwh: Math.max(0, Number(e.target.value) || 0) })}
                      className="input-base text-center font-bold"
                    />
                    <button
                      className="btn-secondary !px-3 !py-2.5"
                      onClick={() => onChange({ monthlyConsumptionKwh: kwh + 500 })}
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-dune-500 dark:text-dune-400">≈ {fmtOmr(bill, 2)} / {isAr ? "شهرياً" : "month"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[2000, 3500, 5500, 8000].map((p) => (
                      <button
                        key={p}
                        onClick={() => onChange({ monthlyConsumptionKwh: p })}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                          kwh === p
                            ? "border-leaf-500 bg-leaf-50 text-leaf-700 dark:bg-leaf-950 dark:text-leaf-300"
                            : "border-dune-200 text-dune-500 hover:border-dune-300 dark:border-dune-700 dark:text-dune-400"
                        }`}
                      >
                        {p.toLocaleString()} {isAr ? "ك.و.س" : "kWh"}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Field>

            <Field
              label={t("govLabel")}
              hint={`${t("govHint")} ${gov.ghi} ${isAr ? "ك.و.س/م²/يوم" : "kWh/m²/day"} GHI · ${gov.avgTempC}°C · ${Math.min(...gov.monthlyTempsC)}–${Math.max(...gov.monthlyTempsC)}°C`}
            >
              <select
                value={inputs.governorate}
                onChange={(e) => onChange({ governorate: e.target.value })}
                className="input-base"
              >
                {GOVERNORATES.map((g) => (
                  <option key={g.key} value={g.key}>
                    {getGovName(g.key)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {inputs.propertyType === "residential" && (
            <Field label={t("tariffScheduleLabel")} hint={t("tariffScheduleHint")}>
              <select
                value={inputs.tariffSchedule}
                onChange={(e) => onChange({ tariffSchedule: e.target.value as TariffSchedule })}
                className="input-base"
              >
                {(["primary", "additional"] as TariffSchedule[]).map((k) => (
                  <option key={k} value={k}>
                    {getTariffLabel(k)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {inputs.propertyType === "commercial" && (
            <Callout tone="info">{t("commercialCallout")}</Callout>
          )}
        </div>

        <div className="card space-y-5 p-5">
          <div>
            <h3 className="text-sm font-bold text-dune-900 dark:text-dune-100">{t("roofEnvTitle")}</h3>
            <p className="mt-0.5 text-xs text-dune-500 dark:text-dune-400">{t("roofEnvSub")}</p>
          </div>

          <Field label={t("roofTypeLabel")}>
            <Segmented value={inputs.roofType} options={roofTypeOptions} onChange={(v) => onChange({ roofType: v })} />
          </Field>

          <Field label={t("orientationLabel")}>
            <Segmented value={inputs.orientation} options={orientationOptions} onChange={(v) => onChange({ orientation: v })} />
          </Field>

          <Field label={t("soilingLabel")} hint={t("soilingHint")}>
            <Segmented value={inputs.soiling} options={soilingOptions} onChange={(v) => onChange({ soiling: v })} />
          </Field>

          <Toggle
            checked={inputs.netMetering}
            onChange={(v) => onChange({ netMetering: v })}
            label={t("netMeteringToggle")}
          />
        </div>

        <Accordion title={t("advancedSettingsTitle")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider
              label={t("costPerKwpLabel")}
              value={inputs.costPerKwpOmr}
              min={250}
              max={650}
              step={25}
              display={`${inputs.costPerKwpOmr}`}
              unit={isAr ? "ر.ع./ك.و.ب" : "OMR/kWp"}
              onChange={(v) => onChange({ costPerKwpOmr: v })}
            />
            <Slider
              label={t("usableRoofFactorLabel")}
              value={inputs.usableAreaFactor}
              min={0.5}
              max={0.95}
              step={0.05}
              display={fmtPct(inputs.usableAreaFactor * 100, 0)}
              onChange={(v) => onChange({ usableAreaFactor: v })}
            />
            <Slider
              label={t("capacityDensityLabel")}
              value={inputs.capacityDensityKwpM2}
              min={0.12}
              max={0.22}
              step={0.01}
              display={inputs.capacityDensityKwpM2.toFixed(2)}
              unit={isAr ? "ك.و.ب/م²" : "kWp/m²"}
              onChange={(v) => onChange({ capacityDensityKwpM2: v })}
            />
            <Slider
              label={t("panelWattageLabel")}
              value={inputs.panelWattage}
              min={400}
              max={600}
              step={25}
              display={`${inputs.panelWattage}`}
              unit={isAr ? "واط" : "Wp"}
              onChange={(v) => onChange({ panelWattage: v })}
            />
            <Slider
              label={t("exportCreditLabel")}
              value={inputs.exportRateOmr}
              min={0}
              max={0.032}
              step={0.001}
              display={`${Math.round(inputs.exportRateOmr * 1000)}`}
              unit={isAr ? "بيسة/ك.و.س" : "baisa/kWh"}
              onChange={(v) => onChange({ exportRateOmr: v })}
            />
            <Slider
              label={t("gridEmissionFactorLabel")}
              value={inputs.gridEmissionFactor}
              min={0.4}
              max={0.8}
              step={0.05}
              display={inputs.gridEmissionFactor.toFixed(2)}
              unit={isAr ? "طن CO₂/م.و.س" : "tCO₂/MWh"}
              onChange={(v) => onChange({ gridEmissionFactor: v })}
            />
            <Slider
              label={t("tariffEscalationLabel")}
              value={inputs.tariffEscalation}
              min={0}
              max={0.05}
              step={0.005}
              display={fmtPct(inputs.tariffEscalation * 100, 1)}
              onChange={(v) => onChange({ tariffEscalation: v })}
            />
            <Slider
              label={t("analysisPeriodLabel")}
              value={inputs.analysisYears}
              min={10}
              max={30}
              step={5}
              display={`${inputs.analysisYears}`}
              unit={isAr ? "سنوات" : "years"}
              onChange={(v) => onChange({ analysisYears: v })}
            />
          </div>
        </Accordion>
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <p className="label">{t("liveSummaryTitle")}</p>
          <dl className="space-y-2 text-xs">
            {[
              [t("liveSummaryArea"), `${inputs.roofAreaM2.toFixed(0)} m²`],
              [t("liveSummarySystemSize"), `${((inputs.roofAreaM2 * inputs.usableAreaFactor * inputs.capacityDensityKwpM2)).toFixed(1)} ${isAr ? "ك.و.ب" : "kWp"}`],
              [t("liveSummaryTariff"), getTariffLabel(inputs.tariffSchedule)],
              [t("liveSummaryCurrentBill"), `${fmtOmr(bill, 2)} / ${isAr ? "شهرياً" : "month"}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-3">
                <dt className="text-dune-500 dark:text-dune-400">{k}</dt>
                <dd className={`font-semibold text-dune-800 dark:text-dune-200 ${isAr ? "text-left" : "text-right"}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Callout tone="good">
          <b>{t("goodToKnowTitle")}</b> {t("goodToKnowBody")}
        </Callout>
      </aside>
    </div>
  );
}
