export type PatientStatus = "stable" | "warning" | "critical";

export type VitalsSnapshot = {
  heartRate: number;
  oxygen: number;
  bp: string;
  systolic: number;
  diastolic: number;
  temperature: number;
  respiratoryRate: number;
  timestamp: string;
};

export type VitalsHistoryPoint = VitalsSnapshot & { id: string };

export type GeoLocation = {
  lat: number;
  lng: number;
  label: string;
};

export type HospitalRouting = {
  hospitalId: string;
  hospitalName: string;
  distanceKm: number;
  etaMinutes: number;
  status: "dispatching" | "en_route" | "arrived" | "standby";
  nextOfKinNotified: boolean;
  escalationLevel: number;
};

export type ManualVitals = {
  glucose?: number;
  bp?: string;
  temperature?: number;
  symptoms?: string;
};

export type MedicationDose = {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  schedule: string[];
  lastAdministeredAt?: string;
  nextDueAt: string;
  missed: boolean;
  adherencePercent: number;
};

export type CaregiverLogEntry = {
  id: string;
  patientId: string;
  type: "vitals" | "symptom" | "note" | "medication" | "observation";
  source: "caregiver" | "wearable";
  summary: string;
  detail?: string;
  createdAt: string;
};

export type CareTimelineEntry = {
  id: string;
  patientId: string;
  kind: "wearable" | "caregiver" | "medication" | "alert" | "ai" | "sos";
  title: string;
  detail: string;
  createdAt: string;
};

export type SOSNotificationStatus = {
  caregiver: "pending" | "sent" | "acknowledged";
  nextOfKin: "pending" | "sent" | "acknowledged";
};

export type SOSTimelineStep = {
  id: string;
  label: string;
  status: "complete" | "active" | "pending";
  at?: string;
};

export type Patient = {
  id: string;
  name: string;
  room: string;
  wearableId: string;
  patientCode: string;
  codeRotatesAt: number;
  status: PatientStatus;
  vitals: VitalsSnapshot;
  manualVitals?: ManualVitals;
  history: VitalsHistoryPoint[];
  location: GeoLocation;
  assignedHospital?: string;
  caregiverName?: string;
  doctorName?: string;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
  careUnitName?: string;
};

export type WearableDevice = {
  id: string;
  patientId: string;
  patientCode: string;
  model: string;
  battery: number;
  signalStrength: number;
  lastSync: string;
  streaming: boolean;
};

export type AlertItem = {
  id: string;
  patientId: string;
  patientCode: string;
  patientName: string;
  severity: PatientStatus;
  message: string;
  vitals: VitalsSnapshot;
  createdAt: string;
  acknowledged: boolean;
};

export type SOSEvent = {
  id: string;
  patientId: string;
  patientCode: string;
  patientName?: string;
  vitals: VitalsSnapshot;
  location: GeoLocation;
  triggeredAt: string;
  routing: HospitalRouting | null;
  routingStatus: "pending" | "routing" | "dispatched" | "failed";
  notifications?: SOSNotificationStatus;
  timeline?: SOSTimelineStep[];
  triggerReason?: "wearable" | "fall" | "manual" | "vitals";
};

export type AIInsight = {
  id: string;
  patientId: string;
  patientName: string;
  summary: string;
  riskLevel: PatientStatus;
  flags: string[];
  generatedAt: string;
};

export type Consultation = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string;
  status: "scheduled" | "active" | "completed";
  roomUrl?: string;
};

export type EmergencyState = {
  active: boolean;
  activeSosId: string | null;
  globalAlertLevel: PatientStatus;
  lastUpdated: string;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "doctor" | "caregiver" | "admin" | "patient" | "family";
  token: string;
};

export type CareParticipant = {
  id: string;
  role: "doctor" | "caregiver" | "family" | "patient";
  name: string;
  title?: string;
  online?: boolean;
};

export type DoctorNote = {
  id: string;
  patientId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  role: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: string;
};

export type SOSPayload = {
  patientCode: string;
  patientId: string;
  vitals: VitalsSnapshot;
  location: GeoLocation;
};

export type CreatePatientPayload = {
  name: string;
  room: string;
};

export type ScheduleConsultationPayload = {
  patientId: string;
  scheduledAt: string;
};

export type AIAnalyzePayload = {
  patientId: string;
  vitalsHistory: VitalsHistoryPoint[];
};
