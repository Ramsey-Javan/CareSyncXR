import { apiTriggerSOS, getWebSocketUrl } from "@/lib/api";
import { useHospitalStore } from "@/stores/hospitalStore";
import type { SOSEvent, SOSTimelineStep } from "@/lib/types";

const SOS_COOLDOWN_MS = 45_000;

let ws: WebSocket | null = null;
let lastSosAt = 0;

export type StreamMode = "simulated" | "websocket";

export function startHospitalStream(mode: StreamMode = "websocket") {
  stopHospitalStream();
  const store = useHospitalStore.getState();
  if (!store.activePatient) store.initialize();
  if (mode === "websocket") {
    store.setStreamConnected(true);
    connectWebSocket();
    return;
  }
  store.setStreamConnected(false);
}

export function stopHospitalStream() {
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
    timeline: [],
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
      timeline: [],
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

    advanceSosTimeline(sosId, []);

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
      advanceSosTimeline(sosId, []);
    }, 9000);
  } catch {
    updateSosRouting(sosId, null, "failed");
  }
}

/** Manual SOS for the active care journey patient only */
export async function manualSOS() {
  const p = useHospitalStore.getState().activePatient;
  if (!p) return;
  const sosId = `manual-${Date.now()}-${p.id}`;
  const event: SOSEvent = {
    id: sosId,
    patientId: p.id,
    patientCode: p.patientCode,
    patientName: p.name,
    vitals: p.vitals,
    location: p.location,
    triggeredAt: new Date().toISOString(),
    routing: null,
    routingStatus: "pending",
    triggerReason: "manual",
    timeline: [],
    notifications: {
      caregiver: "pending",
      nextOfKin: "pending",
    },
  };
  useHospitalStore.getState().addSosEvent(event);
  try {
    const routing = await apiTriggerSOS({
      patientCode: p.patientCode,
      patientId: p.id,
      vitals: p.vitals,
      location: p.location,
    });
    useHospitalStore.getState().updateSosRouting(sosId, routing, "dispatched");
  } catch {
    useHospitalStore.getState().updateSosRouting(sosId, null, "failed");
  }
}
