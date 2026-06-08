"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Monitor, Shield, User, Users } from "lucide-react";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";
import type { AuthUser } from "@/lib/types";
import { getUser } from "@/lib/auth.utils";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <PageShell>
      <PageSection title="Account">
        <DashboardCard padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
              <User className="w-7 h-7 text-slate-300" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {user?.fullName ?? "Clinician"}
              </p>
              <p className="text-sm text-slate-500">{user?.email ?? "—"}</p>
              <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mt-1">
                {user?.role ?? "doctor"}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <SignOutButton />
            <p className="mt-3 text-xs text-slate-500">
              Signing out returns you to the login screen so you can sign in with a
              different account or role.
            </p>
          </div>
        </DashboardCard>
      </PageSection>

      <PageSection title="System preferences">
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardCard padding="md">
            <DashboardCardHeader
              title="Telemetry stream"
              description="WebSocket-ready vitals pipeline"
            />
            <p className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <Monitor className="w-4 h-4" />
              Simulated live mode active
            </p>
          </DashboardCard>
          <DashboardCard padding="md">
            <DashboardCardHeader
              title="Alerts"
              description="Emergency routing channels"
            />
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Bell className="w-4 h-4 text-yellow-500" />
              In-app + SOS escalation
            </p>
          </DashboardCard>
          <DashboardCard padding="md" className="md:col-span-2">
            <DashboardCardHeader title="Security & compliance" />
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-cyan-500" />
              HIPAA-conscious · encrypted sessions
            </p>
          </DashboardCard>
          <DashboardCard padding="md" className="md:col-span-2">
            <DashboardCardHeader
              title="Care circle"
              description="Invite doctor, caregiver, and family"
            />
            <Link
              href="/dashboard/care-profile"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-cyan-700 mt-2"
            >
              <Users className="w-4 h-4" />
              Manage invitations →
            </Link>
          </DashboardCard>
        </div>
      </PageSection>
    </PageShell>
  );
}
