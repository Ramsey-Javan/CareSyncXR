"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function GlucoseChart({ data, readings }: { data?: any[]; readings?: any[] }) {
  const chartData = readings ?? data ?? [];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />
          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="glucose"
            stroke="#1D9E75"
            strokeWidth={3}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}