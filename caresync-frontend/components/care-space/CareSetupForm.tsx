"use client";

import { useState } from "react";
import { Heart, Stethoscope, User, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SetupBy } from "@/lib/careProfile";

export type CareSetupFormValues = {
  careUnitName: string;
  setupBy: SetupBy;
  patientName: string;
  patientLocation: string;
  caregiverName: string;
  caregiverEmail: string;
  doctorName: string;
  doctorEmail: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;
};

type CareSetupFormProps = {
  defaultPatientName?: string;
  defaultCaregiverName?: string;
  initial?: Partial<CareSetupFormValues>;
  onSubmit: (values: CareSetupFormValues) => void;
  submitLabel?: string;
  loading?: boolean;
};

const SETUP_OPTIONS: { value: SetupBy; label: string; hint: string }[] = [
  {
    value: "patient",
    label: "I am the patient",
    hint: "I will manage my own care details",
  },
  {
    value: "caregiver",
    label: "I am the caregiver",
    hint: "I am setting this up on behalf of someone else",
  },
];

export function CareSetupForm({
  defaultPatientName = "",
  defaultCaregiverName = "",
  initial,
  onSubmit,
  submitLabel = "Complete setup",
  loading = false,
}: CareSetupFormProps) {
  const [setupBy, setSetupBy] = useState<SetupBy>(initial?.setupBy ?? "patient");
  const [values, setValues] = useState<CareSetupFormValues>({
    careUnitName: initial?.careUnitName ?? "",
    setupBy: initial?.setupBy ?? "patient",
    patientName: initial?.patientName ?? defaultPatientName,
    patientLocation: initial?.patientLocation ?? "Home",
    caregiverName: initial?.caregiverName ?? defaultCaregiverName,
    caregiverEmail: initial?.caregiverEmail ?? "",
    doctorName: initial?.doctorName ?? "",
    doctorEmail: initial?.doctorEmail ?? "",
    nextOfKinName: initial?.nextOfKinName ?? "",
    nextOfKinRelationship: initial?.nextOfKinRelationship ?? "",
    nextOfKinPhone: initial?.nextOfKinPhone ?? "",
    nextOfKinEmail: initial?.nextOfKinEmail ?? "",
  });

  function update<K extends keyof CareSetupFormValues>(
    key: K,
    value: CareSetupFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...values, setupBy });
  }

  const patientRequired = setupBy === "caregiver";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-slate-800">Who is completing this setup?</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SETUP_OPTIONS.map((opt) => {
            const active = setupBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSetupBy(opt.value);
                  update("setupBy", opt.value);
                }}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-cyan-500 bg-cyan-50 ring-1 ring-cyan-500/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-slate-800">Care unit name</Label>
        <Input
          className="mt-1"
          placeholder="e.g. Maina Family Care"
          value={values.careUnitName}
          onChange={(e) => update("careUnitName", e.target.value)}
          required
        />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
          <User className="h-4 w-4 text-cyan-600" />
          Patient details
        </legend>
        <div>
          <Label className="text-slate-800">Patient full name</Label>
          <Input
            className="mt-1"
            value={values.patientName}
            onChange={(e) => update("patientName", e.target.value)}
            required={patientRequired || setupBy === "patient"}
            placeholder="Person receiving care"
          />
        </div>
        <div>
          <Label className="text-slate-800">Location / address label</Label>
          <Input
            className="mt-1"
            value={values.patientLocation}
            onChange={(e) => update("patientLocation", e.target.value)}
            placeholder="e.g. Home — Westlands"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
          <Heart className="h-4 w-4 text-emerald-600" />
          Primary caregiver
        </legend>
        <div>
          <Label className="text-slate-800">Caregiver name</Label>
          <Input
            className="mt-1"
            value={values.caregiverName}
            onChange={(e) => update("caregiverName", e.target.value)}
            required={setupBy === "caregiver"}
            placeholder="Daily care contact"
          />
        </div>
        <div>
          <Label className="text-slate-800">Caregiver email (optional)</Label>
          <Input
            type="email"
            className="mt-1"
            value={values.caregiverEmail}
            onChange={(e) => update("caregiverEmail", e.target.value)}
            placeholder="For invitation link"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
          <Stethoscope className="h-4 w-4 text-violet-600" />
          Personal doctor
        </legend>
        <div>
          <Label className="text-slate-800">Doctor name</Label>
          <Input
            className="mt-1"
            value={values.doctorName}
            onChange={(e) => update("doctorName", e.target.value)}
            placeholder="e.g. Dr. Amina Ochieng"
          />
        </div>
        <div>
          <Label className="text-slate-800">Doctor email (optional)</Label>
          <Input
            type="email"
            className="mt-1"
            value={values.doctorEmail}
            onChange={(e) => update("doctorEmail", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
          <Users className="h-4 w-4 text-amber-600" />
          Next of kin
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-slate-800">Full name</Label>
            <Input
              className="mt-1"
              value={values.nextOfKinName}
              onChange={(e) => update("nextOfKinName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="text-slate-800">Relationship</Label>
            <Input
              className="mt-1"
              value={values.nextOfKinRelationship}
              onChange={(e) => update("nextOfKinRelationship", e.target.value)}
              placeholder="e.g. son, daughter, spouse"
              required
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-slate-800">Phone</Label>
            <Input
              className="mt-1"
              value={values.nextOfKinPhone}
              onChange={(e) => update("nextOfKinPhone", e.target.value)}
              placeholder="+254 …"
            />
          </div>
          <div>
            <Label className="text-slate-800">Email</Label>
            <Input
              type="email"
              className="mt-1"
              value={values.nextOfKinEmail}
              onChange={(e) => update("nextOfKinEmail", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
