"use client";

import { motion } from "motion/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const EASE = [0.22, 1, 0.36, 1] as const;

/** 2×2 block of cached z15 satellite tiles over the Darsait demo zone. */
const TILES = [
  { x: 21711, y: 14170 },
  { x: 21712, y: 14170 },
  { x: 21711, y: 14171 },
  { x: 21712, y: 14171 },
];

export function Hero() {
  const { t, isAr } = useLanguage();

  return (
    <section className="bg-dune-950 text-dune-50">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="text-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex flex-wrap items-center gap-2"
          >
            {[t("heroTagOman"), t("heroTagSdg7"), t("heroTagSdg11"), t("heroTagNetZero")].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-dune-300 backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06, ease: EASE }}
            className="mt-7 text-5xl font-semibold leading-[1.0] tracking-[-0.04em] sm:text-6xl lg:text-7xl"
          >
            {t("heroTitlePart1")}
            <span className="gradient-text-sun">{t("heroTitleSun")}</span>
            {t("heroTitlePart2")}
            <span className="text-solar-400">{t("heroTitleSavings")}</span>
            {t("heroTitleEnd")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-dune-400"
          >
            {t("heroSub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
            className="mt-9"
          >
            <a href="#estimator" className="btn-accent !px-9 !py-4 !text-base group">
              {t("heroCta")}
              <span className={`transition-transform ${isAr ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
                {isAr ? "←" : "→"}
              </span>
            </a>
          </motion.div>
        </div>

        {/* Satellite "product shot": real cached imagery of the demo zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          className="relative mx-auto w-full max-w-[512px]"
        >
          <div className="grid aspect-square grid-cols-2 overflow-hidden rounded-3xl ring-1 ring-white/10">
            {TILES.map((tile) => (
              <img
                key={`${tile.x}/${tile.y}`}
                src={`/tiles/15/${tile.x}/${tile.y}.jpg`}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
                loading="eager"
              />
            ))}
          </div>

          {/* Traced-roof outline over the campus */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <polygon
              points="38,42 62,38 66,58 41,63"
              fill="rgba(245,158,11,0.15)"
              stroke="#fbbf24"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </svg>

          <span className="absolute bottom-4 start-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[11px] font-medium text-dune-200 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-solar-400" />
            {t("heroMapLabel")}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
