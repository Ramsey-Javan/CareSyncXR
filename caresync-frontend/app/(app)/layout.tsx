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
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-base font-medium text-teal-700">CareSync</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  active
                    ? "bg-teal-50 text-teal-800 font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <i className={`ti ${item.icon} text-base`} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-gray-400 hover:text-red-600 transition-colors text-left px-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
