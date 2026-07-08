"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { healthService } from "@/lib/services/health";
import { LogReadingPayload, HealthReading, GlucoseMode, SYMPTOM_OPTIONS } from "@/lib/types/health";
import { patientsService } from "@/lib/services/patients";
import { Patient } from "@/lib/types/patients";
import VitalCard from "@/components/health/VitalCard";
import ReadingFeedback from "@/components/health/ReadingFeedback";

type Mode = "quick" | "detailed";

export default function LogHealthPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient]           = useState<Patient | null>(null);
  const [mode, setMode]                 = useState<Mode>("quick");
  const [saving, setSaving]             = useState(false);
  const [savedReading, setSavedReading] = useState<HealthReading | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Vitals
  const [bpSys, setBpSys]         = useState("");
  const [bpDia, setBpDia]         = useState("");
  const [glucose, setGlucose]     = useState("");
  const [glucoseMode, setGlucoseMode] = useState<GlucoseMode>("fasting");
  const [weight, setWeight]       = useState("");
  const [temp, setTemp]           = useState("");
  const [o2, setO2]               = useState("");
  const [heartRate, setHeartRate] = useState("");

  // Detailed extras
  const [symptoms, setSymptoms]   = useState<string[]>([]);
  const [notes, setNotes]         = useState("");
  const [photoUrl, setPhotoUrl]   = useState<string | null>(null);

  const feedbackRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    patientsService.get(patientId)
      .then(({ data }) => setPatient(data))
      .catch(() => {});
  }, [patientId]);

  function toggleSymptom(s: string) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await healthService.uploadPhoto(file);
      setPhotoUrl(url);
    } catch {
      setError("Photo upload failed. Try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    setError(null);
    setSaving(true);

    const payload: LogReadingPayload = {
      patient_id:    patientId,
      bp_systolic:   bpSys     ? Number(bpSys)     : undefined,
      bp_diastolic:  bpDia     ? Number(bpDia)     : undefined,
      glucose:       glucose   ? Number(glucose)   : undefined,
      glucose_mode:  glucose   ? glucoseMode       : undefined,
      weight:        weight    ? Number(weight)    : undefined,
      temperature:   temp      ? Number(temp)      : undefined,
      o2_saturation: o2        ? Number(o2)        : undefined,
      heart_rate:    heartRate ? Number(heartRate) : undefined,
      symptoms:      symptoms.length ? symptoms    : undefined,
      notes:         notes     || undefined,
      photo_url:     photoUrl  || undefined,
    };

    try {
      const { data } = await healthService.log(payload);
      setSavedReading(data);
      setTimeout(() =>
        feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100
      );
    } catch {
      setError("Failed to save reading. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const hasAnyVital = bpSys || glucose || weight || temp || o2 || heartRate;

  return (
    <div className="max-w-md mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-base font-medium text-gray-900">Log health data</h1>
      </div>

      {/* Patient chip */}
      {patient && (
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 mb-5">
          <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {patient.first_name[0]}{patient.last_name[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 leading-none">
              {patient.first_name} {patient.last_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {patient.age} yrs · {patient.condition}
            </p>
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
        {(["quick", "detailed"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-sm py-1.5 rounded-md transition-colors capitalize ${
              mode === m
                ? "bg-white text-teal-800 font-medium shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Feedback after save */}
      {savedReading && (
        <div ref={feedbackRef}>
          <ReadingFeedback reading={savedReading} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Vitals grid */}
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Vitals</p>
      <div className="grid grid-cols-2 gap-2.5 mb-5">

        {/* Blood pressure */}
        <VitalCard icon="♥" label="Blood pressure" filled={!!(bpSys && bpDia)} fullWidth>
          <div className="flex items-center gap-1.5">
            <input
              type="number" value={bpSys} onChange={(e) => setBpSys(e.target.value)}
              placeholder="120"
              className="w-12 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-gray-400 text-lg">/</span>
            <input
              type="number" value={bpDia} onChange={(e) => setBpDia(e.target.value)}
              placeholder="80"
              className="w-12 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-xs text-gray-400 ml-1">mmHg</span>
          </div>
        </VitalCard>

        {/* Glucose */}
        <VitalCard icon="💧" label="Glucose" filled={!!glucose}>
          <div className="flex items-center gap-1">
            <input
              type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)}
              placeholder="5.5"
              className="w-14 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-xs text-gray-400">mmol/L</span>
          </div>
          <div className="flex gap-1 mt-1.5">
            {(["fasting", "post_meal"] as GlucoseMode[]).map((gm) => (
              <button
                key={gm}
                onClick={() => setGlucoseMode(gm)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  glucoseMode === gm
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "border-gray-200 text-gray-400"
                }`}
              >
                {gm === "fasting" ? "Fasting" : "Post-meal"}
              </button>
            ))}
          </div>
        </VitalCard>

        {/* Weight */}
        <VitalCard icon="⚖" label="Weight" filled={!!weight}>
          <div className="flex items-center gap-1">
            <input
              type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
              placeholder="68"
              className="w-14 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-xs text-gray-400">kg</span>
          </div>
          <p className="text-xs text-teal-600 mt-1">↓ 0.5 kg from last</p>
        </VitalCard>

        {/* Temperature */}
        <VitalCard icon="🌡" label="Temperature" filled={!!temp}>
          <div className="flex items-center gap-1">
            <input
              type="number" value={temp} onChange={(e) => setTemp(e.target.value)}
              placeholder="36.6"
              className="w-14 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-xs text-gray-400">°C</span>
          </div>
        </VitalCard>

        {/* O2 */}
        <VitalCard icon="🫁" label="Oxygen (SpO2)" filled={!!o2}>
          <div className="flex items-center gap-1">
            <input
              type="number" value={o2} onChange={(e) => setO2(e.target.value)}
              placeholder="98"
              className="w-14 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
        </VitalCard>

        {/* Heart rate */}
        <VitalCard icon="❤️" label="Heart rate" filled={!!heartRate}>
          <div className="flex items-center gap-1">
            <input
              type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)}
              placeholder="72"
              className="w-14 text-xl font-medium bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-300"
            />
            <span className="text-xs text-gray-400">bpm</span>
          </div>
        </VitalCard>

      </div>

      {/* Detailed extras */}
      {mode === "detailed" && (
        <>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Symptoms</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  symptoms.includes(s)
                    ? "bg-teal-50 border-teal-300 text-teal-800"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations for the doctor..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 mb-5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Photo</p>
          <input
            ref={fileInputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handlePhotoChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-gray-300 rounded-lg py-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors mb-5"
          >
            📷 {uploadingPhoto ? "Uploading..." : photoUrl ? "Photo added ✓" : "Take photo or upload"}
          </button>
        </>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !hasAnyVital}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-200 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-lg transition-colors text-sm"
      >
        {saving ? "Saving..." : "Save reading"}
      </button>

    </div>
  );
}
