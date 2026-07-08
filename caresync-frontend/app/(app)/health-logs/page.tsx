"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { patientsService } from "@/lib/services/patients";
import { Patient } from "@/lib/types/patients";

export default function HealthLogsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientsService.list().then(({ data }) => {
      setPatients(data.data || data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-medium text-gray-900 mb-6">Health Logs</h1>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <p className="text-sm text-gray-400">No patients found. Add a patient to start logging health data.</p>
      )}

      {!loading && patients.length > 0 && (
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => router.push(`/health-logs/${patient.id}`)}
              className="flex items-center justify-between bg-white border border-gray-100 hover:border-teal-200 rounded-lg px-4 py-3 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="text-xs text-gray-500">{patient.condition}</p>
              </div>
              <span className="text-xs text-teal-600 font-medium">View logs →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
