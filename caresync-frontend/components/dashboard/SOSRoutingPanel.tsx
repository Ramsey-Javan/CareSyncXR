"use client";

import { Ambulance, Bell, Hospital, MapPin, Siren } from "lucide-react";
import type { SOSEvent } from "@/lib/types";
import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

export function SOSRoutingPanel({ event }: { event: SOSEvent }) {
  const r = event.routing;
  const progress =
    r?.status === "arrived" ? 100 : r?.status === "en_route" ? 65 : 35;

  return (
    <DashboardCard variant="critical" padding="md" className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-transparent" />
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Siren className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div>
            <p className="font-mono font-bold text-red-700 text-sm">
              {event.patientCode}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-red-500/80 font-semibold">
              {event.routingStatus}
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 space-y-1 mb-3">
        <p className="tabular-nums">
          HR {event.vitals.heartRate} · SpO₂ {event.vitals.oxygen}% · BP{" "}
          {event.vitals.bp}
        </p>
        <p className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-cyan-500" />
          {event.location.label}
        </p>
      </div>

      {r ? (
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
          <p className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
            <Hospital className="w-4 h-4 text-emerald-500" />
            {r.hospitalName}
          </p>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{r.distanceKm.toFixed(1)} km</span>
            <span>ETA {r.etaMinutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-700">
            <Ambulance className="w-4 h-4" />
            <span className="capitalize">{r.status.replace("_", " ")}</span>
          </div>
          {r.nextOfKinNotified && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Bell className="w-3.5 h-3.5" />
              Next of kin notified
            </p>
          )}
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-red-600 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live" />
          Computing hospital routing…
        </p>
      )}
    </DashboardCard>
  );
}
