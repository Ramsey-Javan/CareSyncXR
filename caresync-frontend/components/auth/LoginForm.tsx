"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REMEMBER_EMAIL_KEY } from "@/lib/constants/auth";
import { loginSchema, type LoginFormValues } from "@/lib/auth/schemas";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberMe(true);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  async function onSubmit(values: LoginFormValues) {
    clearError();

    try {
      await login(
        { email: values.email, password: values.password },
        rememberMe
      );

      const destination = searchParams.get("callbackUrl") ?? "/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      // Error surfaced via Zustand store
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <Alert variant="destructive" className="border-[#EF4444]/30 bg-red-50">
          <AlertCircle className="h-4 w-4 text-[#EF4444]" />
          <AlertTitle className="text-[#EF4444]">Sign in failed</AlertTitle>
          <AlertDescription className="text-[#EF4444]/90">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#0F172A]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@hospital.org"
          aria-invalid={!!errors.email}
          className="h-11 rounded-lg border-[#E2E8F0]"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-[#EF4444]" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#0F172A]">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          className="h-11 rounded-lg border-[#E2E8F0]"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-[#EF4444]" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => {
            const value = checked === true;
            setRememberMe(value);
            setValue("rememberMe", value);
          }}
        />
        <Label
          htmlFor="rememberMe"
          className="cursor-pointer text-sm font-normal text-[#64748B]"
        >
          Remember me
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-[#64748B]">
        Need an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#2563EB] hover:underline"
        >
          Contact your administrator
        </Link>
      </p>
    </form>
  );
}
