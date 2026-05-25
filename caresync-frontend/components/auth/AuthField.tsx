"use client";

import { useId, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  icon?: LucideIcon;
  autoComplete?: string;
  required?: boolean;
};

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  autoComplete,
  required,
}: AuthFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const floated = focused || value.length > 0;

  return (
    <div className="relative group">
      {Icon && (
        <Icon
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 transition-colors duration-200",
            focused ? "text-cyan-600" : "text-slate-400"
          )}
          strokeWidth={1.75}
        />
      )}
      <input
        id={id}
        type={inputType}
        value={value}
        autoComplete={autoComplete}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={cn(
          "peer w-full h-[3.25rem] rounded-2xl border bg-white/90 text-[15px] text-slate-900",
          "border-slate-200/90 shadow-sm shadow-slate-200/40",
          "transition-all duration-200 placeholder-transparent",
          Icon ? "pl-11 pr-4 pt-5 pb-2" : "px-4 pt-5 pb-2",
          isPassword && "pr-12",
          "hover:border-slate-300 hover:bg-white",
          "focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/12 focus:outline-none"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute text-slate-500 transition-all duration-200",
          Icon ? "left-11" : "left-4",
          floated
            ? "top-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-600"
            : "top-1/2 -translate-y-1/2 text-[15px]"
        )}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
