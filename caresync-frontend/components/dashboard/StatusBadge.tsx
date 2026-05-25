import { cn } from "@/lib/utils";
import type { PatientStatus } from "@/lib/types";

const styles: Record<PatientStatus, { badge: string; dot: string }> = {
  stable: {
    badge: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
    dot: "bg-emerald-500",
  },
  warning: {
    badge: "bg-yellow-500/10 text-yellow-800 ring-yellow-500/25",
    dot: "bg-yellow-500",
  },
  critical: {
    badge: "bg-red-500/10 text-red-700 ring-red-500/30",
    dot: "bg-red-500 animate-pulse-live",
  },
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: PatientStatus;
  className?: string;
  showDot?: boolean;
}) {
  const s = styles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
        s.badge,
        status === "critical" && "animate-pulse",
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />}
      {status}
    </span>
  );
}
