"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/dashboard",  icon: "ti-layout-dashboard" },
  { label: "Patients",     href: "/patients",   icon: "ti-users"            },
  { label: "Health logs",  href: "/health",     icon: "ti-activity"         },
  { label: "Consultations",href: "/consultations", icon: "ti-video"         },
  { label: "Alerts",       href: "/alerts",     icon: "ti-bell"             },
  { label: "Settings",     href: "/settings",   icon: "ti-settings"         },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">

        {/* Logo */}
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
              CS
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">CareSync</p>
              <p className="text-xs text-slate-500">Remote care hub</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-primary" : "bg-slate-300"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-1 text-left text-sm text-slate-500 transition-colors hover:text-destructive"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>

    </div>
  );
}
