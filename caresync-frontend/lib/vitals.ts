import type { PatientStatus, VitalsSnapshot } from "./types";

export function classifyVitals(v: Pick<VitalsSnapshot, "heartRate" | "oxygen">): PatientStatus {
  if (v.oxygen < 85 || v.heartRate > 130) return "critical";
  if (v.oxygen < 92 || v.heartRate > 110) return "warning";
  return "stable";
}

export function jitterVitals(current: VitalsSnapshot): VitalsSnapshot {
  const heartRate = clamp(
    current.heartRate + rand(-4, 6),
    55,
    165
  );
  const oxygen = clamp(
    Math.round((current.oxygen + rand(-2, 2)) * 10) / 10,
    78,
    100
  );
  const systolic = clamp(current.systolic + rand(-5, 8), 90, 190);
  const diastolic = clamp(current.diastolic + rand(-3, 5), 55, 120);
  const temperature = clamp(
    Math.round((current.temperature + rand(-0.2, 0.2)) * 10) / 10,
    35.5,
    40.5
  );
  const respiratoryRate = clamp(
    current.respiratoryRate + rand(-2, 3),
    10,
    32
  );

  return {
    heartRate,
    oxygen,
    systolic,
    diastolic,
    bp: `${systolic}/${diastolic}`,
    temperature,
    respiratoryRate,
    timestamp: new Date().toISOString(),
  };
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
