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

export default function WeightChart({ data, readings }: { data?: any[]; readings?: any[] }) {
  const chartData = readings ?? data ?? [];

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />
          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#04342C"
            strokeWidth={3}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}