"use client";

import { AlertTriangle, Check } from "lucide-react";
import type { AlertItem } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

export function AlertCard({
  alert,
  onAcknowledge,
}: {
  alert: AlertItem;
  onAcknowledge?: () => void;
}) {
  const variant =
    alert.severity === "critical"
      ? "critical"
      : alert.severity === "warning"
        ? "warning"
        : "glass";

  return (
    <DashboardCard
      variant={variant}
      padding="md"
      className={cn(alert.acknowledged && "opacity-55")}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3 min-w-0">
          <div
            className={cn(
              "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              alert.severity === "critical"
                ? "bg-red-500/10 text-red-500"
                : "bg-yellow-500/10 text-yellow-600"
            )}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{alert.patientName}</p>
            <p className="font-mono text-[11px] text-cyan-600 mt-0.5">
              {alert.patientCode}
            </p>
          </div>
        </div>
        <StatusBadge status={alert.severity} />
      </div>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{alert.message}</p>
      <p className="text-xs text-slate-400 mt-2">
        {new Date(alert.createdAt).toLocaleString()}
      </p>
      {!alert.acknowledged && onAcknowledge && (
        <button
          type="button"
          onClick={onAcknowledge}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <Check className="w-4 h-4" />
          Acknowledge alert
        </button>
      )}
    </DashboardCard>
  );
}
