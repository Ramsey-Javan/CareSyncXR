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
    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-semibold text-[#04342C]">
        Patients
      </h1>

      {patients.map((p) => (
        <div
          key={p.id}
          onClick={() => router.push(`/patients/${p.id}`)}
          className="border border-[#9FE1CB] rounded-xl p-4 cursor-pointer hover:bg-[#E1F5EE]"
        >
          <p className="font-medium text-[#04342C]">
            {p.name}
          </p>

          <p className="text-sm text-gray-500">
            {p.age} yrs • {p.condition}
          </p>
        </div>
      ))}

    </div>
  );
}