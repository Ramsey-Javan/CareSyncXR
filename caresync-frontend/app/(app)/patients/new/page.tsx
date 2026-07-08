"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patientsService } from "@/lib/services/patients";
import { PatientFormData } from "@/lib/types/patients";
import PatientForm from "@/components/patients/PatientForm";

export default function NewPatientPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(data: PatientFormData) {
    setSubmitting(true);
    setError(null);
    
    // Map form data to backend schema
    const payload: any = {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      phone: data.phone.trim() || undefined,
      address: data.address.trim() || undefined,
      condition: data.condition.trim(),
      primary_doctor_id: data.primary_doctor_id || undefined,
      caregiver_ids: data.caregiver_ids.length ? data.caregiver_ids : undefined,
      emergency_contact_name: data.emergency_contact_name || undefined,
      emergency_contact_phone: data.emergency_contact_phone || undefined,
      notes: data.notes.trim() || undefined,
      chronic_conditions: data.condition.trim(),
      blood_type: "O+",
      allergies: "",
    };

    try {
      console.log("📤 Request URL:", patientsService.list.toString());
      console.log("📤 Sending patient data:", JSON.stringify(payload, null, 2));
      
      const response = await patientsService.create(payload);
      console.log("✅ Response:", response);
      console.log("✅ Patient created:", response.data);
      router.push(`/patients/${response.data.id}`);
    } catch (err: any) {
      console.error("❌ Caught error type:", err?.constructor?.name);
      console.error("❌ Error toString:", err?.toString());
      console.error("❌ Error keys:", Object.keys(err || {}));
      console.error("❌ Response exists?", !!err?.response);
      console.error("❌ Request exists?", !!err?.request);
      console.error("❌ Message:", err?.message);
      
      if (err?.response) {
        console.error("❌ Response status:", err.response.status);
        console.error("❌ Response data:", err.response.data);
      } else if (err?.request) {
        console.error("❌ Request made but no response - Network error");
        console.error("❌ Request:", err.request);
      } else {
        console.error("❌ No request/response - Config error:", err?.config);
      }
      
      let errorMsg = "Could not create patient. Please try again.";
      if (err?.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(String(errorMsg));
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

      <PatientForm
        onSubmit={handleCreate}
        submitLabel="Create patient"
        submitting={submitting}
      />
    </div>
  );
}
