"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Video } from "lucide-react";
import { toast } from "sonner";
import { apiListConsultations, apiScheduleConsultation } from "@/lib/api";
import { useHospitalStore } from "@/stores/hospitalStore";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConsultationsPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const consultations = useHospitalStore((s) => s.consultations);
  const setConsultations = useHospitalStore((s) => s.setConsultations);
  const upsertConsultation = useHospitalStore((s) => s.upsertConsultation);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiListConsultations().then((list) => {
      if (list.length) setConsultations(list);
    });
  }, [setConsultations]);

  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    if (!patient || !scheduledAt) return;
    setLoading(true);
    try {
      const c = await apiScheduleConsultation({
        patientId: patient.id,
        scheduledAt,
      });
      upsertConsultation({ ...c, patientName: patient.name });
      toast.success("Consultation scheduled");
      setScheduledAt("");
    } catch {
      toast.error("Scheduling failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageSection title="Schedule session">
        <DashboardCard padding="lg">
          {patient ? (
            <form onSubmit={schedule} className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[200px] flex-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Care recipient
                </label>
                <p className="mt-1.5 h-11 flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800">
                  {patient.name}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Date & time
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">No active care profile.</p>
          )}
        </DashboardCard>
      </PageSection>

      <PageSection title="Upcoming & active">
        {consultations.length === 0 ? (
          <DashboardCard padding="lg">
            <p className="text-sm text-slate-500">No consultations scheduled</p>
          </DashboardCard>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <DashboardCard
                key={c.id}
                padding="md"
                className="flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{c.patientName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date(c.scheduledAt).toLocaleString()} ·{" "}
                    <span className="capitalize">{c.status}</span>
                  </p>
                </div>
                <Link
                  href={`/dashboard/consultations/video?consultationId=${c.id}&patientId=${c.patientId}`}
                  className="inline-flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join call
                </Link>
              </DashboardCard>
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
