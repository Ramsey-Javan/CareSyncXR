"use client";

import { toast } from "sonner";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { MetricStat } from "@/components/dashboard/MetricStat";
import { MedicationSchedule } from "@/components/dashboard/MedicationSchedule";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { apiMarkMedicationAdministered } from "@/lib/api";

export default function MedicationTrackerPage() {
  const medications = useHospitalStore((s) => s.medications);
  const patient = useHospitalStore((s) => s.activePatient);
  const markMedicationAdministered = useHospitalStore(
    (s) => s.markMedicationAdministered
  );

  const missed = medications.filter((m) => m.missed).length;
  const avgAdherence =
    medications.length > 0
      ? Math.round(
          medications.reduce((a, m) => a + m.adherencePercent, 0) /
            medications.length
        )
      : 0;

  async function handleAdminister(id: string) {
    await apiMarkMedicationAdministered(id);
    markMedicationAdministered(id);
    toast.success("Dose recorded");
  }

  return (
    <PageShell>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricStat label="Scheduled" value={medications.length} />
        <MetricStat label="Missed doses" value={missed} accent="yellow" />
        <MetricStat
          label="Adherence"
          value={`${avgAdherence}%`}
          accent="emerald"
        />
      </div>

      {patient && (
        <PageSection
          title={`Medications for ${patient.name}`}
          description={patient.room}
        >
          <DashboardCard padding="md">
            <MedicationSchedule
              medications={medications}
              onAdminister={handleAdminister}
            />
          </DashboardCard>
        </PageSection>
      )}
    </PageShell>
  );
}
