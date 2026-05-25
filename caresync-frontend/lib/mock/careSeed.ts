import type {
  CaregiverLogEntry,
  CareTimelineEntry,
  MedicationDose,
  Patient,
} from "../types";

function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function nextDue(hour: number): string {
  const d = new Date();
  const now = d.getHours() * 60 + d.getMinutes();
  const target = hour * 60;
  if (now >= target) d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function createSeedMedications(patient: Patient): MedicationDose[] {
  const patientId = patient.id;
  const meds: Omit<MedicationDose, "id">[] = [
    {
      patientId,
      name: "Metformin",
      dosage: "500mg",
      schedule: ["08:00", "20:00"],
      lastAdministeredAt: todayAt(8, 5),
      nextDueAt: nextDue(20),
      missed: false,
      adherencePercent: 94,
    },
    {
      patientId,
      name: "Lisinopril",
      dosage: "10mg",
      schedule: ["08:00"],
      lastAdministeredAt: todayAt(8, 5),
      nextDueAt: nextDue(8),
      missed: false,
      adherencePercent: 100,
    },
    {
      patientId,
      name: "Atorvastatin",
      dosage: "20mg",
      schedule: ["21:00"],
      lastAdministeredAt: todayAt(21, 2),
      nextDueAt: nextDue(21),
      missed: false,
      adherencePercent: 98,
    },
  ];

  return meds.map((m, i) => ({ ...m, id: `med-${i + 1}` }));
}

export function createSeedCaregiverLogs(patient: Patient): CaregiverLogEntry[] {
  const now = Date.now();
  return [
    {
      id: `log-${patient.id}-1`,
      patientId: patient.id,
      type: "vitals",
      source: "caregiver",
      summary: `Manual BP ${patient.vitals.bp} · glucose logged`,
      detail: "Morning home visit — patient calm, no acute distress",
      createdAt: new Date(now - 3600000).toISOString(),
    },
    {
      id: `log-${patient.id}-2`,
      patientId: patient.id,
      type: "observation",
      source: "caregiver",
      summary: "Mobility and hydration check",
      detail: "Ambulated with walker · 500ml fluids since wake",
      createdAt: new Date(now - 7200000).toISOString(),
    },
  ];
}

export function createSeedTimeline(
  patient: Patient,
  logs: CaregiverLogEntry[]
): CareTimelineEntry[] {
  const items: CareTimelineEntry[] = [
    {
      id: `tl-w-${patient.id}`,
      patientId: patient.id,
      kind: "wearable",
      title: "Wearable vitals sync",
      detail: `HR ${patient.vitals.heartRate} · SpO₂ ${patient.vitals.oxygen}% · activity normal`,
      createdAt: patient.vitals.timestamp,
    },
  ];

  logs.forEach((log) => {
    items.push({
      id: `tl-${log.id}`,
      patientId: log.patientId,
      kind: log.type === "medication" ? "medication" : "caregiver",
      title: log.summary,
      detail: log.detail ?? "",
      createdAt: log.createdAt,
    });
  });

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const DEFAULT_SOS_TIMELINE = [
  { id: "t1", label: "Abnormal vitals detected", status: "complete" as const },
  { id: "t2", label: "SOS protocol activated", status: "complete" as const },
  { id: "t3", label: "GPS location captured", status: "active" as const },
  { id: "t4", label: "Hospital routing", status: "pending" as const },
  { id: "t5", label: "Caregiver & next of kin notified", status: "pending" as const },
];
