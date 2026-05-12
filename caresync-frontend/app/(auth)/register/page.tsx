"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { registerSchema, type RegisterFormValues } from "@/lib/auth.schemas";
import { saveSession, getDashboardRoute } from "@/lib/auth.utils";
import { apiRegister } from "@/lib/api";

const ROLES = [
  { value: "doctor",    label: "Doctor" },
  { value: "caregiver", label: "Caregiver" },
  { value: "admin",     label: "Administrator" },
  { value: "patient",   label: "Patient" },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      const user = await apiRegister(data);
      saveSession(user);
      toast.success("Account created! Welcome to CareSync.");
      router.push(getDashboardRoute(user.role));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail ?? "Registration failed. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800">Create account</CardTitle>
        <CardDescription className="text-slate-500">
          Join CareSync to start monitoring patient health
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-slate-700">Full name</Label>
            <Input id="fullName" type="text" autoComplete="name" placeholder="Jane Doe"
              {...register("fullName")}
              className={errors.fullName ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-slate-700">I am a</Label>
            <Select onValueChange={(val) => setValue("role", val as RegisterFormValues["role"], { shouldValidate: true })}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700">Email address</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
              {...register("email")}
              className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters"
              {...register("password")}
              className={errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-slate-700">Confirm password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}