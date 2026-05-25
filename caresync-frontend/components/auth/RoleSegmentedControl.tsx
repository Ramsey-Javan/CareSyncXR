"use client";

import { cn } from "@/lib/utils";
import { LOGIN_ROLES } from "./login-features";

export function RoleSegmentedControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (role: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 px-0.5">
        I am signing in as
      </p>
      <div
        className="grid grid-cols-2 gap-2.5"
        role="radiogroup"
        aria-label="Select your role"
      >
        {LOGIN_ROLES.map((r) => {
          const active = value === r.value;
          const Icon = r.icon;
          const isFamily = r.value === "family";

          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(r.value)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 px-2 min-h-[4.25rem] transition-all duration-200",
                isFamily && "col-span-2",
                active
                  ? "border-cyan-600 bg-gradient-to-b from-cyan-50 to-white text-slate-900 shadow-md shadow-cyan-500/15 ring-2 ring-cyan-500/25"
                  : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-cyan-700" : "text-slate-600"
                )}
                strokeWidth={2}
              />
              <span
                className={cn(
                  "text-xs font-bold leading-tight text-center",
                  active ? "text-slate-900" : "text-slate-800"
                )}
              >
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
      {value === "family" && (
        <p className="text-xs leading-relaxed text-slate-700 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2.5">
          <span className="font-semibold text-amber-900">Family sign-in:</span>{" "}
          View your loved one&apos;s vitals, medications, and emergency status.
          Use the email linked to your care circle.
        </p>
      )}
    </div>
  );
}
