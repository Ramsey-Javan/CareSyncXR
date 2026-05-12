import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-1">
            <Image
              src="/logo.jpeg"
              alt="CareSync"
              width={120}
              height={120}
              className="rounded-xl"
            />
            <span className="text-2xl font-semibold text-slate-800 tracking-tight">
              Care<span className="text-teal-500">Sync</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">AI-Powered Remote Healthcare</p>
        </div>

        {children}

      </div>
    </div>
  );
}