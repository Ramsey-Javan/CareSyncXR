"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import type { SOSTimelineStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EmergencyTimeline({ steps }: { steps: SOSTimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0",
                  step.status === "complete" &&
                    "bg-emerald-500 border-emerald-500 text-white",
                  step.status === "active" &&
                    "bg-cyan-500/20 border-cyan-500 text-cyan-600",
                  step.status === "pending" &&
                    "bg-slate-50 border-slate-200 text-slate-400"
                )}
              >
                {step.status === "complete" ? (
                  <Check className="w-4 h-4" />
                ) : step.status === "active" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "w-0.5 flex-1 min-h-[24px] my-1",
                    step.status === "complete" ? "bg-emerald-300" : "bg-slate-200"
                  )}
                />
              )}
            </div>
            <div className="pb-6 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.status === "pending" ? "text-slate-400" : "text-slate-900"
                )}
              >
                {step.label}
              </p>
              {step.at && (
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {new Date(step.at).toLocaleTimeString()}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
