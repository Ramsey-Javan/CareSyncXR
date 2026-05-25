"use client";

import Link from "next/link";
import { Bell, Calendar, Heart, MapPin, Video } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PersonalizedWelcome } from "@/components/care-space/PersonalizedWelcome";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";

export default function FamilyWellnessPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const consultations = useHospitalStore((s) => s.consultations);
  const emergency = useHospitalStore((s) => s.emergency);
  const sosEvents = useHospitalStore((s) => s.sosEvents);

  return (
    <div className="space-y-6">
      <PersonalizedWelcome />

      {patient && (
        <DashboardCard padding="lg" variant="glass">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Your loved one
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{patient.name}</h2>
              <p className="text-sm text-slate-700 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {patient.location.label}
              </p>
            </div>
            <StatusBadge status={patient.status} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <WellnessStat label="Heart rate" value={`${patient.vitals.heartRate} bpm`} />
            <WellnessStat label="Oxygen" value={`${patient.vitals.oxygen}%`} />
            <WellnessStat label="Status" value={patient.status} />
          </div>
        </DashboardCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <DashboardCard padding="md">
          <DashboardCardHeader title="Emergency status" />
          {emergency.active || sosEvents.length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                An emergency protocol is active
              </p>
              <Link
                href="/dashboard/emergency"
                className="mt-3 inline-block text-xs font-bold text-red-700 hover:underline"
              >
                View emergency coordination →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              No emergency alerts detected
            </p>
          )}
        </DashboardCard>

        <DashboardCard padding="md">
          <DashboardCardHeader title="Upcoming visits" />
          {consultations.length === 0 ? (
            <p className="text-sm text-slate-500">No appointments scheduled</p>
          ) : (
            <ul className="space-y-2">
              {consultations.slice(0, 3).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 text-sm rounded-xl border border-slate-100 p-3"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    {new Date(c.scheduledAt).toLocaleString()}
                  </span>
                  <Link
                    href={`/dashboard/consultations/video?patientId=${c.patientId}`}
                    className="text-xs font-semibold text-cyan-700"
                  >
                    <Video className="w-4 h-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

function WellnessStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
      <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{value}</p>
    </div>
  );
}
