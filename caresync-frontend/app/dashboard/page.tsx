"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, LogOut, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, initialized, isLoading, logout } =
    useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-[#64748B]">Loading your workspace…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="CareSync"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">CareSync</p>
              <p className="text-xs text-[#64748B]">Healthcare workspace</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="gap-2 border-[#E2E8F0]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#EFF6FF] text-[#2563EB] hover:bg-[#EFF6FF]">
                <Shield className="mr-1 h-3 w-3" />
                Week 1
              </Badge>
              <Badge
                variant="outline"
                className="border-[#22C55E] text-[#22C55E]"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Authenticated
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Welcome to CareSync
            </CardTitle>
            <CardDescription className="text-base text-[#64748B]">
              Authentication successful. You are connected to the CareSync API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  Auth state
                </p>
                <p className="mt-1 text-lg font-semibold text-[#22C55E]">
                  {isAuthenticated ? "Authenticated" : "Not authenticated"}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  Access token
                </p>
                <p className="mt-1 text-lg font-semibold text-[#2563EB]">
                  {accessToken ? "Present" : "Missing"}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#64748B]">
              Patient management, health logging, consultations, and alerts will
              be added in upcoming development weeks.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
