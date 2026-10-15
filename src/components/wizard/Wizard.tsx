"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { estimateSolar, DEFAULT_INPUTS, type SolarInputs } from "@/lib/solar/calculator";
import { SPRING_SURFACE, useSlideDirection } from "@/lib/motion";
import type { WizardAction, WizardState } from "@/types";
import { StepLocation } from "@/components/wizard/StepLocation";
import { StepProperty } from "@/components/wizard/StepProperty";
import { StepResults } from "@/components/wizard/StepResults";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const RoofMap = dynamic(() => import("@/components/map/RoofMap").then((m) => m.RoofMap), {
  ssr: false,
  loading: () => (
    // Skeleton (not a spinner): the map is a surface that arrives, not a wait.
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-dune-200 bg-dune-100 dark:border-dune-800 dark:bg-dune-900 sm:h-[500px]">
      <div className="h-full w-full animate-pulse bg-gradient-to-br from-dune-200/80 via-dune-100/40 to-dune-200/60 dark:from-dune-800/80 dark:via-dune-900/40 dark:to-dune-800/60" />
    </div>
  ),
});

const initialState: WizardState = {
  step: 1,
  inputs: { ...DEFAULT_INPUTS },
  estimate: null,
  loading: false,
  error: null,
  forward: true,
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "PATCH_INPUTS":
      return { ...state, inputs: { ...state.inputs, ...action.patch } };
    case "SET_AREA":
      return { ...state, inputs: { ...state.inputs, roofAreaM2: action.areaM2 } };
    case "GO":
      return { ...state, step: action.step, forward: action.step > state.step, error: null };
    case "CALC_START":
      return { ...state, loading: true, error: null };
    case "CALC_OK":
      return { ...state, loading: false, estimate: action.estimate, step: 3, forward: true };
    case "CALC_ERR":
      return { ...state, loading: false, error: action.message };
    case "RESET":
      return { ...initialState, inputs: { ...DEFAULT_INPUTS }, forward: false };
    default:
      return state;
  }
}

const STEPS = [
  { n: 1, labelKey: "step1Label" as const },
  { n: 2, labelKey: "step2Label" as const },
  { n: 3, labelKey: "step3Label" as const },
];

/**
 * Directional step transitions: content enters from the trailing side of travel
 * and exits toward the leading side; `custom` (the RTL-mirrored sign from
 * useSlideDirection) drives both — exit reads it live from AnimatePresence.
 */
const stepVariants = {
  enter: (s: number) => ({ opacity: 0, x: 28 * s }),
  center: { opacity: 1, x: 0 },
  exit: (s: number) => ({ opacity: 0, x: -28 * s }),
};

export function Wizard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputsRef = useRef<SolarInputs>(state.inputs);
  inputsRef.current = state.inputs;
  const { t, isAr } = useLanguage();
  const sign = useSlideDirection(state.forward);
  const firstStepRender = useRef(true);

  async function calculate() {
    dispatch({ type: "CALC_START" });
    let res: Response;
    try {
      res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputsRef.current),
      });
    } catch {
      // Network failure — graceful client-side fallback (shared engine)
      dispatch({ type: "CALC_OK", estimate: estimateSolar(inputsRef.current) });
      return;
    }
    if (res.ok) {
      const data = await res.json();
      dispatch({ type: "CALC_OK", estimate: data.estimate });
      return;
    }
    let message = isAr ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* non-JSON error body */
    }
    dispatch({ type: "CALC_ERR", message });
  }

  // Wayfinding: a step change always reveals its destination (skips the first
  // render so landing-page load never auto-scrolls). Reduced motion = instant.
  useEffect(() => {
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    const el = document.getElementById("estimator");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight - 96) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [state.step]);

  return (
    <div id="estimator" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-600 dark:text-solar-400">
          {t("estimatorEyebrow")}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-dune-900 dark:text-dune-50 sm:text-4xl">
          {t("estimatorTitle")}
        </h2>
      </div>

      {/* Step indicator */}
      <ol className="mx-auto mb-8 flex max-w-2xl items-center justify-center">
        {STEPS.map((s, i) => {
          const active = state.step === s.n;
          const done = state.step > s.n;
          return (
            <li key={s.n} className="flex items-center">
              {i > 0 && <span className={`mx-2 h-0.5 w-8 rounded sm:w-12 ${done ? "bg-leaf-500" : "bg-dune-200 dark:bg-dune-700"}`} />}
              <button
                onClick={() => done && dispatch({ type: "GO", step: s.n as 1 | 2 | 3 })}
                className={`flex flex-col items-center gap-1.5 ${done ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full border-2 text-[15px] font-semibold transition ${
                    active
                      ? "border-solar-500 bg-solar-500 text-white shadow-glow"
                      : done
                        ? "border-solar-500 bg-solar-50 text-solar-700 dark:bg-solar-500/10 dark:text-solar-300"
                        : "border-dune-200 bg-white text-dune-400 dark:border-dune-700 dark:bg-dune-800"
                  }`}
                >
                  {done ? "✓" : s.n}
                </span>
                <span className={`text-[11px] font-semibold ${active ? "text-leaf-600 dark:text-leaf-400" : "text-dune-400"}`}>
                  {t(s.labelKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {state.error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </div>
      )}

      <motion.div layout transition={SPRING_SURFACE} className="relative">
        <AnimatePresence mode="popLayout" initial={false} custom={sign}>
          {state.step === 1 && (
            <motion.div
              key="step-1"
              custom={sign}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              layout
              transition={SPRING_SURFACE}
            >
              <StepLocation area={state.inputs.roofAreaM2} onAreaChange={(a) => dispatch({ type: "SET_AREA", areaM2: a })}>
                <RoofMap
                  area={state.inputs.roofAreaM2}
                  onAreaChange={(a) => dispatch({ type: "SET_AREA", areaM2: a })}
                  governorate={state.inputs.governorate}
                  onGovernorateChange={(key) => dispatch({ type: "PATCH_INPUTS", patch: { governorate: key } })}
                />
              </StepLocation>
              <div className="mt-6 flex justify-end">
                <button
                  className="btn-primary"
                  disabled={state.inputs.roofAreaM2 < 20}
                  onClick={() => dispatch({ type: "GO", step: 2 })}
                >
                  {t("continueToDetails")}
                </button>
              </div>
              {state.inputs.roofAreaM2 < 20 && (
                <p className={`mt-2 text-xs text-dune-400 ${isAr ? "text-left" : "text-right"}`}>
                  {t("minAreaWarning")}
                </p>
              )}
            </motion.div>
          )}

          {state.step === 2 && (
            <motion.div
              key="step-2"
              custom={sign}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              layout
              transition={SPRING_SURFACE}
            >
              <StepProperty inputs={state.inputs} onChange={(patch) => dispatch({ type: "PATCH_INPUTS", patch })} />
              <div className="mt-6 flex items-center justify-between">
                <button className="btn-secondary" onClick={() => dispatch({ type: "GO", step: 1 })}>
                  {t("backToMapBtn")}
                </button>
                <button className="btn-primary !px-7 !py-3 !text-base" onClick={calculate} disabled={state.loading}>
                  {state.loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {t("calculatingText")}
                    </>
                  ) : (
                    t("calculateBtn")
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {state.step === 3 && state.estimate && (
            <motion.div
              key="step-3"
              custom={sign}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              layout
              transition={SPRING_SURFACE}
            >
              <StepResults
                estimate={state.estimate}
                onBack={() => dispatch({ type: "GO", step: 2 })}
                onReset={() => dispatch({ type: "RESET" })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
