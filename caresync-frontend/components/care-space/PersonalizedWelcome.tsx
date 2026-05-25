"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { UserRole } from "@/lib/auth.schemas";
import { getUser } from "@/lib/auth.utils";
import {
  getAiSupportLine,
  getPatientStatusLine,
  getRoleContextSubtitle,
  getRoleWelcome,
} from "@/lib/personalization";
import { useHospitalStore } from "@/stores/hospitalStore";
import { cn } from "@/lib/utils";

export function PersonalizedWelcome() {
  const [user, setUser] = useState<{
    fullName: string;
    role: UserRole;
  } | null>(null);
  const patient = useHospitalStore((s) => s.activePatient);
  const emergency = useHospitalStore((s) => s.emergency);
  const medications = useHospitalStore((s) => s.medications);
  const insights = useHospitalStore((s) => s.insights);

  useEffect(() => {
    const u = getUser();
    if (u) setUser({ fullName: u.fullName, role: u.role });
  }, []);

  if (!user) return null;

  const avgAdherence =
    medications.length > 0
      ? Math.round(
          medications.reduce((a, m) => a + m.adherencePercent, 0) /
            medications.length
        )
      : undefined;

  const status = emergency.active
    ? "critical"
    : (patient?.status ?? "stable");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        emergency.active
          ? "border-red-500/30 bg-red-950/20"
          : "border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            emergency.active
              ? "bg-red-500/20 text-red-400"
              : "bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 text-emerald-600"
          )}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {getRoleWelcome(user.role, user.fullName)}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {getRoleContextSubtitle(user.role)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {getPatientStatusLine(patient, status)}
          </p>
          <p className="mt-2 text-xs text-cyan-700/90 font-medium">
            {insights[0]?.summary?.slice(0, 100) ??
              getAiSupportLine(user.role, avgAdherence)}
            {(insights[0]?.summary?.length ?? 0) > 100 ? "…" : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
