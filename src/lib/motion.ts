import type { Transition } from "motion/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Shared motion vocabulary — Apple-style critically damped springs.
 *
 * Derived from normalized response/damping (Reanimated/SwiftUI convention):
 *   response (s) = 2π / √(stiffness / mass)
 *   damping ratio ζ = damping / (2 · √(stiffness · mass))
 *
 * ζ = 1.0 (critical) → the value arrives and STOPS: zero overshoot.
 * Locked decision (design record, Round 2 Q1): reliability over bounce.
 */
function criticalSpring(response: number, mass = 1): Transition {
  const stiffness = (((2 * Math.PI) / response) ** 2) * mass;
  const damping = 2 * Math.sqrt(stiffness * mass);
  return { type: "spring", stiffness, damping, mass };
}

/** Small controls — chips, toggles, presses. response ≈ 0.30s */
export const SPRING_SMALL = criticalSpring(0.3);

/** Default UI surfaces. response ≈ 0.35s */
export const SPRING_UI = criticalSpring(0.35);

/** Full steps / large surfaces. response ≈ 0.40s */
export const SPRING_SURFACE = criticalSpring(0.4);

/** Shared ease for duration-based entrances (Hero/Reveal vocabulary). */
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Sign for directional step transitions, mirrored for Arabic (RTL).
 * Returns +1 or -1 meaning "enter from the trailing side of travel":
 *   forward in LTR → +1 (enter from right), backward → -1;
 *   Arabic flips both. Never hardcode x-offsets — multiply through this hook.
 */
export function useSlideDirection(forward: boolean): number {
  const { isAr } = useLanguage();
  const sign = isAr ? -1 : 1;
  return forward ? sign : -sign;
}
