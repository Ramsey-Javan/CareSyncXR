"use client";

type RangeToggleProps = {
  value: number;
  onChange: (value: number) => void;
};

const options = [7, 14, 30, 90];

export default function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-3 py-1 text-sm ${
            value === option
              ? "border-[#1D9E75] bg-[#1D9E75] text-white"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {option}d
        </button>
      ))}
    </div>
  );
}
