"use client";

import { MapPin } from "lucide-react";
import type { GeoLocation } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Stylized map panel — lat/lng normalized to Nairobi home-care region */
export function LocationMap({
  location,
  hospitalLabel,
  className,
}: {
  location: GeoLocation;
  hospitalLabel?: string;
  className?: string;
}) {
  const x = ((location.lng - 36.65) / 0.25) * 100;
  const y = ((location.lat + 1.35) / 0.15) * 100;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[200px]",
        className
      )}
    >
      <div className="absolute inset-0 login-grid-bg opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(6,182,212,0.15),transparent_50%)]" />

      {hospitalLabel && (
        <div
          className="absolute w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-lg"
          style={{ left: "72%", top: "28%" }}
          title={hospitalLabel}
        />
      )}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${Math.min(92, Math.max(8, x))}%`,
          top: `${Math.min(88, Math.max(12, 100 - y))}%`,
        }}
      >
        <span className="relative flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500 border-2 border-white" />
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/90 to-transparent">
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          {location.label}
        </p>
        <p className="text-[11px] font-mono text-slate-400 mt-1">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
        {hospitalLabel && (
          <p className="text-xs text-emerald-400 mt-2 font-medium">
            Nearest: {hospitalLabel}
          </p>
        )}
      </div>
    </div>
  );
}
