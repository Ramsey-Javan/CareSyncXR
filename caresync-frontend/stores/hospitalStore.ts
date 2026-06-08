import { create } from "zustand";
import { generatePatientCode } from "@/lib/patientCode";
import { getUser } from "@/lib/auth.utils";
import {
  formatNextOfKin,
  getCareProfile,
  type CareProfile,
} from "@/lib/careProfile";
import type {
  AIInsight,
  AlertItem,
  CaregiverLogEntry,
  CareParticipant,
  CareTimelineEntry,
  Consultation,
  DoctorNote,
  EmergencyState,
  ManualVitals,
  MedicationDose,
  Patient,
  SOSEvent,
  GeoLocation,
  VitalsSnapshot,
  WearableDevice,
} from "@/lib/types";

const MAX_HISTORY = 24;

type HospitalState = {
  activePatient: Patient | null;
  wearable: WearableDevice | null;
  /** Advanced multi-patient — hidden from main UI; disabled by default */
  familyPatients: Patient[];
  alerts: AlertItem[];
  sosEvents: SOSEvent[];
  insights: AIInsight[];
  consultations: Consultation[];
  medications: MedicationDose[];
  caregiverLogs: CaregiverLogEntry[];
  timeline: CareTimelineEntry[];
  careParticipants: CareParticipant[];
  doctorNotes: DoctorNote[];
  emergency: EmergencyState;
  streamConnected: boolean;

  initialize: () => void;
  applyCareProfile: (profile: CareProfile) => void;
  setStreamConnected: (connected: boolean) => void;
  updateActivePatient: (patch: Partial<Patient>) => void;
  tickVitals: () => void;
  pushAlert: (alert: AlertItem) => void;
  acknowledgeAlert: (id: string) => void;
  addSosEvent: (event: SOSEvent) => void;
  updateSosRouting: (
    sosId: string,
    routing: SOSEvent["routing"],
    status: SOSEvent["routingStatus"]
  ) => void;
  updateSosEvent: (sosId: string, patch: Partial<SOSEvent>) => void;
  addInsight: (insight: AIInsight) => void;
  setConsultations: (list: Consultation[]) => void;
  upsertConsultation: (c: Consultation) => void;
  rotatePatientCodes: () => void;
  markMedicationAdministered: (medicationId: string) => void;
  logCaregiverVitals: (manual: ManualVitals, note?: string) => void;
  addCaregiverNote: (note: string) => void;
  pushTimeline: (entry: Omit<CareTimelineEntry, "id">) => void;
  checkMedicationMissed: () => void;
  addFamilyPatient: (patient: Patient) => void;
  removeFamilyPatient: (id: string) => void;
  addDoctorNote: (body: string, authorName?: string) => void;
};

function emptyVitals(): VitalsSnapshot {
  return {
    heartRate: 0,
    oxygen: 0,
    bp: "",
    systolic: 0,
    diastolic: 0,
    temperature: 0,
    respiratoryRate: 0,
    timestamp: new Date().toISOString(),
  };
}

function emptyLocation(label?: string): GeoLocation {
  return {
    lat: 0,
    lng: 0,
    label: label ?? "",
  };
}

function buildWearable(patient: Patient): WearableDevice {
  return {
    id: patient.wearableId,
    patientId: patient.id,
    patientCode: patient.patientCode,
    model: "CareSync Watch Pro",
    battery: 72 + Math.floor(Math.random() * 25),
    signalStrength: 85 + Math.floor(Math.random() * 14),
    lastSync: new Date().toISOString(),
    streaming: true,
  };
}

function patientFromCareProfile(base: Patient, profile: CareProfile): Patient {
  const location =
    profile.patientLocation?.trim() ||
    profile.careUnitName?.trim() ||
    base.room;

  return {
    ...base,
    name: profile.patientName.trim() || base.name,
    room: location,
    careUnitName: profile.careUnitName,
    caregiverName: profile.caregiverName.trim() || base.caregiverName,
    doctorName: profile.doctorName.trim() || base.doctorName,
    nextOfKin: formatNextOfKin(profile),
    nextOfKinPhone: profile.nextOfKinPhone,
    nextOfKinEmail: profile.nextOfKinEmail,
  };
}

function buildPatientFromProfile(profile: CareProfile, userName?: string, userId?: string): Patient {
  const now = Date.now();
  const name = profile.patientName.trim() || userName || "";
  const room =
    profile.patientLocation?.trim() ||
    profile.careUnitName?.trim() ||
    "";
  return {
    id: userId ?? `patient-${now}`,
    name,
    room,
    wearableId: `wear-${userId ?? now}`,
    patientCode: generatePatientCode(),
    codeRotatesAt: now + 15 * 60 * 1000,
    status: "stable",
    vitals: emptyVitals(),
    history: [],
    location: emptyLocation(room),
    caregiverName: profile.caregiverName?.trim() || undefined,
    doctorName: profile.doctorName?.trim() || undefined,
    nextOfKin: formatNextOfKin(profile),
    nextOfKinPhone: profile.nextOfKinPhone,
    nextOfKinEmail: profile.nextOfKinEmail,
    careUnitName: profile.careUnitName?.trim() || undefined,
  };
}

function buildCareParticipants(patient: Patient): CareParticipant[] {
  const doctorName = patient.doctorName?.trim() || "";
  const familyName = patient.nextOfKin?.split("(")[0]?.trim() ?? "";

  return [
    {
      id: "part-patient",
      role: "patient",
      name: patient.name,
      title: "Care recipient",
      online: true,
    },
    {
      id: "part-caregiver",
      role: "caregiver",
      name: patient.caregiverName ?? "",
      title: "Primary caregiver",
      online: true,
    },
    {
      id: "part-doctor",
      role: "doctor",
      name: doctorName,
      title: "Primary physician",
      online: false,
    },
    {
      id: "part-family",
      role: "family",
      name: familyName,
      title: "Next of kin",
      online: false,
    },
  ];
}

function nextScheduleDue(schedule: string[]): string {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  for (const slot of schedule) {
    const [h, m] = slot.split(":").map(Number);
    const mins = h * 60 + (m ?? 0);
    if (mins > current) {
      const d = new Date(now);
      d.setHours(h, m ?? 0, 0, 0);
      return d.toISOString();
    }
  }
  const [h, m] = schedule[0].split(":").map(Number);
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(h, m ?? 0, 0, 0);
  return d.toISOString();
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  activePatient: null,
  wearable: null,
  familyPatients: [],
  alerts: [],
  sosEvents: [],
  insights: [],
  consultations: [],
  medications: [],
  caregiverLogs: [],
  timeline: [],
  careParticipants: [],
  doctorNotes: [],
  emergency: {
    active: false,
    activeSosId: null,
    globalAlertLevel: "stable",
    lastUpdated: new Date().toISOString(),
  },
  streamConnected: false,

  initialize: () => {
    const user = getUser();
    const profile = user ? getCareProfile(user.email) : null;
    if (!profile) {
      set({
        activePatient: null,
        wearable: null,
        familyPatients: [],
        alerts: [],
        sosEvents: [],
        insights: [],
        consultations: [],
        medications: [],
        caregiverLogs: [],
        timeline: [],
        careParticipants: [],
        doctorNotes: [],
        emergency: {
          active: false,
          activeSosId: null,
          globalAlertLevel: "stable",
          lastUpdated: new Date().toISOString(),
        },
        streamConnected: false,
      });
      return;
    }

    const activePatient = buildPatientFromProfile(profile, user?.fullName, user?.id);
    set({
      activePatient,
      wearable: buildWearable(activePatient),
      medications: [],
      caregiverLogs: [],
      timeline: [],
      careParticipants: buildCareParticipants(activePatient),
      doctorNotes: [],
      streamConnected: true,
    });
  },

  applyCareProfile: (profile) => {
    const current = get().activePatient;
    const activePatient = current
      ? patientFromCareProfile(current, profile)
      : buildPatientFromProfile(profile, getUser()?.fullName, getUser()?.id);
    set({
      activePatient,
      wearable: buildWearable(activePatient),
      careParticipants: buildCareParticipants(activePatient),
    });
  },

  setStreamConnected: (connected) => set({ streamConnected: connected }),

  updateActivePatient: (patch) =>
    set((s) => {
      if (!s.activePatient) return s;
      const activePatient = { ...s.activePatient, ...patch };
      const wearable = s.wearable
        ? {
            ...s.wearable,
            patientCode: activePatient.patientCode,
            patientId: activePatient.id,
          }
        : buildWearable(activePatient);
      return { activePatient, wearable };
    }),

  tickVitals: () => {
    if (!get().activePatient) return;
  },

  pushAlert: (alert) =>
    set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 50) })),

  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a
      ),
    })),

  addSosEvent: (event) =>
    set((s) => ({
      sosEvents: [event, ...s.sosEvents].slice(0, 20),
      emergency: {
        active: true,
        activeSosId: event.id,
        globalAlertLevel: "critical",
        lastUpdated: new Date().toISOString(),
      },
    })),

  updateSosRouting: (sosId, routing, routingStatus) =>
    set((s) => ({
      sosEvents: s.sosEvents.map((e) =>
        e.id === sosId ? { ...e, routing, routingStatus } : e
      ),
    })),

  updateSosEvent: (sosId, patch) =>
    set((s) => ({
      sosEvents: s.sosEvents.map((e) =>
        e.id === sosId ? { ...e, ...patch } : e
      ),
    })),

  addInsight: (insight) =>
    set((s) => ({ insights: [insight, ...s.insights].slice(0, 30) })),

  setConsultations: (list) => set({ consultations: list }),

  upsertConsultation: (c) =>
    set((s) => {
      const idx = s.consultations.findIndex((x) => x.id === c.id);
      if (idx >= 0) {
        const next = [...s.consultations];
        next[idx] = c;
        return { consultations: next };
      }
      return { consultations: [c, ...s.consultations] };
    }),

  rotatePatientCodes: () => {
    const now = Date.now();
    set((s) => {
      if (!s.activePatient || s.activePatient.codeRotatesAt > now) return s;
      const activePatient = {
        ...s.activePatient,
        patientCode: generatePatientCode(),
        codeRotatesAt: now + 15 * 60 * 1000,
      };
      return {
        activePatient,
        wearable: s.wearable
          ? { ...s.wearable, patientCode: activePatient.patientCode }
          : buildWearable(activePatient),
      };
    });
  },

  markMedicationAdministered: (medicationId) => {
    const now = new Date().toISOString();
    set((s) => {
      const med = s.medications.find((m) => m.id === medicationId);
      if (!med) return s;
      const medications = s.medications.map((m) =>
        m.id === medicationId
          ? {
              ...m,
              lastAdministeredAt: now,
              nextDueAt: nextScheduleDue(m.schedule),
              missed: false,
              adherencePercent: Math.min(100, m.adherencePercent + 2),
            }
          : m
      );
      const log: CaregiverLogEntry = {
        id: `log-med-${Date.now()}`,
        patientId: med.patientId,
        type: "medication",
        source: "caregiver",
        summary: `${med.name} administered`,
        detail: med.dosage,
        createdAt: now,
      };
      return {
        medications,
        caregiverLogs: [log, ...s.caregiverLogs].slice(0, 100),
        timeline: [
          {
            id: log.id,
            patientId: med.patientId,
            kind: "medication" as const,
            title: log.summary,
            detail: log.detail ?? "",
            createdAt: now,
          },
          ...s.timeline,
        ].slice(0, 80),
      };
    });
  },

  logCaregiverVitals: (manual, note) => {
    const now = new Date().toISOString();
    set((s) => {
      if (!s.activePatient) return s;
      const p = s.activePatient;
      const activePatient: Patient = {
        ...p,
        manualVitals: { ...p.manualVitals, ...manual },
        vitals: manual.bp
          ? {
              ...p.vitals,
              bp: manual.bp,
              systolic: Number(manual.bp.split("/")[0]) || p.vitals.systolic,
              diastolic:
                Number(manual.bp.split("/")[1]) || p.vitals.diastolic,
              temperature: manual.temperature ?? p.vitals.temperature,
              timestamp: now,
            }
          : {
              ...p.vitals,
              temperature: manual.temperature ?? p.vitals.temperature,
              timestamp: now,
            },
      };
      const summary = [
        manual.bp && `BP ${manual.bp}`,
        manual.glucose && `Glucose ${manual.glucose} mg/dL`,
        manual.temperature && `Temp ${manual.temperature}°C`,
      ]
        .filter(Boolean)
        .join(" · ");
      const log: CaregiverLogEntry = {
        id: `log-v-${Date.now()}`,
        patientId: p.id,
        type: "vitals",
        source: "caregiver",
        summary: summary || "Caregiver vitals logged",
        detail: note,
        createdAt: now,
      };
      return {
        activePatient,
        caregiverLogs: [log, ...s.caregiverLogs].slice(0, 100),
        timeline: [
          {
            id: log.id,
            patientId: p.id,
            kind: "caregiver" as const,
            title: log.summary,
            detail: note ?? "",
            createdAt: now,
          },
          ...s.timeline,
        ].slice(0, 80),
      };
    });
  },

  addCaregiverNote: (note) => {
    const now = new Date().toISOString();
    const p = get().activePatient;
    if (!p) return;
    const log: CaregiverLogEntry = {
      id: `log-n-${Date.now()}`,
      patientId: p.id,
      type: "note",
      source: "caregiver",
      summary: "Caregiver observation",
      detail: note,
      createdAt: now,
    };
    set((s) => ({
      caregiverLogs: [log, ...s.caregiverLogs].slice(0, 100),
      timeline: [
        {
          id: log.id,
          patientId: p.id,
          kind: "caregiver" as const,
          title: log.summary,
          detail: note,
          createdAt: now,
        },
        ...s.timeline,
      ].slice(0, 80),
    }));
  },

  pushTimeline: (entry) =>
    set((s) => ({
      timeline: [
        { ...entry, id: `tl-${Date.now()}` },
        ...s.timeline,
      ].slice(0, 80),
    })),

  checkMedicationMissed: () => {
    const now = Date.now();
    set((s) => {
      const p = s.activePatient;
      if (!p || s.medications.length === 0) return s;
      let changed = false;
      const medications = s.medications.map((m) => {
        const due = new Date(m.nextDueAt).getTime();
        if (!m.lastAdministeredAt && due < now - 30 * 60 * 1000) {
          changed = true;
          return { ...m, missed: true };
        }
        if (
          m.lastAdministeredAt &&
          due < now - 15 * 60 * 1000 &&
          new Date(m.lastAdministeredAt).getTime() < due - 15 * 60 * 1000
        ) {
          changed = true;
          return { ...m, missed: true };
        }
        return m;
      });
      if (!changed) return s;
      const missed = medications.filter((m) => m.missed);
      const newAlerts = missed
        .filter(
          (m) =>
            !s.alerts.some(
              (a) =>
                a.message.includes(m.name) &&
                Date.now() - new Date(a.createdAt).getTime() < 3600000
            )
        )
        .map((m) => ({
          id: `med-alert-${m.id}-${Date.now()}`,
          patientId: m.patientId,
          patientCode: p?.patientCode ?? "",
          patientName: p?.name ?? "Patient",
          severity: "warning" as const,
          message: `Missed dose: ${m.name} — correlate with vitals trend`,
          vitals: p.vitals,
          createdAt: new Date().toISOString(),
          acknowledged: false,
        }));
      return {
        medications,
        alerts: [...newAlerts, ...s.alerts].slice(0, 50),
      };
    });
  },

  addFamilyPatient: (patient) =>
    set((s) => ({
      familyPatients: [...s.familyPatients, patient],
    })),

  removeFamilyPatient: (id) =>
    set((s) => ({
      familyPatients: s.familyPatients.filter((p) => p.id !== id),
    })),

  addDoctorNote: (body, authorName) => {
    const p = get().activePatient;
    if (!p || !body.trim()) return;
    const author = authorName ?? getUser()?.fullName;
    if (!author) return;
    const note: DoctorNote = {
      id: `dn-${Date.now()}`,
      patientId: p.id,
      authorName: author,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      doctorNotes: [note, ...s.doctorNotes].slice(0, 20),
      timeline: [
        {
          id: note.id,
          patientId: p.id,
          kind: "caregiver" as const,
          title: "Doctor update",
          detail: body.trim().slice(0, 120),
          createdAt: note.createdAt,
        },
        ...s.timeline,
      ].slice(0, 80),
    }));
  },
}));
