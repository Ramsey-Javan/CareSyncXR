import type { CareParticipant, DoctorNote, Patient } from "../types";

export function createCareParticipants(patient: Patient): CareParticipant[] {
  const doctorName = patient.doctorName?.trim() || "Personal physician (not linked)";
  const familyName =
    patient.nextOfKin?.split("(")[0]?.trim() ?? "Family contact (not linked)";

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
      name: patient.caregiverName ?? "Caregiver (not linked)",
      title: "Primary caregiver",
      online: true,
    },
    {
      id: "part-doctor",
      role: "doctor",
      name: doctorName,
      title: "Personal physician",
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

export function createSeedDoctorNotes(patient: Patient): DoctorNote[] {
  const now = Date.now();
  const author = patient.doctorName?.trim() || "Attending physician";
  return [
    {
      id: "dn-1",
      patientId: patient.id,
      authorName: author,
      body: "Continue current medication plan. Monitor afternoon walks — heart rate elevated slightly yesterday but within acceptable range.",
      createdAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: "dn-2",
      patientId: patient.id,
      authorName: author,
      body: "Please log glucose with breakfast. I'll review trends during our video check-in Thursday.",
      createdAt: new Date(now - 172800000).toISOString(),
    },
  ];
}
