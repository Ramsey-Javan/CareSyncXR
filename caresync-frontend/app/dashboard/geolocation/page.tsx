"use client";

import { MapPin, Navigation } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function GeolocationPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const sosEvents = useHospitalStore((s) => s.sosEvents);

  return (
    <PageShell>
      <div className="grid lg:grid-cols-2 gap-6">
        <PageSection title="Home location">
          {patient ? (
            <DashboardCard padding="md">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {patient.location.label}
                  </p>
                  <p className="text-xs font-mono text-slate-400 mt-2">
                    {patient.location.lat.toFixed(4)}, {patient.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </DashboardCard>
          ) : (
            <DashboardCard padding="lg">
              <p className="text-sm text-slate-500">No care profile loaded</p>
            </DashboardCard>
          )}
        </PageSection>

        <PageSection title="SOS emergency tracks">
          {sosEvents.length === 0 ? (
            <DashboardCard padding="lg">
              <p className="text-sm text-slate-500 text-center py-4">
                No active emergency tracks
              </p>
            </DashboardCard>
          ) : (
            <div className="space-y-3">
              {sosEvents.map((e) => (
                <DashboardCard key={e.id} variant="critical" padding="md">
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-mono font-bold text-red-700">
                        {e.patientCode}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {e.location.label}
                      </p>
                      {e.routing && (
                        <p className="text-xs text-emerald-600 font-medium mt-2">
                          → {e.routing.hospitalName} ({e.routing.distanceKm} km)
                        </p>
                      )}
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </PageShell>
  );
}
