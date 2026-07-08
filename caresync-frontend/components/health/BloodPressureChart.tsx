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

type Props = {
  data?: any[];
  readings?: any[];
};

export default function BloodPressureChart({ data, readings }: Props) {
  const chartData = readings ?? data ?? [];

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />
          <YAxis />

          <Tooltip />

          {/* Systolic */}
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#1D9E75"
            strokeWidth={3}
            dot={{ r: 2 }}
          />

          {/* Diastolic */}
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#085041"
            strokeWidth={3}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}