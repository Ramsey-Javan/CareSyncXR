"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { apiLogin } from "@/lib/api";
import { saveSession, getDashboardRoute } from "@/lib/auth.utils";
import { AuthField } from "./AuthField";
import { RoleSegmentedControl } from "./RoleSegmentedControl";
import { cn } from "@/lib/utils";

const REMEMBER_KEY = "caresync_remember_email";

export function LoginAuthPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("caregiver");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await apiLogin({
        email,
        password,
        role: role.toLowerCase(),
      });
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      saveSession(user);
      toast.success("Welcome back");
      const dest =
        searchParams.get("callbackUrl") ?? getDashboardRoute(user.role);
      router.push(dest);
    } catch {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const demos: Record<string, { email: string; role: string }> = {
      patient: { email: "patient@caresync.app", role: "patient" },
      caregiver: { email: "caregiver@caresync.app", role: "caregiver" },
      family: { email: "family@caresync.app", role: "family" },
      doctor: { email: "doctor@caresync.app", role: "doctor" },
      admin: { email: "admin@caresync.app", role: "admin" },
    };
    const pick = demos[role] ?? demos.caregiver;
    setEmail(pick.email);
    setPassword("password123");
    setRole(pick.role);
    toast.message(`Demo credentials filled for ${pick.role}`);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info(
      "Password reset is handled by your care administrator. Contact support.",
      { duration: 5000 }
    );
  };

  return (
    <section className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[#f4f7fb] px-6 py-12 sm:px-10 lg:px-14 xl:px-16">
      <div className="pointer-events-none absolute inset-0 login-auth-mesh" />
      <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl lg:hidden" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mx-auto w-full max-w-[440px]"
      >
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Image
            src="/logo.jpeg"
            alt="CareSync"
            width={64}
            height={64}
            className="rounded-2xl shadow-medical-lg ring-1 ring-white"
          />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Personal remote care
          </p>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-[1.35rem] border border-white/80",
            "bg-white/80 backdrop-blur-xl p-8 sm:p-9",
            "shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)]"
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          <header className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Secure sign in
            </div>
            <h2 className="text-[1.65rem] font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Access your care workspace — monitoring, medications, and emergency
              tools in one place.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthField
              label="Email address"
              type="email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />

            <AuthField
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between gap-4 pt-0.5">
              <label className="flex cursor-pointer items-center gap-2.5 group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-0"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <RoleSegmentedControl value={role} onChange={setRole} />

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "group relative mt-1 w-full h-[3.35rem] rounded-2xl font-semibold text-white text-[15px]",
                "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900",
                "hover:from-slate-800 hover:to-slate-700",
                "shadow-lg shadow-slate-900/20",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "transition-all duration-200 active:scale-[0.99]",
                "flex items-center justify-center gap-2 overflow-hidden"
              )}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Continue to CareSync
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-[0.16em]">
              <span className="bg-white/90 px-3 text-slate-400 font-semibold">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={fillDemo}
            className="w-full h-11 rounded-2xl border border-slate-200 bg-slate-50/80 text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition-all"
          >
            Try demo credentials
          </button>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to CareSync?{" "}
            <Link
              href="/register"
              className="font-semibold text-cyan-600 hover:text-cyan-700 underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
          HIPAA-conscious · End-to-end encrypted
        </p>
      </motion.div>
    </section>
  );
}
