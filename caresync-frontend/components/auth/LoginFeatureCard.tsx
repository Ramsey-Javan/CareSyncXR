"use client";

import { motion } from "framer-motion";
import type { LoginFeature } from "./login-features";
import { cn } from "@/lib/utils";

const accentStyles = {
  emerald: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/15 border-cyan-500/20",
    glow: "group-hover:shadow-cyan-500/10",
  },
  red: {
    icon: "text-red-400",
    bg: "bg-red-500/15 border-red-500/20",
    glow: "group-hover:shadow-red-500/10",
  },
};

export function LoginFeatureCard({
  feature,
  index,
}: {
  feature: LoginFeature;
  index: number;
}) {
  const Icon = feature.icon;
  const s = accentStyles[feature.accent];

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.45, ease: "easeOut" }}
    >
      <div
        className={cn(
          "group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-sm",
          "hover:bg-white/[0.07] hover:border-white/10 transition-all duration-300",
          "shadow-lg shadow-black/10",
          s.glow
        )}
      >
        <div
          className={cn(
            "shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border",
            s.bg
          )}
        >
          <Icon className={cn("h-5 w-5", s.icon)} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-slate-100">{feature.title}</p>
          <p className="mt-1 text-sm leading-snug text-slate-500">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.li>
  );
}
