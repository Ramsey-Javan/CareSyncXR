import Link from "next/link";
import { Shield } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Request Access — CareSync",
  description: "Account creation is managed by your CareSync administrator",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Request access"
      subtitle="CareSync accounts are provisioned by your healthcare organization"
    >
      <Card className="border-[#E2E8F0] shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF]">
            <Shield className="h-5 w-5 text-[#2563EB]" />
          </div>
          <CardTitle className="text-lg text-[#0F172A]">
            Administrator-managed accounts
          </CardTitle>
          <CardDescription className="text-[#64748B]">
            Account creation is managed by your CareSync administrator. Please
            contact your healthcare provider or system administrator for access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pb-0">
          <p className="text-sm leading-relaxed text-[#64748B]">
            If you already have credentials, sign in to access your CareSync
            workspace.
          </p>
          <Button
            asChild
            className="h-11 w-full rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
