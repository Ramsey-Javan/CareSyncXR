"use client";

import { useEffect, useState } from "react";
import { healthService } from "@/lib/services/health";
import { HealthReading } from "@/lib/types/health";

import RangeToggle from "@/components/health/RangeToggle";
import BloodPressureChart from "@/components/health/BloodPressureChart";
import GlucoseChart from "@/components/health/GlucoseChart";
import WeightChart from "@/components/health/WeightChart";

interface Props {
  patientId: string;
}

export default function TrendsPanel({ patientId }: Props) {
  const [days, setDays] = useState(30);
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    healthService
      .history(patientId, days)
      .then((res) => {
        setReadings(res.data);
      })
      .catch(() => setReadings([]))
      .finally(() => setLoading(false));
  }, [patientId, days]);

  // 🔥 SINGLE SOURCE OF TRUTH TRANSFORMATION
  const chartData = readings.map((r) => ({
    date: new Date(r.logged_at ?? Date.now()).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),

    systolic: r.bp_systolic,
    diastolic: r.bp_diastolic,

    glucose: r.glucose,
    weight: r.weight,
  }));

  return (
    <div className="bg-white border border-[#9FE1CB] rounded-xl p-4 mb-5">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[#04342C]">
          Patient Trends
        </p>

        <RangeToggle value={days} onChange={setDays} />
      </div>

      {/* BP */}
      {loading ? (
        <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
      ) : (
        <BloodPressureChart data={chartData} />
      )}

      {/* Glucose */}
      <div className="mt-6 mb-2 text-sm font-medium text-[#04342C]">
        Glucose
      </div>

      {loading ? (
        <div className="h-[180px] bg-gray-50 rounded-lg animate-pulse" />
      ) : (
        <GlucoseChart data={chartData} />
      )}

      {/* Weight */}
      <div className="mt-6 mb-2 text-sm font-medium text-[#04342C]">
        Weight
      </div>

      {loading ? (
        <div className="h-[160px] bg-gray-50 rounded-lg animate-pulse" />
      ) : (
        <WeightChart data={chartData} />
      )}

    </div>
  );
}