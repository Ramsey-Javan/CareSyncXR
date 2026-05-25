"use client";

import { motion } from "framer-motion";
import { Activity, Heart, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Heart rate", value: "88", unit: "bpm", icon: Heart, tone: "text-rose-400" },
  { label: "SpO₂", value: "96", unit: "%", icon: Wind, tone: "text-cyan-400" },
  { label: "Status", value: "Stable", unit: "", icon: Activity, tone: "text-emerald-400" },
];

export function LoginVitalsPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6 }}
      className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md shadow-2xl shadow-black/20"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Live preview
        </p>
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-live" />
          Streaming
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.08 }}
              className="rounded-xl border border-white/[0.06] bg-slate-900/50 px-3 py-3 text-center"
            >
              <Icon className={cn("h-4 w-4 mx-auto mb-1.5", m.tone)} strokeWidth={1.75} />
              <p className="text-[9px] uppercase tracking-wider text-slate-500">{m.label}</p>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">
                {m.value}
                {m.unit && (
                  <span className="text-[10px] font-normal text-slate-500 ml-0.5">
                    {m.unit}
                  </span>
                )}
              </p>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          initial={{ width: "30%" }}
          animate={{ width: ["30%", "78%", "52%", "88%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
