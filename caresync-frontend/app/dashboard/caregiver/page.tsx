"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  apiAddCaregiverNote,
  apiLogCaregiverVitals,
} from "@/lib/api";

export default function CaregiverToolsPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const logCaregiverVitals = useHospitalStore((s) => s.logCaregiverVitals);
  const addCaregiverNote = useHospitalStore((s) => s.addCaregiverNote);

  const [glucose, setGlucose] = useState("");
  const [bp, setBp] = useState("");
  const [temp, setTemp] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [note, setNote] = useState("");

  async function submitVitals(e: React.FormEvent) {
    e.preventDefault();
    if (!patient) return;
    const manual = {
      glucose: glucose ? Number(glucose) : undefined,
      bp: bp || undefined,
      temperature: temp ? Number(temp) : undefined,
      symptoms: symptoms || undefined,
    };
    await apiLogCaregiverVitals({
      patientId: patient.id,
      ...manual,
      note: note || undefined,
    });
    logCaregiverVitals(manual, note || undefined);
    setGlucose("");
    setBp("");
    setTemp("");
    setSymptoms("");
    toast.success("Vitals logged to care timeline");
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!patient || !note.trim()) return;
    await apiAddCaregiverNote({ patientId: patient.id, note: note.trim() });
    addCaregiverNote(note.trim());
    setNote("");
    toast.success("Observation saved");
  }

  if (!patient) {
    return (
      <PageShell>
        <DashboardCard padding="lg">
          <p className="text-sm text-slate-500">Loading care profile…</p>
        </DashboardCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <p className="text-sm text-slate-500 mb-4">
        Logging for <strong className="text-slate-800">{patient.name}</strong> — one care journey
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <PageSection title="Log vitals & symptoms">
          <DashboardCard padding="lg">
            <DashboardCardHeader
              title={patient.name}
              description="Merged with wearable stream on save"
            />
            <StatusBadge status={patient.status} className="mb-4" />
            <form onSubmit={submitVitals} className="space-y-4">
              <Field label="Blood pressure" value={bp} onChange={setBp} placeholder="120/80" />
              <Field label="Glucose (mg/dL)" value={glucose} onChange={setGlucose} placeholder="110" type="number" />
              <Field label="Temperature (°C)" value={temp} onChange={setTemp} placeholder="36.6" type="number" step="0.1" />
              <Field label="Symptoms" value={symptoms} onChange={setSymptoms} placeholder="Fatigue, dizziness…" />
              <Field label="Notes (optional)" value={note} onChange={setNote} placeholder="Visit context" />
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm"
              >
                Save to care timeline
              </button>
            </form>
          </DashboardCard>
        </PageSection>

        <PageSection title="Quick observation">
          <DashboardCard padding="lg">
            <form onSubmit={submitNote} className="space-y-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                placeholder="Patient condition, mobility, mood, appetite, hydration…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
              >
                Add observation
              </button>
            </form>
            {patient.nextOfKin && (
              <p className="mt-6 text-xs text-slate-600 border-t pt-4">
                Next of kin on file:{" "}
                <span className="font-medium text-slate-800">
                  {patient.nextOfKin}
                  {patient.nextOfKinPhone ? ` · ${patient.nextOfKinPhone}` : ""}
                  {patient.nextOfKinEmail ? ` · ${patient.nextOfKinEmail}` : ""}
                </span>
              </p>
            )}
          </DashboardCard>
        </PageSection>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
      />
    </label>
  );
}
