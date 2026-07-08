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
    <div className="space-y-6 p-6 md:p-8">

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">History</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Reading History & Trends
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track patient vitals over time
        </p>
      </div>

      {/* Metric Switcher */}
      <div className="flex flex-wrap gap-2">
        {["bp", "glucose", "hr", "spo2", "weight"].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              metric === m
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
            }`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Trend Graph */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <TrendChart data={chartData} metric={metric} />
      </div>

      {/* History List */}
      <div className="space-y-3">
        {readings.map((r: any) => (
          <div
            key={r.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {new Date(r.recorded_at).toLocaleString()}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
              <p className="rounded-lg bg-slate-50 px-3 py-2">BP: {r.bp_systolic}/{r.bp_diastolic}</p>
              <p className="rounded-lg bg-slate-50 px-3 py-2">Glucose: {r.glucose_fasting}</p>
              <p className="rounded-lg bg-slate-50 px-3 py-2">HR: {r.heart_rate}</p>
              <p className="rounded-lg bg-slate-50 px-3 py-2">SpO₂: {r.spo2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}