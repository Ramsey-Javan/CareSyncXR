"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthInitializer>
      {children}
      <Toaster richColors position="top-right" />
    </AuthInitializer>
  );
}
