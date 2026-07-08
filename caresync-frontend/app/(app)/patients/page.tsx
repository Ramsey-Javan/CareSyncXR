"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`)
      .then((res) => res.json())
      .then(setPatients)
      .catch(() => setPatients([]));
  }, []);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Care team</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Patients</h1>
            <p className="mt-2 text-sm text-slate-600">Review the patient roster and open a profile in one step.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {patients.map((p) => (
          <div
            key={p.id}
            onClick={() => router.push(`/patients/${p.id}`)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="mt-1 text-sm text-slate-500">{p.age} yrs • {p.condition}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Open</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}