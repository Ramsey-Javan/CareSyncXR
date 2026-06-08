"use client";

import { useEffect, useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getUser } from "@/lib/auth.utils";
import {
  buildCareProfileFromForm,
  getCareProfile,
  saveCareProfile,
} from "@/lib/careProfile";
import {
  CareSetupForm,
  type CareSetupFormValues,
} from "@/components/care-space/CareSetupForm";

export default function CareCirclePage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const participants = useHospitalStore((s) => s.careParticipants);
  const applyCareProfile = useHospitalStore((s) => s.applyCareProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) return;
    if (!getCareProfile(user.email)) setEditing(true);
  }, []);

  function invite() {
    toast.info(
      "Share your patient code from the dashboard header so your doctor, caregiver, or family can link their account.",
      { duration: 5000 }
    );
  }

  function handleSave(form: CareSetupFormValues) {
    const user = getUser();
    if (!user) {
      toast.error("Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      const profile = buildCareProfileFromForm(user, {
        careUnitName: form.careUnitName,
        setupBy: form.setupBy,
        patientName: form.patientName,
        patientLocation: form.patientLocation,
        caregiverName: form.caregiverName,
        caregiverEmail: form.caregiverEmail || undefined,
        doctorName: form.doctorName,
        doctorEmail: form.doctorEmail || undefined,
        nextOfKinName: form.nextOfKinName,
        nextOfKinRelationship: form.nextOfKinRelationship,
        nextOfKinPhone: form.nextOfKinPhone || undefined,
        nextOfKinEmail: form.nextOfKinEmail || undefined,
      });

      saveCareProfile(profile);
      applyCareProfile(profile);
      setEditing(false);
      toast.success("Care circle updated");
    } catch {
      toast.error("Could not save care details");
    } finally {
      setLoading(false);
    }
  }

  if (!patient) return null;

  const user = getUser();
  const saved = user ? getCareProfile(user.email) : null;

  const initial: Partial<CareSetupFormValues> | undefined = saved
    ? {
        careUnitName: saved.careUnitName,
        setupBy: saved.setupBy,
        patientName: saved.patientName,
        patientLocation: saved.patientLocation,
        caregiverName: saved.caregiverName,
        caregiverEmail: saved.caregiverEmail ?? "",
        doctorName: saved.doctorName,
        doctorEmail: saved.doctorEmail ?? "",
        nextOfKinName: saved.nextOfKinName,
        nextOfKinRelationship: saved.nextOfKinRelationship,
        nextOfKinPhone: saved.nextOfKinPhone ?? "",
        nextOfKinEmail: saved.nextOfKinEmail ?? "",
      }
    : {
        patientName: patient.name,
        patientLocation: patient.room,
        caregiverName: patient.caregiverName ?? "",
        doctorName: patient.doctorName ?? "",
        nextOfKinName: patient.nextOfKin?.split("(")[0]?.trim() ?? "",
        nextOfKinRelationship:
          patient.nextOfKin?.match(/\(([^)]+)\)/)?.[1] ?? "",
        nextOfKinPhone: patient.nextOfKinPhone ?? "",
        nextOfKinEmail: patient.nextOfKinEmail ?? "",
        careUnitName: patient.careUnitName ?? "",
      };

  return (
    <PageShell>
      <PageSection
        title="Care circle"
        description="Link your personal doctor, caregiver, and family — everyone collaborates around one patient."
      >
        <DashboardCard padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-semibold text-lg text-slate-900">
                {patient.name}
              </p>
              <p className="text-sm text-slate-600">{patient.room}</p>
              {patient.nextOfKinPhone && (
                <p className="text-xs text-slate-500 mt-1">
                  Next of kin: {patient.nextOfKin} · {patient.nextOfKinPhone}
                </p>
              )}
            </div>
            <StatusBadge status={patient.status} />
          </div>

          {!editing && (
            <>
              <ul className="space-y-3 mb-6">
                {participants.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-600 capitalize">
                        {p.title ?? p.role}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                        p.online
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.online ? "Active" : "Away"}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Edit care details
                </button>
                <button
                  type="button"
                  onClick={invite}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite by code
                </button>
              </div>
            </>
          )}

          {editing && (
            <div className="border-t border-slate-100 pt-6">
              <DashboardCardHeader
                title="Care circle details"
                description="Patient or caregiver can update names and contacts here."
              />
              <CareSetupForm
                initial={initial}
                onSubmit={handleSave}
                submitLabel="Save care circle"
                loading={loading}
              />
              {saved && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="w-full mt-3 text-sm text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-600 flex items-center gap-2 justify-center">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            Relationships are personal — not a hospital patient database
          </p>
        </DashboardCard>
      </PageSection>
    </PageShell>
  );
}
