"use client";

import { useEffect } from "react";
import { startHospitalStream, stopHospitalStream } from "@/lib/stream/hospitalStream";
import { useHospitalStore } from "@/stores/hospitalStore";

export function HospitalStreamProvider({ children }: { children: React.ReactNode }) {
  const initialize = useHospitalStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    const mode =
      process.env.NEXT_PUBLIC_STREAM_MODE === "simulated"
        ? "simulated"
        : "websocket";
    startHospitalStream(mode);
    return () => stopHospitalStream();
  }, [initialize]);

  return <>{children}</>;
}
