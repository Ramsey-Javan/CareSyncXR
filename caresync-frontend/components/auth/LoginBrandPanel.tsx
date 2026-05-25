"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Radio, Shield } from "lucide-react";
import { LOGIN_FEATURES } from "./login-features";
import { LoginFeatureCard } from "./LoginFeatureCard";
import { LoginVitalsPreview } from "./LoginVitalsPreview";

export function LoginBrandPanel() {
  return (
    <section className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 login-grid-bg opacity-[0.28]" />
      <div className="pointer-events-none absolute inset-0 login-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950" />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-8%] h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[110px]"
        animate={{ y: [0, 28, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-18%] left-[-8%] h-[420px] w-[420px] rounded-full bg-emerald-500/18 blur-[100px]"
        animate={{ y: [0, -24, 0], opacity: [0.25, 0.48, 0.25] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex flex-col h-full min-h-screen p-10 xl:p-14">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Image
            src="/logo.jpeg"
            alt="CareSync"
            width={52}
            height={52}
            className="rounded-2xl ring-1 ring-white/15 shadow-2xl shadow-black/40"
            priority
          />
          <div>
            <p className="text-lg font-bold tracking-tight">CareSync</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Personal remote care
            </p>
          </div>
        </motion.header>

        <div className="flex-1 flex flex-col justify-center py-8 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-live" />
              Care intelligence online
            </div>

            <h1 className="text-[2.1rem] xl:text-[2.75rem] font-bold leading-[1.1] tracking-tight">
              Calm, continuous care{" "}
              <span className="text-gradient-brand">at home</span>
            </h1>

            <p className="mt-5 text-base xl:text-[1.05rem] text-slate-400 leading-relaxed max-w-lg">
              One care journey per dashboard — wearable vitals, medications, AI
              insights, and SOS when every second matters.
            </p>
          </motion.div>

          <LoginVitalsPreview />

          <ul className="mt-6 space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {LOGIN_FEATURES.slice(0, 3).map((f, i) => (
              <LoginFeatureCard key={f.title} feature={f} index={i} />
            ))}
          </ul>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-wrap items-center gap-3 text-xs text-slate-500"
        >
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
            <Radio className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-slate-400">
              Telemetry{" "}
              <strong className="text-emerald-400 font-medium">live</strong>
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-cyan-500" />
            Encrypted sessions
          </span>
        </motion.footer>
      </div>
    </section>
  );
}
