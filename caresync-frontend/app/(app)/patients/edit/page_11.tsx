"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patientsService } from "@/lib/services/patients";
import { PatientFormData } from "@/lib/types/patients";
import PatientForm from "@/components/patients/PatientForm";

export default function NewPatientPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleCreate(data: PatientFormData) {
    setSubmitting(true);
    setError(null);
    try {
      const { data: patient } = await patientsService.create(data);
      router.push(`/patients/${patient.id}`);
    } catch {
      setError("Could not create patient. Please check the form and try again.");
      setSubmitting(false);
    }
  }

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
        <h1 className="text-lg font-medium text-gray-900">Add new patient</h1>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <PatientForm onSubmit={handleCreate} submitLabel="Add patient" submitting={submitting} />
    </div>
  );
}
