"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth.utils";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "sidebar";
}) {
  const router = useRouter();

  function signOut() {
    clearSession();
    router.push("/login");
    router.refresh();
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={signOut}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium",
          "text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50 transition-all",
          className
        )}
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700",
        "hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm",
        className
      )}
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
