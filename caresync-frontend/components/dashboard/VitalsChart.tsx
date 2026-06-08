"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { VitalsHistoryPoint } from "@/lib/types";

export function VitalsChart({ history }: { history: VitalsHistoryPoint[] }) {
  const data = history.map((h, i) => ({
    t: i,
    hr: h.heartRate,
    o2: h.oxygen,
  }));

  if (data.length < 2) {
    return (
      <div className="h-28 flex items-center justify-center">
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse-live" />
          Syncing vitals stream…
        </p>
      </div>
    );
  }

  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis
            tick={{ fontSize: 9, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 11,
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
            }}
          />
          <Line
            type="monotone"
            dataKey="hr"
            name="HR"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="o2"
            name="SpO₂"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
