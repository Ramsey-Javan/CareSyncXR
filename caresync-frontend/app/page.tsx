import { redirect } from "next/navigation";

/** Landing: send users to login (dashboard requires auth via proxy). */
export default function HomePage() {
  redirect("/login");
}
