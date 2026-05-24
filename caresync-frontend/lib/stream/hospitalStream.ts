import { apiTriggerSOS, getWebSocketUrl } from "@/lib/api";
import { DEFAULT_SOS_TIMELINE } from "@/lib/mock/careSeed";
import { useHospitalStore } from "@/stores/hospitalStore";
import type { SOSEvent, SOSTimelineStep } from "@/lib/types";

const VITALS_INTERVAL_MS = 2500;
const CODE_ROTATE_MS = 60_000;
const SOS_COOLDOWN_MS = 45_000;

let vitalsTimer: ReturnType<typeof setInterval> | null = null;
let rotateTimer: ReturnType<typeof setInterval> | null = null;
let ws: WebSocket | null = null;
let lastSosAt = 0;

export type StreamMode = "simulated" | "websocket";

export function startHospitalStream(mode: StreamMode = "simulated") {
  stopHospitalStream();
  const store = useHospitalStore.getState();
  if (!store.activePatient) store.initialize();
  store.setStreamConnected(true);

  if (mode === "websocket") {
    connectWebSocket();
    return;
  }

  vitalsTimer = setInterval(() => {
    useHospitalStore.getState().tickVitals();
    maybeTriggerWearableSOS();
  }, VITALS_INTERVAL_MS);

  rotateTimer = setInterval(() => {
    useHospitalStore.getState().rotatePatientCodes();
  }, CODE_ROTATE_MS);
}

export function stopHospitalStream() {
  if (vitalsTimer) clearInterval(vitalsTimer);
  if (rotateTimer) clearInterval(rotateTimer);
  vitalsTimer = null;
  rotateTimer = null;
  if (ws) {
    ws.close();
    ws = null;
  }
  useHospitalStore.getState().setStreamConnected(false);
}

function connectWebSocket() {
  try {
    ws = new WebSocket(getWebSocketUrl());
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string);
        if (msg.type === "vitals_batch") {
          useHospitalStore.getState().tickVitals();
        }
      } catch {
        /* ignore malformed */
      }
    };
    ws.onerror = () => startHospitalStream("simulated");
    ws.onclose = () => useHospitalStore.getState().setStreamConnected(false);
  } catch {
    startHospitalStream("simulated");
  }
}

function advanceSosTimeline(sosId: string, steps: SOSTimelineStep[]) {
  useHospitalStore.getState().updateSosEvent(sosId, { timeline: steps });
}

async function maybeTriggerWearableSOS() {
  const { activePatient, addSosEvent, updateSosRouting, updateSosEvent, pushAlert } =
    useHospitalStore.getState();
  const p = activePatient;
  if (!p || p.status !== "critical") return;
  if (Date.now() - lastSosAt < SOS_COOLDOWN_MS) return;
  lastSosAt = Date.now();

  const sosId = `sos-${Date.now()}-${p.id}`;
  const triggeredAt = new Date().toISOString();
  const event: SOSEvent = {
    id: sosId,
    patientId: p.id,
    patientCode: p.patientCode,
    patientName: p.name,
    vitals: p.vitals,
    location: p.location,
    triggeredAt,
    routing: null,
    routingStatus: "pending",
    triggerReason: "wearable",
    timeline: DEFAULT_SOS_TIMELINE.map((s, i) =>
      i < 2
        ? { ...s, status: "complete" as const, at: triggeredAt }
        : i === 2
          ? { ...s, status: "active" as const, at: triggeredAt }
          : s
    ),
    notifications: {
      caregiver: "pending",
      nextOfKin: "pending",
    },
  };

  addSosEvent(event);
  pushAlert({
    id: `sos-alert-${sosId}`,
    patientId: p.id,
    patientCode: p.patientCode,
    patientName: p.name,
    severity: "critical",
    message: "Wearable SOS triggered — emergency routing initiated",
    vitals: p.vitals,
    createdAt: new Date().toISOString(),
    acknowledged: false,
  });

  updateSosRouting(sosId, null, "routing");

  setTimeout(() => {
    updateSosEvent(sosId, {
      notifications: { caregiver: "sent", nextOfKin: "sent" },
      timeline: DEFAULT_SOS_TIMELINE.map((s, i) =>
        i <= 2
          ? { ...s, status: "complete" as const, at: new Date().toISOString() }
          : i === 3
            ? { ...s, status: "active" as const }
            : s
      ),
    });
  }, 1500);

  try {
    const routing = await apiTriggerSOS({
      patientCode: p.patientCode,
      patientId: p.id,
      vitals: p.vitals,
      location: p.location,
    });
    updateSosRouting(sosId, routing, "dispatched");
    useHospitalStore.getState().updateActivePatient({
      assignedHospital: routing.hospitalName,
    });

    advanceSosTimeline(
      sosId,
      DEFAULT_SOS_TIMELINE.map((s, i) => ({
        ...s,
        status: (i <= 3 ? "complete" : i === 4 ? "active" : "pending") as SOSTimelineStep["status"],
        at: i <= 3 ? new Date().toISOString() : undefined,
      }))
    );

    setTimeout(() => {
      updateSosRouting(sosId, { ...routing, status: "en_route" }, "dispatched");
      updateSosEvent(sosId, {
        notifications: { caregiver: "acknowledged", nextOfKin: "acknowledged" },
      });
    }, 4000);
    setTimeout(() => {
      updateSosRouting(
        sosId,
        { ...routing, status: "arrived", escalationLevel: 4 },
        "dispatched"
      );
      advanceSosTimeline(
        sosId,
        DEFAULT_SOS_TIMELINE.map((s) => ({
          ...s,
          status: "complete" as const,
          at: new Date().toISOString(),
        }))
      );
    }, 9000);
  } catch {
    updateSosRouting(sosId, null, "failed");
  }
}

/** Manual SOS for the active care journey patient only */
export function manualSOS() {
  const p = useHospitalStore.getState().activePatient;
  if (!p) return;
  lastSosAt = 0;
  useHospitalStore.getState().updateActivePatient({
    status: "critical",
    vitals: {
      ...p.vitals,
      heartRate: Math.max(p.vitals.heartRate, 132),
      oxygen: Math.min(p.vitals.oxygen, 82),
    },
  });
  useHospitalStore.getState().tickVitals();
  maybeTriggerWearableSOS();
}
