"use client";

import {
  Activity,
  Brain,
  Pill,
  Siren,
  Stethoscope,
  UserRound,
} from "lucide-react";
import type { CareTimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS = {
  wearable: Activity,
  caregiver: UserRound,
  medication: Pill,
  alert: Siren,
  ai: Brain,
  sos: Siren,
};

const COLORS = {
  wearable: "text-cyan-600 bg-cyan-500/10",
  caregiver: "text-emerald-600 bg-emerald-500/10",
  medication: "text-violet-600 bg-violet-500/10",
  alert: "text-red-600 bg-red-500/10",
  ai: "text-cyan-600 bg-cyan-500/10",
  sos: "text-red-600 bg-red-500/10",
};

export function CareTimeline({
  entries,
  limit = 8,
}: {
  entries: CareTimelineEntry[];
  limit?: number;
}) {
  const items = entries.slice(0, limit);

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        No timeline events yet
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((e) => {
        const Icon = ICONS[e.kind] ?? Stethoscope;
        return (
          <li
            key={e.id}
            className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
          >
            <div
              className={cn(
                "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
                COLORS[e.kind]
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {e.title}
                </p>
                <time className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                  {new Date(e.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              {e.detail && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {e.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
