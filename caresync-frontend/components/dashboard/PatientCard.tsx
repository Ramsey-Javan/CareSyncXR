"use client";

import { Activity, MapPin, Radio } from "lucide-react";
import type { Patient } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { VitalsChart } from "./VitalsChart";
import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

export function PatientCard({
  patient,
  selected,
  onSelect,
  onSOS,
}: {
  patient: Patient;
  selected?: boolean;
  onSelect?: () => void;
  onSOS?: () => void;
}) {
  const isCritical = patient.status === "critical";
  const isWarning = patient.status === "warning";

  return (
    <DashboardCard
      padding="md"
      variant={isCritical ? "critical" : isWarning ? "warning" : "glass"}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-medical-lg group",
        selected && "ring-2 ring-cyan-500/50 shadow-medical-lg",
        isCritical && "animate-pulse-emergency"
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">
              {patient.name}
            </h3>
            {isCritical && (
              <Activity className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{patient.room}</p>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      <p className="font-mono text-[11px] text-cyan-600 bg-cyan-500/5 inline-block px-2 py-1 rounded-lg mb-4">
        {patient.patientCode}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <VitalTile
          label="HR"
          value={patient.vitals.heartRate}
          unit="bpm"
          alert={patient.vitals.heartRate > 110}
        />
        <VitalTile
          label="SpO₂"
          value={patient.vitals.oxygen}
          unit="%"
          alert={patient.vitals.oxygen < 92}
        />
        <VitalTile label="BP" value={patient.vitals.bp} unit="" text />
      </div>

      <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-2 mb-4">
        <VitalsChart history={patient.history} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
        <span>Temp {patient.vitals.temperature}°C</span>
        <span>RR {patient.vitals.respiratoryRate}/min</span>
      </div>

      {patient.assignedHospital && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 mb-3 font-medium">
          <MapPin className="w-3.5 h-3.5" />
          {patient.assignedHospital}
        </p>
      )}

      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSOS?.();
          }}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm"
        >
          SOS
        </button>
        <span className="flex items-center justify-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
          <Radio className="w-3 h-3 animate-pulse-live" />
          Live
        </span>
      </div>
    </DashboardCard>
  );
}

function VitalTile({
  label,
  value,
  unit,
  alert,
  text,
}: {
  label: string;
  value: string | number;
  unit: string;
  alert?: boolean;
  text?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-2.5 border text-center",
        alert
          ? "bg-red-50/80 border-red-100"
          : "bg-white border-slate-100"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-bold tabular-nums mt-0.5",
          alert ? "text-red-600" : "text-slate-900",
          text && "text-sm"
        )}
      >
        {value}
        {unit && (
          <span className="text-[10px] font-normal text-slate-400 ml-0.5">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
