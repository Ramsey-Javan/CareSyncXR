"use client";

import { ReactNode } from "react";

interface VitalCardProps {
  icon: ReactNode;
  label: string;
  filled: boolean;
  fullWidth?: boolean;
  value?: string | number;
  unit?: string;
  status?: string;
  children?: ReactNode;
}

export default function VitalCard({
  icon,
  label,
  filled,
  fullWidth,
  value,
  unit,
  status,
  children,
}: VitalCardProps) {
  return (
    <div
      className={`
        bg-white border rounded-xl p-3 cursor-text transition-colors
        ${filled ? "border-teal-400" : "border-gray-100"}
        ${fullWidth ? "col-span-2" : ""}
        focus-within:border-teal-500 focus-within:bg-teal-50/30
      `}
    >
      <div className={`text-lg mb-1 ${filled ? "text-teal-600" : "text-gray-400"}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      {children ? (
        children
      ) : (
        <div>
          <p className={`text-2xl font-semibold ${filled ? "text-gray-900" : "text-gray-400"}`}>
            {value}{unit ? ` ${unit}` : ""}
          </p>
          {status && <p className="text-xs text-gray-500 mt-1 capitalize">{status}</p>}
        </div>
      )}
    </div>
  );
}
