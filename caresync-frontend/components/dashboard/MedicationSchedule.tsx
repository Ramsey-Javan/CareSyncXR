"use client";

import { AlertTriangle, Check, Clock } from "lucide-react";
import type { MedicationDose } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MedicationSchedule({
  medications,
  onAdminister,
  compact,
}: {
  medications: MedicationDose[];
  onAdminister: (id: string) => void;
  compact?: boolean;
}) {
  if (medications.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4 text-center">
        No medications scheduled
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", compact && "space-y-1.5")}>
      {medications.map((m) => (
        <li
          key={m.id}
          className={cn(
            "rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center gap-3",
            m.missed
              ? "border-yellow-300 bg-yellow-50/80"
              : "border-slate-100 bg-slate-50/50"
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm">{m.name}</p>
              {m.missed && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-yellow-700 bg-yellow-200/80 px-1.5 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3" />
                  Missed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {m.dosage} · {m.schedule.join(", ")}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Next: {new Date(m.nextDueAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" · "}
              {m.adherencePercent}% adherence
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdminister(m.id)}
            className={cn(
              "shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors",
              "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
            )}
          >
            <Check className="w-3.5 h-3.5" />
            Mark administered
          </button>
        </li>
      ))}
    </ul>
  );
}
