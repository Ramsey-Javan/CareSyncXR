"use client";

import Link from "next/link";
import { Bell, Brain, Siren, UserRound, Video } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { SOSRoutingPanel } from "@/components/dashboard/SOSRoutingPanel";
import { LocationMap } from "@/components/dashboard/LocationMap";
import { EmergencyTimeline } from "@/components/dashboard/EmergencyTimeline";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";
import { PageShell } from "@/components/dashboard/PageShell";
import { analyzeVitalsLocal } from "@/lib/aiEmergencyBrain";
import { manualSOS } from "@/lib/stream/hospitalStream";
import { cn } from "@/lib/utils";

export default function EmergencySOSCenterPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const sosEvents = useHospitalStore((s) => s.sosEvents);
  const emergency = useHospitalStore((s) => s.emergency);
  const alerts = useHospitalStore((s) => s.alerts).filter((a) => !a.acknowledged);

  const activeSos = sosEvents[0] ?? null;

  const ai = patient
    ? analyzeVitalsLocal({
        heartRate: patient.vitals.heartRate,
        oxygen: patient.vitals.oxygen,
        bp: patient.vitals.bp,
      })
    : null;

  return (
    <PageShell fullWidth>
      {(emergency.active || sosEvents.length > 0) && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-500/10 via-red-50 to-white p-4 flex flex-wrap items-center justify-between gap-4 animate-pulse-emergency">
          <div className="flex items-center gap-3">
            <Siren className="w-6 h-6 text-red-500 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-red-800 uppercase tracking-wide">
                SOS active — {patient?.name ?? "care recipient"}
              </p>
              <p className="text-xs text-red-600/90 mt-0.5">
                GPS captured · hospital routing · caregiver & kin notified
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/home-care"
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            Return to home care
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          {activeSos ? (
            <>
              <LocationMap
                location={activeSos.location}
                hospitalLabel={activeSos.routing?.hospitalName}
                className="min-h-[280px]"
              />
              <DashboardCard padding="md">
                <DashboardCardHeader
                  title="Emergency escalation timeline"
                  description={activeSos.patientName ?? activeSos.patientCode}
                />
                <EmergencyTimeline
                  steps={activeSos.timeline ?? []}
                />
              </DashboardCard>
            </>
          ) : (
            <DashboardCard padding="lg" className="min-h-[280px] flex items-center justify-center">
              <p className="text-sm text-slate-500 text-center max-w-sm">
                No active SOS. Critical wearable vitals or manual trigger will
                activate emergency mode for {patient?.name ?? "your loved one"}.
              </p>
            </DashboardCard>
          )}

          {activeSos?.routing && (
            <DashboardCard padding="md">
              <DashboardCardHeader title="Nearest hospital assignment" />
              <p className="text-lg font-bold text-slate-900">
                {activeSos.routing.hospitalName}
              </p>
              <div className="flex gap-6 mt-2 text-sm text-slate-600">
                <span>{activeSos.routing.distanceKm.toFixed(1)} km away</span>
                <span>ETA {activeSos.routing.etaMinutes} min</span>
                <span className="capitalize text-cyan-700 font-medium">
                  {activeSos.routing.status.replace("_", " ")}
                </span>
              </div>
            </DashboardCard>
          )}
        </div>

        <div className="xl:col-span-5 space-y-4">
          {activeSos?.notifications && (
            <DashboardCard padding="md">
              <DashboardCardHeader title="Alert delivery status" />
              <NotificationRow
                label="Assigned caregiver"
                status={activeSos.notifications.caregiver}
                icon={UserRound}
              />
              <NotificationRow
                label="Next of kin"
                status={activeSos.notifications.nextOfKin}
                icon={Bell}
                className="mt-3"
              />
            </DashboardCard>
          )}

          <DashboardCard padding="md">
            <DashboardCardHeader
              title="SOS history"
              description={`${sosEvents.length} event(s) for this care journey`}
            />
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {sosEvents.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Monitoring wearable stream…
                </p>
              ) : (
                sosEvents.map((e) => <SOSRoutingPanel key={e.id} event={e} />)
              )}
            </div>
          </DashboardCard>

          {patient && (
            <DashboardCard padding="md">
              <DashboardCardHeader title="Care recipient monitor" />
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-slate-900">{patient.name}</p>
                <StatusBadge status={patient.status} />
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3 text-center text-sm">
                <MetricPill label="HR" value={`${patient.vitals.heartRate}`} alert={patient.vitals.heartRate > 110} />
                <MetricPill label="SpO₂" value={`${patient.vitals.oxygen}%`} alert={patient.vitals.oxygen < 92} />
                <MetricPill label="BP" value={patient.vitals.bp} />
                <MetricPill label="Temp" value={`${patient.vitals.temperature}°`} />
              </div>
              <VitalsChart history={patient.history} />
              {ai && (
                <p className="text-xs text-slate-600 mt-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
                  <Brain className="w-3.5 h-3.5 inline mr-1 text-cyan-600" />
                  {ai.explanation}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => manualSOS()}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold"
                >
                  Trigger SOS
                </button>
                <Link
                  href={`/dashboard/consultations/video?patientId=${patient.id}`}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold"
                >
                  <Video className="w-3.5 h-3.5" />
                  Video
                </Link>
              </div>
            </DashboardCard>
          )}

          {alerts.length > 0 && (
            <DashboardCard padding="md">
              <p className="text-xs text-yellow-700 font-medium">
                {alerts.length} unacknowledged alert(s) for this care journey
              </p>
            </DashboardCard>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function NotificationRow({
  label,
  status,
  icon: Icon,
  className,
}: {
  label: string;
  status: "pending" | "sent" | "acknowledged";
  icon: typeof Bell;
  className?: string;
}) {
  const colors = {
    pending: "text-slate-400 bg-slate-100",
    sent: "text-yellow-700 bg-yellow-100",
    acknowledged: "text-emerald-700 bg-emerald-100",
  };
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="flex items-center gap-2 text-sm text-slate-700">
        <Icon className="w-4 h-4 text-slate-400" />
        {label}
      </span>
      <span
        className={cn(
          "text-[10px] font-bold uppercase px-2 py-1 rounded-lg",
          colors[status]
        )}
      >
        {status}
      </span>
    </div>
  );
}

function MetricPill({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-2 border text-xs",
        alert ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"
      )}
    >
      <p className="text-[9px] uppercase text-slate-400 font-bold">{label}</p>
      <p className={cn("font-bold tabular-nums", alert && "text-red-600")}>
        {value}
      </p>
    </div>
  );
}
