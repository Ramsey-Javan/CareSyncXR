"use client";

import Link from "next/link";
import { Bell, Pill, Siren, Video } from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PersonalizedWelcome } from "@/components/care-space/PersonalizedWelcome";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { manualSOS } from "@/lib/stream/hospitalStream";

export default function PatientPortalPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const medications = useHospitalStore((s) => s.medications);
  const nextMed = medications.find((m) => !m.missed);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PersonalizedWelcome />

      {patient && (
        <>
          <DashboardCard padding="lg" className="text-center">
            <StatusBadge status={patient.status} className="mx-auto mb-4" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Your wearable is helping keep you safe. Everything is being watched
              with care.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-slate-500 text-xs">Heart rate</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {patient.vitals.heartRate}
                </p>
              </div>
              <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-4">
                <p className="text-slate-500 text-xs">Oxygen</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {patient.vitals.oxygen}%
                </p>
              </div>
            </div>
          </DashboardCard>

          <div className="grid gap-3">
            {nextMed && (
              <Link
                href="/dashboard/medication"
                className="flex items-center gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/80 p-4 hover:shadow-md transition-shadow"
              >
                <Pill className="w-8 h-8 text-yellow-600" />
                <div className="text-left">
                  <p className="font-semibold text-slate-900">Medication reminder</p>
                  <p className="text-sm text-slate-600">
                    {nextMed.name} · {nextMed.dosage}
                  </p>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard/consultations"
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-cyan-300 transition-colors"
            >
              <Video className="w-8 h-8 text-cyan-600" />
              <div className="text-left">
                <p className="font-semibold text-slate-900">Video visit</p>
                <p className="text-sm text-slate-500">Join your doctor online</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => manualSOS()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 p-4 text-white font-bold hover:bg-red-600 transition-colors w-full"
            >
              <Siren className="w-5 h-5" />
              I need help — SOS
            </button>

            <Link
              href="/dashboard/alerts"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              <Bell className="w-4 h-4" />
              View my alerts
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
