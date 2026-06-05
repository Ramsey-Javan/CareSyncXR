import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in — CareSync",
  description: "Sign in to your CareSync healthcare workspace",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your hospital, agency, or care team workspace"
    >
      <Suspense
        fallback={
          <div
            className="h-48 animate-pulse rounded-lg bg-[#F8FAFC]"
            aria-label="Loading sign in form"
          />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
