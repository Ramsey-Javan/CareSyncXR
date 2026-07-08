"use client";

import { useEffect, useState } from "react";
import { PatientFormData, DoctorOption, CaregiverOption } from "@/lib/types/patients";
import { patientsService } from "@/lib/services/patients";

interface Props {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
}

const EMPTY: PatientFormData = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "female",
  phone: "",
  address: "",
  condition: "",
  primary_doctor_id: "",
  caregiver_ids: [],
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

export default function PatientForm({ initialData, onSubmit, submitLabel, submitting }: Props) {
  const [form, setForm] = useState<PatientFormData>({ ...EMPTY, ...initialData });
  const [doctors, setDoctors]       = useState<DoctorOption[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverOption[]>([]);
  const [errors, setErrors]         = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      patientsService.availableDoctors()
        .then(({ data }) => {
          console.log("✅ Doctors loaded:", data);
          setDoctors(data || []);
        })
        .catch((err) => {
          console.warn("⚠️ Could not load doctors:", err);
          setDoctors([]);
        }),
      patientsService.availableCaregivers()
        .then(({ data }) => {
          console.log("✅ Caregivers loaded:", data);
          setCaregivers(data || []);
        })
        .catch((err) => {
          console.warn("⚠️ Could not load caregivers:", err);
          setCaregivers([]);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  function update<K extends keyof PatientFormData>(key: K, value: PatientFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleCaregiver(id: string) {
    setForm((f) => ({
      ...f,
      caregiver_ids: f.caregiver_ids.includes(id)
        ? f.caregiver_ids.filter((c) => c !== id)
        : [...f.caregiver_ids, id],
    }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof PatientFormData, string>> = {};
    if (!form.first_name.trim())     e.first_name = "Required";
    if (!form.last_name.trim())      e.last_name = "Required";
    if (!form.date_of_birth)         e.date_of_birth = "Required";
    if (!form.condition.trim())      e.condition = "Required";
    // Doctor is optional if none are available
    if (doctors.length > 0 && !form.primary_doctor_id) {
      e.primary_doctor_id = "Select a primary doctor";
    }
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) e.phone = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  const inputClass = (key: keyof PatientFormData) =>
    `w-full text-sm border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
      errors[key] ? "border-red-300" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Basic info */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Basic information</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">First name</label>
            <input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} className={inputClass("first_name")} />
            {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Last name</label>
            <input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} className={inputClass("last_name")} />
            {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date of birth</label>
            <input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} className={inputClass("date_of_birth")} />
            {errors.date_of_birth && <p className="text-xs text-red-600 mt-1">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Gender</label>
            <select value={form.gender} onChange={(e) => update("gender", e.target.value as PatientFormData["gender"])} className={inputClass("gender")}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Phone</label>
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+254 7XX XXX XXX" className={inputClass("phone")} />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Address</label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass("address")} />
          </div>
        </div>
      </div>

      {/* Medical */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Medical</p>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Primary condition(s)</label>
          <input
            value={form.condition} onChange={(e) => update("condition", e.target.value)}
            placeholder="e.g. Hypertension, Diabetes Type 2" className={inputClass("condition")}
          />
          {errors.condition && <p className="text-xs text-red-600 mt-1">{errors.condition}</p>}
        </div>
      </div>

      {/* Care team */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Care team</p>
        
        {/* Doctor selection */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">
            Primary doctor {doctors.length === 0 ? "(optional)" : ""}
          </label>
          {doctors.length === 0 ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                No doctors available yet. You can create a patient without assigning a doctor.
              </p>
            </div>
          ) : (
            <>
              <select value={form.primary_doctor_id} onChange={(e) => update("primary_doctor_id", e.target.value)} className={inputClass("primary_doctor_id")}>
                <option value="">Select a doctor...</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.primary_doctor_id && <p className="text-xs text-red-600 mt-1">{errors.primary_doctor_id}</p>}
            </>
          )}
        </div>

        {/* Caregiver selection */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Caregivers (optional)</label>
          {caregivers.length === 0 ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                No caregivers available yet in this hospital.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {caregivers.map((c) => (
                <button
                  type="button" key={c.id} onClick={() => toggleCaregiver(c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.caregiver_ids.includes(c.id)
                      ? "bg-teal-50 border-teal-300 text-teal-800"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency contact */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Emergency contact</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name</label>
            <input value={form.emergency_contact_name} onChange={(e) => update("emergency_contact_name", e.target.value)} className={inputClass("emergency_contact_name")} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Phone</label>
            <input value={form.emergency_contact_phone} onChange={(e) => update("emergency_contact_phone", e.target.value)} className={inputClass("emergency_contact_phone")} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Notes</p>
        <textarea
          value={form.notes} onChange={(e) => update("notes", e.target.value)}
          rows={3} placeholder="Anything else worth noting..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        type="submit" disabled={submitting}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-200 text-white font-medium py-3 rounded-lg transition-colors text-sm"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
