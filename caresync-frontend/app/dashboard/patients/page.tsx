import { redirect } from "next/navigation";

/** Legacy route — fleet management replaced by single care profile */
export default function PatientsRedirectPage() {
  redirect("/dashboard/care-profile");
}
