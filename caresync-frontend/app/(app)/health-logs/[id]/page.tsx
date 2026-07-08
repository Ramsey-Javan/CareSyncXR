"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientsService } from "@/lib/services/patients";
import { healthService } from "@/lib/services/health_4";
import { Patient } from "@/lib/types/patients";
import { HealthReading, HealthHistory } from "@/lib/types/health";
import BloodPressureChart from "@/components/health/BloodPressureChart";
import GlucoseChart from "@/components/health/GlucoseChart";
import WeightChart from "@/components/health/WeightChart";
import VitalCard from "@/components/health/VitalCard_2";

export default function PatientHealthLogsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<HealthReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState(30);

  useEffect(() => {
    Promise.all([
      patientsService.get(id).then(({ data }) => setPatient(data)),
      healthService.history(id, range).then(({ data: h }) => {
        setHistory(h.data || []);
      }).catch((err) => {
        console.error("❌ Error fetching health history:", err);
        // Use empty array if API fails
        setHistory([]);
      }),
    ])
      .catch(() => setError("Could not load data."))
      .finally(() => setLoading(false));
  }, [id, range]);

  const latestReading = history?.[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-medium text-gray-900">
              {patient ? `${patient.first_name} ${patient.last_name}` : "Health Logs"}
            </h1>
            {patient && <p className="text-xs text-gray-500">{patient.condition}</p>}
          </div>
        </div>
        <button
          onClick={() => router.push(`/health-logs/${id}/log`)}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Log reading
        </button>
      </div>

      {/* Latest vitals cards */}
      {latestReading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {latestReading.bp_systolic && (
            <VitalCard
              icon="🩺"
              filled={true}
              label="Blood Pressure"
              value={`${latestReading.bp_systolic}/${latestReading.bp_diastolic}`}
              unit="mmHg"
              status="normal"
            />
          )}
          {latestReading.glucose && (
            <VitalCard
              icon="🧪"
              filled={true}
              label="Glucose"
              value={latestReading.glucose}
              unit="mg/dL"
              status={latestReading.glucose > 200 ? "high" : "normal"}
            />
          )}
          {latestReading.weight && (
            <VitalCard
              icon="⚖️"
              filled={true}
              label="Weight"
              value={latestReading.weight}
              unit="kg"
              status="normal"
            />
          )}
          {latestReading.temperature && (
            <VitalCard
              icon="🌡️"
              filled={true}
              label="Temperature"
              value={latestReading.temperature}
              unit="°C"
              status={latestReading.temperature > 37.5 ? "high" : "normal"}
            />
          )}
        </div>
      )}

      {/* Range selector */}
      <div className="flex gap-2 mb-6">
        {[7, 14, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setRange(days)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              range === days
                ? "bg-teal-50 border-teal-300 text-teal-800"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Charts */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Blood Pressure</h3>
            <BloodPressureChart readings={history} />
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Glucose Levels</h3>
            <GlucoseChart readings={history} />
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Weight</h3>
            <WeightChart readings={history} />
          </div>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No health readings yet.</p>
        </div>
      )}
    </div>
  );
}
