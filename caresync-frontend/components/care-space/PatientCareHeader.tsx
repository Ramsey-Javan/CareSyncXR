"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Radio, Siren, Watch } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import { getCalmStatusChip } from "@/lib/personalization";
import { manualSOS } from "@/lib/stream/hospitalStream";

export function PatientCareHeader() {
  const patient = useHospitalStore((s) => s.activePatient);
  const wearable = useHospitalStore((s) => s.wearable);
  const emergency = useHospitalStore((s) => s.emergency);
  const streamConnected = useHospitalStore((s) => s.streamConnected);

  if (!patient) return null;

  const chip = getCalmStatusChip(patient.status);
  const isEmergency = emergency.active || patient.status === "critical";

  return (
    <motion.header
      layout
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-colors duration-500",
        isEmergency
          ? "border-red-500/40 bg-gradient-to-br from-slate-900 via-red-950/40 to-slate-900 text-white animate-pulse-emergency"
          : "border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-medical text-slate-900"
      )}
    >
      {!isEmergency && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-cyan-500/[0.06]" />
      )}
      {isEmergency && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.15),transparent_60%)]" />
      )}

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] mb-2",
              isEmergency ? "text-red-300" : "text-emerald-600"
            )}
          >
            Patient care space
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {patient.name}
            </h2>
            <StatusBadge status={patient.status} />
          </div>
          <p
            className={cn(
              "mt-1 text-sm flex items-center gap-1.5",
              isEmergency ? "text-slate-300" : "text-slate-500"
            )}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {patient.room}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                chip.tone === "emerald" &&
                  !isEmergency &&
                  "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
                chip.tone === "yellow" &&
                  "bg-yellow-500/15 text-yellow-800 border border-yellow-500/25",
                chip.tone === "red" &&
                  "bg-red-500/20 text-red-200 border border-red-500/30"
              )}
            >
              {chip.label}
            </span>
            {wearable?.streaming && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border",
                  isEmergency
                    ? "border-white/10 bg-white/5 text-slate-200"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                )}
              >
                <Watch className="w-3 h-3" />
                Wearable live
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono border",
                isEmergency
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                  : "border-cyan-500/20 bg-cyan-500/5 text-cyan-700"
              )}
            >
              {patient.patientCode}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={cn(
              "flex items-center gap-2 text-xs font-medium",
              streamConnected ? "text-emerald-500" : "text-slate-400"
            )}
          >
            <Radio
              className={cn(
                "w-3.5 h-3.5",
                streamConnected && "animate-pulse-live"
              )}
            />
            {streamConnected ? "Streaming" : "Reconnecting"}
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <VitalPill
              label="HR"
              value={`${patient.vitals.heartRate}`}
              alert={patient.vitals.heartRate > 110}
              dark={isEmergency}
            />
            <VitalPill
              label="SpO₂"
              value={`${patient.vitals.oxygen}%`}
              alert={patient.vitals.oxygen < 92}
              dark={isEmergency}
            />
            <VitalPill
              label="BP"
              value={patient.vitals.bp}
              dark={isEmergency}
            />
          </div>
          {isEmergency ? (
            <Link
              href="/dashboard/emergency"
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
            >
              <Siren className="w-3.5 h-3.5" />
              Open emergency
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => manualSOS()}
              className="mt-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
            >
              Manual SOS
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function VitalPill({
  label,
  value,
  alert,
  dark,
}: {
  label: string;
  value: string;
  alert?: boolean;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2 min-w-[4.5rem] border",
        dark
          ? alert
            ? "bg-red-500/20 border-red-500/30"
            : "bg-white/5 border-white/10"
          : alert
            ? "bg-red-50 border-red-100"
            : "bg-slate-50 border-slate-100"
      )}
    >
      <p
        className={cn(
          "text-[9px] uppercase font-bold tracking-wider",
          dark ? "text-slate-400" : "text-slate-400"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-bold tabular-nums",
          alert && (dark ? "text-red-200" : "text-red-600"),
          !alert && (dark ? "text-white" : "text-slate-900")
        )}
      >
        {value}
      </p>
    </div>
  );
}
