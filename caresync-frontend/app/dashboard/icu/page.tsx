"use client";

import Link from "next/link";
import { Radio, Siren } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { CareTimeline } from "@/components/dashboard/CareTimeline";
import { manualSOS } from "@/lib/stream/hospitalStream";
import { cn } from "@/lib/utils";

export default function LiveMonitoringPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const timeline = useHospitalStore((s) => s.timeline);
  const caregiverLogs = useHospitalStore((s) => s.caregiverLogs);

  if (!patient) {
    return (
      <PageShell>
        <DashboardCard padding="lg">
          <p className="text-sm text-slate-500">Loading care profile…</p>
        </DashboardCard>
      </PageShell>
    );
  }

  const isCritical = patient.status === "critical";

  return (
    <PageShell fullWidth>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-2 text-emerald-600 font-medium">
            <Radio className="w-4 h-4 animate-pulse-live" />
            Live stream · one care journey
          </span>
          {isCritical && (
            <Link
              href="/dashboard/command-center"
              className="text-red-600 font-semibold hover:underline"
            >
              Critical vitals — open SOS center
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <DashboardCard
          padding="lg"
          variant={isCritical ? "critical" : patient.status === "warning" ? "warning" : "glass"}
          className={cn("xl:col-span-5", isCritical && "animate-pulse-emergency")}
        >
          <DashboardCardHeader
            title={patient.name}
            description={patient.room}
          />
          <div className="flex items-center justify-between gap-3 mb-4">
            <StatusBadge status={patient.status} />
            <span className="font-mono text-xs text-cyan-600">{patient.patientCode}</span>
          </div>
          {patient.caregiverName && (
            <p className="text-xs text-slate-500 mb-4">
              Caregiver:{" "}
              <span className="font-medium text-slate-700">{patient.caregiverName}</span>
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <Vital label="HR" value={`${patient.vitals.heartRate}`} unit="bpm" warn={patient.vitals.heartRate > 110} />
            <Vital label="SpO₂" value={`${patient.vitals.oxygen}`} unit="%" warn={patient.vitals.oxygen < 92} />
            <Vital label="BP" value={patient.vitals.bp} />
            <Vital label="Temp" value={`${patient.vitals.temperature}`} unit="°C" />
          </div>

          <div className="rounded-xl bg-slate-50 border p-3 mb-4">
            <VitalsChart history={patient.history} />
          </div>

          <button
            type="button"
            onClick={() => manualSOS()}
            className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <Siren className="w-4 h-4" />
            Trigger SOS
          </button>
        </DashboardCard>

        <div className="xl:col-span-4 space-y-6">
          <PageSection title="Detailed vitals">
            <DashboardCard padding="md">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Respiratory rate" value={`${patient.vitals.respiratoryRate}/min`} />
                <Detail label="Systolic" value={`${patient.vitals.systolic} mmHg`} />
                <Detail label="Diastolic" value={`${patient.vitals.diastolic} mmHg`} />
                <Detail label="Last sync" value={new Date(patient.vitals.timestamp).toLocaleTimeString()} />
              </dl>
              {patient.manualVitals && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-cyan-800">Caregiver manual</p>
                  {patient.manualVitals.glucose != null && (
                    <p>Glucose: {patient.manualVitals.glucose} mg/dL</p>
                  )}
                  {patient.manualVitals.symptoms && (
                    <p>Symptoms: {patient.manualVitals.symptoms}</p>
                  )}
                </div>
              )}
            </DashboardCard>
          </PageSection>

          <PageSection title="Care timeline">
            <DashboardCard padding="md">
              <CareTimeline entries={timeline} limit={8} />
            </DashboardCard>
          </PageSection>
        </div>

        <div className="xl:col-span-3">
          <PageSection title="Caregiver actions">
            <DashboardCard padding="md">
              {caregiverLogs.length === 0 ? (
                <p className="text-sm text-slate-500">No recent caregiver logs</p>
              ) : (
                <ul className="space-y-3">
                  {caregiverLogs.slice(0, 6).map((log) => (
                    <li key={log.id} className="text-xs border-b border-slate-50 pb-2 last:border-0">
                      <span className="font-medium text-slate-800">{log.summary}</span>
                      {log.detail && (
                        <p className="text-slate-500 mt-0.5">{log.detail}</p>
                      )}
                      <p className="text-slate-400 mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/dashboard/caregiver"
                className="mt-4 block text-center text-xs font-semibold text-cyan-700 hover:underline"
              >
                Open caregiver tools →
              </Link>
            </DashboardCard>
          </PageSection>
        </div>
      </div>
    </PageShell>
  );
}

function Vital({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: string;
  unit?: string;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-2.5 border text-center",
        warn ? "bg-red-50 border-red-100" : "bg-white border-slate-100"
      )}
    >
      <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
      <p className={cn("text-lg font-bold tabular-nums", warn && "text-red-600")}>
        {value}
        {unit && <span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase font-bold text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800 tabular-nums">{value}</dd>
    </div>
  );
}
