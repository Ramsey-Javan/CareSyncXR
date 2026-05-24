import type { UserRole } from "@/lib/auth.schemas";
import type { Patient, PatientStatus } from "@/lib/types";

/* ---------------------------
   SAFE STRING HELPER
---------------------------- */
function getFirstName(name?: string): string {
  const safe = (name ?? "").trim();
  if (!safe) return "User";
  return safe.split(" ")[0];
}

/* ---------------------------
   TIME GREETING
---------------------------- */
export function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ---------------------------
   ROLE WELCOME (FIXED)
---------------------------- */
export function getRoleWelcome(role: UserRole, name?: string): string {
  const first = getFirstName(name);
  const greet = getTimeGreeting();

  switch (role) {
    case "doctor":
      return `${greet}, Dr. ${first}`;
    case "caregiver":
      return `${greet}, ${first}`;
    case "patient":
      return `${greet}, ${first}`;
    case "family":
      return `${greet}, ${first}`;
    case "admin":
      return `${greet}, ${first}`;
    default:
      return `${greet}, ${first}`;
  }
}

/* ---------------------------
   PATIENT STATUS LINE (FIXED)
---------------------------- */
export function getPatientStatusLine(
  patient: Patient | null,
  status: PatientStatus
): string {
  if (!patient) return "Preparing your care space…";

  const first = getFirstName(patient?.name);

  switch (status) {
    case "stable":
      return `${first}'s vitals look stable today — everything appears calm.`;
    case "warning":
      return `${first} needs a little extra attention — we're monitoring closely.`;
    case "critical":
      return `Urgent: ${first}'s vitals need immediate review.`;
    default:
      return `Monitoring ${first}'s wellbeing in real time.`;
  }
}

/* ---------------------------
   STATUS CHIP (UNCHANGED LOGIC)
---------------------------- */
export function getCalmStatusChip(status: PatientStatus): {
  label: string;
  tone: "emerald" | "yellow" | "red";
} {
  switch (status) {
    case "stable":
      return { label: "Everything looks stable", tone: "emerald" };
    case "warning":
      return { label: "Elevated watch", tone: "yellow" };
    case "critical":
      return { label: "Emergency attention", tone: "red" };
  }
}

/* ---------------------------
   ROLE CONTEXT
---------------------------- */
export function getRoleContextSubtitle(role: UserRole): string {
  switch (role) {
    case "doctor":
      return "Your patient's live care environment";
    case "caregiver":
      return "Daily care coordination for your loved one";
    case "patient":
      return "Your personal health and safety space";
    case "family":
      return "Stay close to your loved one's care journey";
    case "admin":
      return "System-wide monitoring dashboard";
    default:
      return "Patient-centered remote care";
  }
}

/* ---------------------------
   AI SUPPORT LINE
---------------------------- */
export function getAiSupportLine(role: UserRole, adherence?: number): string {
  if (adherence != null && adherence >= 90) {
    return "Medication adherence improved this week.";
  }

  switch (role) {
    case "caregiver":
      return "Caregiver updates are flowing into the timeline.";
    case "doctor":
      return "AI summaries are ready when you review vitals.";
    case "patient":
      return "Your wearable is connected and streaming calmly.";
    case "family":
      return "You'll be notified when vitals or medications need attention.";
    case "admin":
      return "System health is stable across all units.";
    default:
      return "AI monitoring is active in the background.";
  }
}