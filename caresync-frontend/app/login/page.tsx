import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";

export const metadata = {
  title: "Sign in — CareSync",
  description: "Sign in to your personal remote care workspace",
};

function LoginFallback() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#f4f7fb]">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-live" />
        Loading…
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginScreen />
    </Suspense>
  );
}
