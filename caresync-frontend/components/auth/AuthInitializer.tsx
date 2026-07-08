"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
