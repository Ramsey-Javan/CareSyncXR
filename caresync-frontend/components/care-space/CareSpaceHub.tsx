"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  MessageSquare,
  Pill,
  Stethoscope,
  Users,
  Video,
} from "lucide-react";
import { useHospitalStore } from "@/stores/hospitalStore";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";
import { CareTimeline } from "@/components/dashboard/CareTimeline";
import { MedicationSchedule } from "@/components/dashboard/MedicationSchedule";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { getUser } from "@/lib/auth.utils";
import type { UserRole } from "@/lib/auth.schemas";
import { canAccess } from "@/lib/roles";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

export function CareSpaceHub() {
  const patient = useHospitalStore((s) => s.activePatient);
  const timeline = useHospitalStore((s) => s.timeline);
  const medications = useHospitalStore((s) => s.medications);
  const caregiverLogs = useHospitalStore((s) => s.caregiverLogs);
  const doctorNotes = useHospitalStore((s) => s.doctorNotes);
  const insights = useHospitalStore((s) => s.insights);
  const alerts = useHospitalStore((s) => s.alerts).slice(0, 3);
  const participants = useHospitalStore((s) => s.careParticipants);
  const markMedicationAdministered = useHospitalStore(
    (s) => s.markMedicationAdministered
  );

  const role = (getUser()?.role ?? "caregiver") as UserRole;
  const showMeds = canAccess(role, "medications");
  const showDoctorNotes = role === "doctor";
  const showCareLog = canAccess(role, "caregiver-tools");

  if (!patient) {
    return (
      <DashboardCard padding="lg">
        <p className="text-sm text-slate-500">Loading care space…</p>
      </DashboardCard>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <motion.div
        custom={0}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="xl:col-span-8 space-y-6"
      >
        <DashboardCard padding="md" variant="glass">
          <DashboardCardHeader title="Vitals trend" description="Last 24 readings" />
          <VitalsChart history={patient.history} />
        </DashboardCard>

        {showMeds && (
          <DashboardCard padding="md">
            <DashboardCardHeader
              title="Medication timeline"
              description="Today's schedule"
            />
            <MedicationSchedule
              medications={medications}
              onAdminister={(id) => markMedicationAdministered(id)}
            />
          </DashboardCard>
        )}

        <DashboardCard padding="md">
          <DashboardCardHeader title="Activity stream" />
          <CareTimeline entries={timeline} limit={8} />
        </DashboardCard>
      </motion.div>

      <motion.div
        custom={1}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="xl:col-span-4 space-y-6"
      >
        <DashboardCard padding="md">
          <DashboardCardHeader
            title="AI insight"
            description="Supportive summary"
          />
          {insights[0] ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              {insights[0].summary}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Everything looks steady. AI will surface gentle warnings if vitals
              drift.
            </p>
          )}
          {canAccess(role, "insights") && (
            <Link
              href="/dashboard/ai-insights"
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 hover:underline"
            >
              <Brain className="w-3.5 h-3.5" />
              Open insights
            </Link>
          )}
        </DashboardCard>

        <DashboardCard padding="md">
          <DashboardCardHeader title="Care circle" />
          <ul className="space-y-3">
            {participants.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold",
                    p.role === "doctor" && "bg-cyan-500/15 text-cyan-700",
                    p.role === "caregiver" && "bg-emerald-500/15 text-emerald-700",
                    p.role === "family" && "bg-violet-500/15 text-violet-700",
                    p.role === "patient" && "bg-slate-200 text-slate-700"
                  )}
                >
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{p.title}</p>
                </div>
                {p.online && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-live" />
                )}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/care-profile"
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-cyan-700"
          >
            <Users className="w-3.5 h-3.5" />
            Manage invitations
          </Link>
        </DashboardCard>

        {(showDoctorNotes || doctorNotes.length > 0) && (
          <DashboardCard padding="md">
            <DashboardCardHeader title="Doctor notes" />
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {doctorNotes.slice(0, 3).map((n) => (
                <li key={n.id} className="text-sm">
                  <p className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                    {n.authorName}
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed">{n.body}</p>
                </li>
              ))}
            </ul>
          </DashboardCard>
        )}

        {showCareLog && caregiverLogs[0] && (
          <DashboardCard padding="md">
            <DashboardCardHeader title="Latest caregiver log" />
            <p className="text-sm font-medium text-slate-800">
              {caregiverLogs[0].summary}
            </p>
            {caregiverLogs[0].detail && (
              <p className="text-xs text-slate-500 mt-1">{caregiverLogs[0].detail}</p>
            )}
            <Link
              href="/dashboard/caregiver"
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Open care log
            </Link>
          </DashboardCard>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Needs attention
            </p>
            {alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        )}

        <Link
          href="/dashboard/consultations"
          className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 py-3.5 text-sm font-semibold text-cyan-800 hover:bg-cyan-500/10 transition-colors"
        >
          <Video className="w-4 h-4" />
          Schedule video visit
        </Link>

        {role === "doctor" && (
          <Link
            href="/dashboard/medication"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pill className="w-4 h-4" />
            Manage prescriptions
          </Link>
        )}
      </motion.div>
    </div>
  );
}
