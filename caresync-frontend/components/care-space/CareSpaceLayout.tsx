"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { HospitalStreamProvider } from "@/components/providers/HospitalStreamProvider";
import { PatientCareHeader } from "@/components/care-space/PatientCareHeader";
import { getUser, isAuthenticated } from "@/lib/auth.utils";
import { useHospitalStore } from "@/stores/hospitalStore";
import { cn } from "@/lib/utils";

const HEADER_HIDDEN_PREFIXES = ["/dashboard/settings", "/dashboard/patient"];

export function CareSpaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const emergency = useHospitalStore((s) => s.emergency);
  const patientStatus = useHospitalStore((s) => s.activePatient?.status);
  const [ready, setReady] = useState(false);

  const isEmergencyMode =
    emergency.active || patientStatus === "critical";

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-live" />
          Entering care space…
        </div>
      </div>
    );
  }

  const user = getUser();
  const hideCareHeader =
    user?.role === "admin" ||
    HEADER_HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <HospitalStreamProvider>
      <div
        className={cn(
          "flex min-h-screen transition-colors duration-700",
          isEmergencyMode ? "bg-slate-950" : "bg-[#f4f7fb]"
        )}
      >
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopbar emergencyMode={isEmergencyMode} />
          <main
            className={cn(
              "flex-1 p-6 lg:p-8 overflow-auto transition-colors duration-700",
              isEmergencyMode &&
                "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
            )}
          >
            {!hideCareHeader && (
              <div className="mb-6 max-w-[1600px] mx-auto">
                <PatientCareHeader />
              </div>
            )}
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </HospitalStreamProvider>
  );
}
