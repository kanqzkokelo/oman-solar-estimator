"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DICT, type Language, type TranslationKeys } from "./dict";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isAr: boolean;
  dir: "ltr" | "rtl";
  t: (key: TranslationKeys) => string;
  // Localized formatters
  fmtOmr: (v: number, digits?: number) => string;
  fmtBaisaPerKwh: (v: number) => string;
  fmtM2: (v: number) => string;
  fmtPct: (v: number, digits?: number) => string;
  fmtTons: (v: number) => string;
  fmtKwh: (v: number) => string;
  fmtYears: (v: number) => string;
  fmtInt: (v: number) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Language | null;
      if (saved === "en" || saved === "ar") {
        setLangState(saved);
        document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = saved;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("lang", newLang);
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLang;
    } catch {
      /* ignore */
    }
  };

  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";

  const t = (key: TranslationKeys): string => {
    return DICT[lang][key] ?? DICT.en[key] ?? String(key);
  };

  const fmtInt = (v: number): string => {
    return Math.round(v).toLocaleString(isAr ? "ar-OM" : "en-US");
  };

  const fmtOmr = (v: number, digits = 2): string => {
    const num = v.toLocaleString(isAr ? "ar-OM" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return isAr ? `${num} ر.ع.` : `${num} OMR`;
  };

  const fmtBaisaPerKwh = (v: number): string => {
    const num = Math.round(v * 1000).toLocaleString(isAr ? "ar-OM" : "en-US");
    return isAr ? `${num} بيسة/ك.و.س` : `${num} baisa/kWh`;
  };

  const fmtM2 = (v: number): string => {
    const num = v.toLocaleString(isAr ? "ar-OM" : "en-US", { maximumFractionDigits: 1 });
    return isAr ? `${num} م²` : `${num} m²`;
  };

  const fmtPct = (v: number, digits = 1): string => {
    return `${v.toFixed(digits)}%`;
  };

  const fmtTons = (v: number): string => {
    const num = v.toLocaleString(isAr ? "ar-OM" : "en-US", { maximumFractionDigits: 2 });
    return isAr ? `${num} طن` : `${num} t`;
  };

  const fmtKwh = (v: number): string => {
    if (v >= 1_000_000) return isAr ? `${(v / 1_000_000).toFixed(2)} مليون` : `${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 10_000) return isAr ? `${(v / 1000).toFixed(1)} ألف` : `${(v / 1000).toFixed(1)}k`;
    return Math.round(v).toLocaleString(isAr ? "ar-OM" : "en-US");
  };

  const fmtYears = (v: number): string => {
    if (!isFinite(v)) return "—";
    if (v < 0.05) return isAr ? "< 1 سنة" : "< 1 yr";
    if (v > 50) return isAr ? "> 50 سنة" : "> 50 yrs";
    return isAr ? `${v.toFixed(1)} سنة` : `${v.toFixed(1)} yrs`;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        isAr,
        dir,
        t,
        fmtOmr,
        fmtBaisaPerKwh,
        fmtM2,
        fmtPct,
        fmtTons,
        fmtKwh,
        fmtYears,
        fmtInt,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
