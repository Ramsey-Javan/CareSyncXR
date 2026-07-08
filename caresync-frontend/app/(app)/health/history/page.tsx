"use client";

import { useEffect, useState } from "react";
import TrendChart from "@/components/health/TrendChart";

export default function HistoryPage() {
  const [readings, setReadings] = useState([]);
  const [metric, setMetric] = useState("bp");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health-readings`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setReadings);
  }, []);

  const chartData = readings.map((r: any) => ({
    date: new Date(r.recorded_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    bp: r.bp_systolic,
    glucose: r.glucose_fasting,
    hr: r.heart_rate,
    spo2: r.spo2,
    weight: r.weight,
  }));

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#04342C]">
          Reading History & Trends
        </h1>
        <p className="text-gray-500">
          Track patient vitals over time
        </p>
      </div>

      {/* Metric Switcher */}
      <div className="flex gap-2">
        {["bp", "glucose", "hr", "spo2", "weight"].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-4 py-2 rounded-lg border ${
              metric === m
                ? "bg-[#1D9E75] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Trend Graph */}
      <TrendChart data={chartData} metric={metric} />

      {/* History List */}
      <div className="space-y-3">
        {readings.map((r: any) => (
          <div
            key={r.id}
            className="border border-[#9FE1CB] rounded-xl p-4 bg-white"
          >
            <p className="text-sm text-gray-500">
              {new Date(r.recorded_at).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <p>BP: {r.bp_systolic}/{r.bp_diastolic}</p>
              <p>Glucose: {r.glucose_fasting}</p>
              <p>HR: {r.heart_rate}</p>
              <p>SpO₂: {r.spo2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}