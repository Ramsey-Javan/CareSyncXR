import type { PatientStatus } from "./types";

export type VitalsInput = {
  heartRate: number;
  oxygen: number;
  bp: string;
};

export type AIResponse = {
  severity: PatientStatus;
  explanation: string;
  recommendation: string;
};

export function analyzeVitalsLocal(v: VitalsInput): AIResponse {
  const { heartRate: hr, oxygen: ox } = v;

  if (hr > 125 || ox < 85) {
    return {
      severity: "critical",
      explanation:
        "Severe physiological instability detected. Heart rate significantly elevated and oxygen saturation dangerously low.",
      recommendation:
        "Immediate medical intervention required. Initiate emergency response and start video consultation.",
    };
  }

  if (hr > 100 || ox < 92) {
    return {
      severity: "warning",
      explanation:
        "Abnormal vitals detected indicating possible deterioration in patient condition.",
      recommendation:
        "Increase monitoring frequency and prepare for possible escalation.",
    };
  }

  return {
    severity: "stable",
    explanation:
      "Vitals within acceptable physiological range. No immediate risk detected.",
    recommendation: "Continue routine monitoring and scheduled check-ins.",
  };
}
