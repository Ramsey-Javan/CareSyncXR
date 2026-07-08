"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientsService } from "@/lib/services/patients";
import { Patient, PatientFormData } from "@/lib/types/patients";
import PatientForm from "@/components/patients/PatientForm";

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    patientsService.get(id)
      .then(({ data }) => setPatient(data))
      .catch(() => setError("Could not load patient."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(data: PatientFormData) {
    setSubmitting(true);
    setError(null);
    try {
      await patientsService.update(id, data);
      router.push(`/patients/${id}`);
    } catch {
      setError("Could not save changes. Please try again.");
      setSubmitting(false);
    }
  }

  const initialData: Partial<PatientFormData> | undefined = patient
    ? {
        first_name: patient.first_name,
        last_name:  patient.last_name,
        date_of_birth: patient.date_of_birth ?? "",
        gender:     patient.gender ?? "female",
        phone:      patient.phone ?? "",
        address:    patient.address ?? "",
        condition:  patient.condition,
        primary_doctor_id: patient.primary_doctor_id ?? "",
        caregiver_ids:     patient.caregiver_ids ?? [],
        emergency_contact_name:  patient.emergency_contact_name ?? "",
        emergency_contact_phone: patient.emergency_contact_phone ?? "",
        notes: patient.notes ?? "",
      }
    : undefined;

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-lg font-medium text-gray-900">
          Edit {patient ? `${patient.first_name} ${patient.last_name}` : "patient"}
        </h1>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : patient ? (
        <PatientForm
          initialData={initialData}
          onSubmit={handleUpdate}
          submitLabel="Save changes"
          submitting={submitting}
        />
      ) : (
        <p className="text-sm text-gray-400">Patient not found.</p>
      )}
    </div>
  );
}
