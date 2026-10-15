import type { SolarEstimate, SolarInputs } from "@/lib/solar/calculator";

export type WizardStep = 1 | 2 | 3;

export interface WizardState {
  step: WizardStep;
  inputs: SolarInputs;
  estimate: SolarEstimate | null;
  loading: boolean;
  error: string | null;
  /** Direction of the latest step change — drives RTL-aware directional transitions. */
  forward: boolean;
}

export type WizardAction =
  | { type: "SET_INPUTS"; inputs: SolarInputs }
  | { type: "PATCH_INPUTS"; patch: Partial<SolarInputs> }
  | { type: "SET_AREA"; areaM2: number }
  | { type: "GO"; step: WizardStep }
  | { type: "CALC_START" }
  | { type: "CALC_OK"; estimate: SolarEstimate }
  | { type: "CALC_ERR"; message: string }
  | { type: "RESET" };

export const STORAGE_KEY = "oman-solar-estimate-v1";
