"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavForRole } from "@/lib/dashboard-nav";
import { getUser } from "@/lib/auth.utils";
import type { UserRole } from "@/lib/auth.schemas";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useHospitalStore } from "@/stores/hospitalStore";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("caregiver");
  const emergency = useHospitalStore((s) => s.emergency);
  const streamConnected = useHospitalStore((s) => s.streamConnected);
  const patient = useHospitalStore((s) => s.activePatient);
  const unacked = useHospitalStore(
    (s) => s.alerts.filter((a) => !a.acknowledged).length
  );
  const criticalCount = useHospitalStore((s) =>
    s.activePatient?.status === "critical" ? 1 : 0
  );
  const missedMeds = useHospitalStore(
    (s) => s.medications.filter((m) => m.missed).length
  );

  useEffect(() => {
    const u = getUser();
    if (u) setRole(u.role);
  }, []);

  const nav = getNavForRole(role);

  return (
    <aside className="w-[272px] shrink-0 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800/80">
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src="/logo.jpeg"
              alt="CareSync"
              width={44}
              height={44}
              className="rounded-2xl object-cover ring-2 ring-slate-700 group-hover:ring-cyan-500/40 transition-all"
            />
            {streamConnected && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse-live" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[15px] tracking-tight truncate">
              CareSync
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {patient?.name ?? "Care space"}
            </p>
          </div>
        </Link>

        <div
          className={cn(
            "mt-4 rounded-xl px-3 py-2.5 text-xs flex items-center justify-between",
            emergency.active
              ? "bg-red-500/15 border border-red-500/30 text-red-300"
              : "bg-slate-800/60 border border-slate-700/50 text-slate-400"
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                streamConnected ? "bg-emerald-500 animate-pulse-live" : "bg-slate-500"
              )}
            />
            {streamConnected ? "Live" : "Offline"}
          </span>
          {emergency.active && (
            <span className="font-semibold text-red-400 animate-pulse uppercase tracking-wide text-[10px]">
              SOS
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {nav.map((section) => (
          <div key={section.id}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const badge =
                  item.badgeKey === "alerts"
                    ? unacked
                    : item.badgeKey === "critical"
                      ? criticalCount
                      : item.badgeKey === "medication"
                        ? missedMeds
                        : 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                        active
                          ? item.priority
                            ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-white shadow-inner border border-cyan-500/20"
                            : "bg-slate-800 text-white border border-slate-700/50"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent",
                        item.key === "emergency" &&
                          !active &&
                          "border-red-500/10 hover:border-red-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active
                            ? item.key === "emergency"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-cyan-500/20 text-cyan-400"
                            : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
                        )}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge > 0 && (
                        <span
                          className={cn(
                            "min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold",
                            item.badgeKey === "critical"
                              ? "bg-red-500 text-white animate-pulse-emergency"
                              : "bg-yellow-500 text-slate-900"
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <SignOutButton variant="sidebar" />
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
          One care journey
        </p>
      </div>
    </aside>
  );
}
