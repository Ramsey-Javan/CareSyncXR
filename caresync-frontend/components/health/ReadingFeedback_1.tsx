import { HealthReading, getVitalFlag } from "@/lib/types/health";

interface Props {
  reading: HealthReading;
}

export default function ReadingFeedback({ reading }: Props) {
  const rows: { label: string; value: string; flag?: "high" | "low" }[] = [];

  if (reading.bp_systolic && reading.bp_diastolic) {
    const flag = getVitalFlag("bp_systolic", reading.bp_systolic);
    rows.push({
      label: "Blood pressure",
      value: `${reading.bp_systolic}/${reading.bp_diastolic} mmHg`,
      flag:  flag !== "normal" ? flag : undefined,
    });
  }
  if (reading.glucose) {
    const flag = getVitalFlag("glucose", reading.glucose);
    rows.push({
      label: `Glucose (${reading.glucose_mode === "post_meal" ? "post-meal" : "fasting"})`,
      value: `${reading.glucose.toFixed(1)} mmol/L`,
      flag:  flag !== "normal" ? flag : undefined,
    });
  }
  if (reading.weight)
    rows.push({ label: "Weight",      value: `${reading.weight} kg` });
  if (reading.temperature)
    rows.push({ label: "Temperature", value: `${reading.temperature.toFixed(1)}°C` });
  if (reading.o2_saturation) {
    const flag = getVitalFlag("o2_saturation", reading.o2_saturation);
    rows.push({ label: "SpO2", value: `${reading.o2_saturation}%`, flag: flag !== "normal" ? flag : undefined });
  }
  if (reading.heart_rate)
    rows.push({ label: "Heart rate",  value: `${reading.heart_rate} bpm` });

  const hasAlerts = rows.some((r) => r.flag);

  return (
    <div className="bg-teal-50 border border-teal-300 rounded-xl p-4 mb-4">
      <p className="text-sm font-medium text-teal-800 mb-3">✓ Reading saved</p>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-teal-700">{row.label}</span>
            <span className={`font-medium ${row.flag ? "text-red-700" : "text-teal-800"}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {hasAlerts && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rows.filter((r) => r.flag).map((r) => (
            <span key={r.label} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
              {r.label} {r.flag} — doctor notified
            </span>
          ))}
        </div>
      )}

      {reading.symptoms && reading.symptoms.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reading.symptoms.map((s) => (
            <span key={s} className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
