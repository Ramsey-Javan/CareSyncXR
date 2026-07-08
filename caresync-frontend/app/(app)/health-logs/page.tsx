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
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Monitoring</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Health Logs</h1>
        <p className="mt-2 text-sm text-slate-600">Open a patient record to review the latest readings and support updates.</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      )}

      {!loading && patients.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No patients found. Add a patient to start logging health data.
        </div>
      )}

      {!loading && patients.length > 0 && (
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => router.push(`/health-logs/${patient.id}`)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="mt-1 text-sm text-slate-500">{patient.condition}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">View logs →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
