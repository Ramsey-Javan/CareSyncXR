"use client";

import { Radio, Watch, Wifi } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { cn } from "@/lib/utils";

export default function WearablesPage() {
  const wearable = useHospitalStore((s) => s.wearable);
  const patient = useHospitalStore((s) => s.activePatient);

  if (!wearable || !patient) {
    return (
      <PageShell>
        <DashboardCard padding="lg">
          <p className="text-sm text-slate-500">No wearable linked to care profile.</p>
        </DashboardCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageSection
        title="Wearable telemetry"
        description={`Device stream for ${patient.name} — personal remote care`}
      >
        <DashboardCard variant="glass" padding="md" className="max-w-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Watch className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{wearable.model}</p>
              <p className="text-xs text-slate-400">{wearable.id}</p>
            </div>
            {wearable.streaming && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <Radio className="w-3 h-3 animate-pulse-live" />
                Live
              </span>
            )}
          </div>

          <p className="font-mono text-sm text-cyan-600 bg-cyan-500/5 rounded-xl px-3 py-2 mb-4">
            {wearable.patientCode}
          </p>

          <p className="text-sm text-slate-600 mb-4">
            {patient.name} · {patient.room}
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Battery</span>
                <span className="font-medium tabular-nums">{wearable.battery}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    wearable.battery < 25 ? "bg-yellow-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${wearable.battery}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-cyan-500" />
                Signal
              </span>
              <span className="font-medium tabular-nums">{wearable.signalStrength}%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <span className="text-slate-500">
              HR <strong className="text-slate-800">{patient.vitals.heartRate}</strong>
            </span>
            <span className="text-slate-500">
              O₂ <strong className="text-slate-800">{patient.vitals.oxygen}%</strong>
            </span>
          </div>
        </DashboardCard>
      </PageSection>
    </PageShell>
  );
}
