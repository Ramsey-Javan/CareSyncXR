"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import TrendsPanel from "@/components/health/TrendsPanel";
import PhotoCapture from "@/components/health/PhotoCapture";
import HealthDataEntry from "@/components/health/HealthDataEntry";

export default function PatientDetailPage() {
  const { id } = useParams();

  const [tab, setTab] = useState<
    "overview" | "trends" | "history" | "photo"
  >("overview");

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-[#04342C]">
          Patient Dashboard
        </h1>

        <p className="text-gray-500 text-sm">
          Patient ID: {id}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {["overview", "trends", "history", "photo"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg border ${
              tab === t
                ? "bg-[#1D9E75] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === "overview" && (
        <HealthDataEntry patientId={id as string} />
      )}

      {tab === "trends" && (
        <TrendsPanel patientId={id as string} />
      )}

      {tab === "photo" && (
        <PhotoCapture />
      )}

      {tab === "history" && (
        <div className="text-gray-500">
          Add ReadingHistory component here
        </div>
      )}
    </div>
  );
}