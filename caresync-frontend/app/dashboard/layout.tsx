import { CareSpaceLayout } from "@/components/care-space/CareSpaceLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CareSpaceLayout>{children}</CareSpaceLayout>;
}
