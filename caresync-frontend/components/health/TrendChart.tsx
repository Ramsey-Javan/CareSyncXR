"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendChartProps = {
  data: Array<Record<string, number | string>>;
  metric: string;
};

export default function TrendChart({ data, metric }: TrendChartProps) {
  const keyMap: Record<string, string> = {
    bp: "bp",
    glucose: "glucose",
    hr: "hr",
    spo2: "spo2",
    weight: "weight",
  };

  const selectedKey = keyMap[metric] ?? "bp";

  return (
    <div className="h-72 rounded-xl border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={selectedKey}
            stroke="#1D9E75"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
