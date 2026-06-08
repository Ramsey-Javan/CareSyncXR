"use client";

import { Suspense } from "react";
import { LoginAuthPanel } from "@/components/auth/LoginAuthPanel";
import { LoginBrandPanel } from "@/components/auth/LoginBrandPanel";

function AuthPanelFallback() {
  return (
    <section className="flex flex-1 items-center justify-center bg-[#f4f7fb] p-10">
      <div className="h-[420px] w-full max-w-md animate-pulse rounded-[1.35rem] bg-white/60 shadow-lg" />
    </section>
  );
}

export function LoginScreen() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-slate-950 lg:bg-[#f4f7fb]">
      <LoginBrandPanel />
      <Suspense fallback={<AuthPanelFallback />}>
        <LoginAuthPanel />
      </Suspense>
    </div>
  );
}
