"use client";

import { useState } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiGenerateAIInsight } from "@/lib/api";
import { useHospitalStore } from "@/stores/hospitalStore";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { PageShell, PageSection } from "@/components/dashboard/PageShell";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export default function AIInsightsPage() {
  const patient = useHospitalStore((s) => s.activePatient);
  const insights = useHospitalStore((s) => s.insights);
  const addInsight = useHospitalStore((s) => s.addInsight);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!patient) return;
    setLoading(true);
    try {
      const insight = await apiGenerateAIInsight({
        patientId: patient.id,
        vitalsHistory: patient.history,
      });
      addInsight({ ...insight, patientName: patient.name });
      toast.success("AI insight ready");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageSection
        title="AI health analysis"
        description="Personalized insights for your active care recipient"
      >
        {patient ? (
          <DashboardCard padding="md" className="max-w-xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="font-semibold text-slate-900">{patient.name}</p>
                <p className="font-mono text-[11px] text-cyan-600 mt-0.5">
                  {patient.patientCode}
                </p>
              </div>
              <StatusBadge status={patient.status} />
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate summary
                </>
              )}
            </button>
          </DashboardCard>
        ) : (
          <DashboardCard padding="md">
            <p className="text-sm text-slate-500">No active care profile loaded.</p>
          </DashboardCard>
        )}
      </PageSection>

      <PageSection title="Insights library">
        {insights.length === 0 ? (
          <DashboardCard padding="lg" className="text-center">
            <Brain className="w-10 h-10 text-cyan-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No insights generated yet</p>
          </DashboardCard>
        ) : (
          <div className="space-y-4">
            {insights.map((i) => (
              <DashboardCard key={i.id} padding="lg">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-slate-900">{i.patientName}</p>
                  <StatusBadge status={i.riskLevel} />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{i.summary}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {i.flags.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-800 font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {new Date(i.generatedAt).toLocaleString()}
                </p>
              </DashboardCard>
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
