import { cn } from "@/lib/utils";
import { DashboardCard } from "./DashboardCard";

type Accent = "default" | "emerald" | "red" | "yellow" | "cyan";

const accentMap: Record<Accent, string> = {
  default: "text-slate-900",
  emerald: "text-emerald-500",
  red: "text-red-500",
  yellow: "text-yellow-500",
  cyan: "text-cyan-500",
};

const dotMap: Record<Accent, string> = {
  default: "bg-slate-400",
  emerald: "bg-emerald-500",
  red: "bg-red-500 animate-pulse-live",
  yellow: "bg-yellow-500",
  cyan: "bg-cyan-500",
};

export function MetricStat({
  label,
  value,
  accent = "default",
  sublabel,
  live,
}: {
  label: string;
  value: string | number;
  accent?: Accent;
  sublabel?: string;
  live?: boolean;
}) {
  return (
    <DashboardCard padding="md" className="relative overflow-hidden">
      {live && (
        <span className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600">
          <span className={cn("w-1.5 h-1.5 rounded-full", dotMap.emerald)} />
          Live
        </span>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "text-3xl font-bold mt-2 tabular-nums tracking-tight capitalize",
          accentMap[accent]
        )}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-slate-400 mt-1">{sublabel}</p>
      )}
    </DashboardCard>
  );
}
