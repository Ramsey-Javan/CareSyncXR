import { generatePatientCode } from "../patientCode";
import type { GeoLocation, Patient, VitalsSnapshot } from "../types";

export const MOCK_HOSPITALS = [
  { id: "h1", name: "Nairobi Central Trauma", distanceKm: 4.2, etaMinutes: 12 },
  { id: "h2", name: "Aga Khan Emergency", distanceKm: 6.8, etaMinutes: 18 },
  { id: "h3", name: "Mombasa Coast Medical", distanceKm: 3.1, etaMinutes: 9 },
];

const HOME_LOCATION: GeoLocation = {
  lat: -1.2674,
  lng: 36.812,
  label: "Westlands, Nairobi (home)",
};

function baseVitals(overrides: Partial<VitalsSnapshot> = {}): VitalsSnapshot {
  return {
    heartRate: 82,
    oxygen: 97,
    systolic: 120,
    diastolic: 80,
    bp: "120/80",
    temperature: 36.8,
    respiratoryRate: 16,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/** Single primary patient — CareSync default care journey */
export function createSeedPatient(): Patient {
  const vitals = baseVitals({ heartRate: 88, oxygen: 96 });
  const status =
    vitals.oxygen < 85 || vitals.heartRate > 130
      ? "critical"
      : vitals.oxygen < 92 || vitals.heartRate > 110
        ? "warning"
        : "stable";

  return {
    id: "p1",
    name: "John Mwangi",
    room: "Home — Westlands",
    vitals,
    caregiverName: "Anne Njeri",
    nextOfKin: "James Mwangi (son)",
    manualVitals: { glucose: 118, bp: "118/76", temperature: 36.6 },
    wearableId: "wear-p1",
    patientCode: generatePatientCode(),
    codeRotatesAt: Date.now() + 15 * 60 * 1000,
    status,
    history: [{ id: "p1-0", ...vitals }],
    location: HOME_LOCATION,
  };
}
