"use client";

import { usePathname } from "next/navigation";
import { Bell, Shield, Wifi } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getPageMeta } from "@/lib/dashboard-nav";
import { useHospitalStore } from "@/stores/hospitalStore";

export function DashboardTopbar({
  emergencyMode = false,
}: {
  emergencyMode?: boolean;
}) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const emergency = useHospitalStore((s) => s.emergency);
  const streamConnected = useHospitalStore((s) => s.streamConnected);
  const globalLevel = useHospitalStore((s) => s.emergency.globalAlertLevel);
  const unacked = useHospitalStore(
    (s) => s.alerts.filter((a) => !a.acknowledged).length
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-20 shrink-0 border-b backdrop-blur-xl transition-colors duration-500",
        emergencyMode
          ? "border-red-500/20 bg-slate-900/90"
          : "border-slate-200/80 bg-slate-50/85"
      )}
    >
      <div className="flex items-center justify-between gap-6 px-6 py-4">
        <div className="min-w-0">
          <h1
            className={cn(
              "text-xl font-bold tracking-tight truncate",
              emergencyMode ? "text-white" : "text-slate-900"
            )}
          >
            {meta.title}
          </h1>
          <p
            className={cn(
              "text-sm mt-0.5 truncate",
              emergencyMode ? "text-slate-400" : "text-slate-500"
            )}
          >
            {meta.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={cn(
              "hidden sm:flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-medium border",
              emergency.active || emergencyMode
                ? "bg-red-500/20 border-red-500/40 text-red-200 animate-pulse-emergency"
                : globalLevel === "warning"
                  ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-200"
                  : emergencyMode
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            {emergency.active || emergencyMode
              ? "Emergency mode"
              : globalLevel === "warning"
                ? "Elevated watch"
                : "Calm care"}
          </div>

          <div
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-sm text-xs font-medium",
              emergencyMode
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-white border-slate-200/80 text-slate-600"
            )}
          >
            <Wifi
              className={cn(
                "w-3.5 h-3.5",
                streamConnected ? "text-emerald-500" : "text-slate-400"
              )}
            />
            {streamConnected ? "Connected" : "Reconnecting"}
          </div>

          <Link
            href="/dashboard/alerts"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm transition-all",
              emergencyMode
                ? "bg-slate-800 border-slate-700 hover:border-red-500/40"
                : "bg-white border-slate-200/80 hover:border-cyan-300"
            )}
            aria-label={`${unacked} unacknowledged alerts`}
          >
            <Bell
              className={cn(
                "w-4 h-4",
                emergencyMode ? "text-slate-300" : "text-slate-600"
              )}
            />
            {unacked > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                {unacked > 9 ? "9+" : unacked}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
