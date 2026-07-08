"use client";

interface Props {
  value: number;
  onChange: (days: number) => void;
}

const RANGES = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function RangeToggle({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {RANGES.map((r) => (
        <button
          key={r.days}
          onClick={() => onChange(r.days)}
          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
            value === r.days
              ? "bg-gray-100 border-gray-300 text-gray-800 font-medium"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
