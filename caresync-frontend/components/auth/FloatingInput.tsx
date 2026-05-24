"use client";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";

export function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={cn(
          "peer w-full h-14 rounded-2xl border bg-slate-50/80 px-4 pt-5 pb-2 text-[15px] text-slate-900",
          "border-slate-200 transition-all duration-200",
          "hover:border-slate-300 hover:bg-white",
          "focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15 focus:outline-none",
          "placeholder-transparent"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-4 text-slate-500 transition-all duration-200",
          floated
            ? "top-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-600"
            : "top-1/2 -translate-y-1/2 text-[15px]"
        )}
      >
        {label}
      </label>
    </div>
  );
}
