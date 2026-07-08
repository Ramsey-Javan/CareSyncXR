"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientsService } from "@/lib/services/patients";
import { healthService } from "@/lib/services/health_4";
import { Patient } from "@/lib/types/patients";
import { LogReadingPayload, GlucoseMode, SYMPTOM_OPTIONS } from "@/lib/types/health";

export default function LogHealthReadingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [mode, setMode] = useState<"quick" | "detailed">("quick");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<LogReadingPayload>({
    patient_id: id as string,
    bp_systolic: undefined,
    bp_diastolic: undefined,
    glucose: undefined,
    glucose_mode: "fasting",
    weight: undefined,
    temperature: undefined,
    o2_saturation: undefined,
    heart_rate: undefined,
    symptoms: [],
    notes: "",
    photo_url: undefined,
  });

  useEffect(() => {
    patientsService.get(id).then(({ data }) => setPatient(data)).finally(() => setLoading(false));
  }, [id]);

  const handleChange = <K extends keyof LogReadingPayload>(key: K, value: LogReadingPayload[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleSymptom = (symptom: string) => {
    setForm((f) => {
      const symptoms = f.symptoms || [];
      return {
        ...f,
        symptoms: symptoms.includes(symptom)
          ? symptoms.filter((item) => item !== symptom)
          : [...symptoms, symptom],
      };
    });
  };

  const handleUploadPhoto = async (file: File) => {
    setUploadingPhoto(true);
    setError(null);
    try {
      const photoUrl = await healthService.uploadPhoto(file);
      setForm((f) => ({ ...f, photo_url: photoUrl }));
      setPhotoName(file.name);
    } catch (err) {
      console.error("❌ Error uploading photo:", err);
      setError("Could not upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await healthService.log(form);
      router.push(`/health-logs/${id}`);
    } catch (err) {
      console.error("❌ Error logging reading:", err);
      setError("Could not save reading. Please try again.");
      setSubmitting(false);
    }
  };

  const inputClass = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500";

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50">
          ←
        </button>
        <h1 className="text-lg font-medium text-gray-900">Log health reading</h1>
      </div>

      {patient && <p className="text-xs text-gray-500 mb-6">{patient.first_name} {patient.last_name}</p>}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Blood Pressure */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Blood Pressure (mmHg)</label>
          <div className="flex gap-2">
            <input
              type="number" placeholder="Systolic" value={form.bp_systolic || ""} onChange={(e) => handleChange("bp_systolic", e.target.value ? Number(e.target.value) : undefined)}
              className={inputClass}
            />
            <input
              type="number" placeholder="Diastolic" value={form.bp_diastolic || ""} onChange={(e) => handleChange("bp_diastolic", e.target.value ? Number(e.target.value) : undefined)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Glucose */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Glucose (mg/dL)</label>
          <div className="flex gap-2">
            <input
              type="number" placeholder="Value" value={form.glucose || ""} onChange={(e) => handleChange("glucose", e.target.value ? Number(e.target.value) : undefined)}
              className={inputClass}
            />
            <select value={form.glucose_mode} onChange={(e) => handleChange("glucose_mode", e.target.value as GlucoseMode)} className={inputClass}>
              <option value="fasting">Fasting</option>
              <option value="post_meal">Post-meal</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${mode === "quick" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            Quick entry
          </button>
          <button
            type="button"
            onClick={() => setMode("detailed")}
            className={`flex-1 text-sm px-3 py-2 rounded-lg border transition-colors ${mode === "detailed" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            Detailed entry
          </button>
        </div>

        {/* Weight */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block font-medium">Weight (kg)</label>
          <input
            type="number" step="0.1" placeholder="e.g. 75.5" value={form.weight || ""} onChange={(e) => handleChange("weight", e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass}
          />
        </div>

        {mode === "detailed" && (
          <>
            {/* Temperature */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">Temperature (°C)</label>
              <input
                type="number" step="0.1" placeholder="e.g. 36.8" value={form.temperature || ""} onChange={(e) => handleChange("temperature", e.target.value ? Number(e.target.value) : undefined)}
                className={inputClass}
              />
            </div>

            {/* O2 Saturation */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">O2 Saturation (%)</label>
              <input
                type="number" placeholder="e.g. 98" value={form.o2_saturation || ""} onChange={(e) => handleChange("o2_saturation", e.target.value ? Number(e.target.value) : undefined)}
                className={inputClass}
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">Heart Rate (bpm)</label>
              <input
                type="number" placeholder="e.g. 72" value={form.heart_rate || ""} onChange={(e) => handleChange("heart_rate", e.target.value ? Number(e.target.value) : undefined)}
                className={inputClass}
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">Symptoms</label>
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOM_OPTIONS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`text-xs text-left px-3 py-2 rounded-lg border transition-colors ${form.symptoms?.includes(symptom) ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">Additional notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Add any extra details"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium">Photo upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadPhoto(file);
                }}
                className="w-full text-sm text-gray-600"
              />
              {photoName && (
                <p className="text-xs text-gray-500 mt-2">Uploaded: {photoName}</p>
              )}
              {uploadingPhoto && (
                <p className="text-xs text-gray-500 mt-2">Uploading photo...</p>
              )}
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button" onClick={() => router.back()}
            className="flex-1 text-sm px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={submitting}
            className="flex-1 text-sm px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {submitting ? "Saving..." : "Save reading"}
          </button>
        </div>
      </form>
    </div>
  );
}
