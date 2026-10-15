"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function Header() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, isAr, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  // Glass material engages once content scrolls beneath the header;
  // at rest the header is solid and clean.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-dune-200/60 bg-white/72 backdrop-blur-xl transition-shadow duration-300 dark:border-white/10 dark:bg-black/60 ${
        scrolled ? "shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5">
        <a href="/" className="flex items-center gap-2.5">
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-[-0.01em] text-dune-900 dark:text-dune-50">{t("headerTitle")}</span>
            <span className="block text-[10px] font-medium text-solar-600 dark:text-solar-400">{t("headerSubtitle")}</span>
          </span>
        </a>

        <div className="flex items-center gap-2">

          {/* Language Switcher */}
          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            aria-label="Switch language"
            className="flex items-center gap-1.5 rounded-full border border-dune-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-dune-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-dune-200 dark:hover:bg-white/10"
          >
            <span>{isAr ? "🇬🇧" : "🇴🇲"}</span>
            <span>{t("switchLang")}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="grid h-8 w-8 place-items-center rounded-full border border-dune-200/80 bg-white/70 text-dune-600 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-dune-300 dark:hover:bg-white/10"
          >
            {theme === "dark" ? <SunIcon className="h-[16px] w-[16px]" /> : <MoonIcon className="h-[16px] w-[16px]" />}
          </button>
        </div>
      </div>
    </header>
  );
}
