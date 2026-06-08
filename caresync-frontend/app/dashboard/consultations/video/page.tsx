"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiGetConsultationRoom, apiGenerateAIInsight } from "@/lib/api";
import { useHospitalStore } from "@/stores/hospitalStore";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DashboardCard, DashboardCardHeader } from "@/components/dashboard/DashboardCard";

function VideoCallContent() {
  const params = useSearchParams();
  const patientId = params.get("patientId");
  const consultationId = params.get("consultationId") ?? "live";
  const activePatient = useHospitalStore((s) => s.activePatient);
  const addInsight = useHospitalStore((s) => s.addInsight);
  const [roomUrl, setRoomUrl] = useState("");
  const [summary, setSummary] = useState<string | null>(null);

  const patient = activePatient;

  useEffect(() => {
    apiGetConsultationRoom(consultationId).then(({ roomUrl: url }) =>
      setRoomUrl(url)
    );
  }, [consultationId]);

  async function endAndSummarize() {
    if (!patient) return;
    const insight = await apiGenerateAIInsight({
      patientId: patient.id,
      vitalsHistory: patient.history,
    });
    addInsight({ ...insight, patientName: patient.name });
    setSummary(insight.summary);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6 lg:-m-8 rounded-2xl overflow-hidden border border-slate-200 shadow-medical-lg">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-slate-900 flex flex-col min-w-0">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Video consultation</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Secure Daily.co room
              </p>
            </div>
            <span className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-live" />
              Live
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-slate-950">
            {roomUrl ? (
              <iframe
                src={roomUrl}
                className="w-full h-full"
                allow="camera; microphone; fullscreen"
                title="CareSync consultation"
              />
            ) : (
              <p className="text-slate-500 text-sm">Connecting to room…</p>
            )}
          </div>
        </div>

        {patient && (
          <aside className="w-full sm:w-80 bg-slate-50 border-l border-slate-200 p-5 overflow-y-auto shrink-0">
            <DashboardCardHeader title={patient.name} />
            <StatusBadge status={patient.status} className="mb-4" />
            <p className="font-mono text-xs text-cyan-600 mb-4">
              {patient.patientCode}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="rounded-xl bg-white border p-2.5">
                <p className="text-[10px] text-slate-400 uppercase">HR</p>
                <p className="font-bold tabular-nums">{patient.vitals.heartRate}</p>
              </div>
              <div className="rounded-xl bg-white border p-2.5">
                <p className="text-[10px] text-slate-400 uppercase">SpO₂</p>
                <p className="font-bold tabular-nums">{patient.vitals.oxygen}%</p>
              </div>
            </div>
            <VitalsChart history={patient.history} />
            <button
              type="button"
              onClick={endAndSummarize}
              className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all"
            >
              End & AI summary
            </button>
            {summary && (
              <p className="mt-4 text-xs text-slate-600 leading-relaxed p-3 rounded-xl bg-white border">
                {summary}
              </p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export default function VideoCallPage() {
  return (
    <Suspense
      fallback={
        <p className="text-slate-500 text-sm p-6">Loading video session…</p>
      }
    >
      <VideoCallContent />
    </Suspense>
  );
}
