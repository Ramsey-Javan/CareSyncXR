"use client";

import { useHospitalStore } from "@/stores/hospitalStore";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AlertsPage() {
  const alerts = useHospitalStore((s) => s.alerts);
  const acknowledge = useHospitalStore((s) => s.acknowledgeAlert);
  const unacked = alerts.filter((a) => !a.acknowledged);

  return (
    <PageShell>
      <div className="flex gap-4 text-sm">
        <span className="font-medium text-slate-700">
          {unacked.length} active
        </span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">{alerts.length} total</span>
      </div>

      <PageSection title="Alert queue">
        {alerts.length === 0 ? (
          <DashboardCard padding="lg" className="text-center">
            <p className="text-slate-500">All clear — no alerts in queue</p>
          </DashboardCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {alerts.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={() => acknowledge(a.id)}
              />
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
