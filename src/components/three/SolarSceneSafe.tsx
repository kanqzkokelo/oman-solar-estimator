"use client";

import { Component, type ReactNode } from "react";
import { SolarScene, type SolarSceneData } from "./SolarScene";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

class Boundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function SolarSceneSafe({ data }: { data: SolarSceneData }) {
  const { t, isAr } = useLanguage();

  const fallback = (
    <div className="grid h-[340px] w-full place-items-center rounded-2xl bg-[#04070d] text-center sm:h-[400px]">
      <p className="px-6 text-xs leading-relaxed text-solar-300">
        <b>{data.panels} {isAr ? "لوح" : "panels"} · {data.systemKwp.toFixed(1)} {isAr ? "ك.و.ب" : "kWp"}</b>
        <span className="mt-1 block text-[11px] text-dune-400">
          {t("previewUnavailable")}
        </span>
      </p>
    </div>
  );

  if (typeof window === "undefined" || !hasWebGL()) return fallback;
  return (
    <Boundary fallback={fallback}>
      <SolarScene data={data} />
    </Boundary>
  );
}
