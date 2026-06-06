"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Heart, Activity, Shield, Video, Bell } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { registerSchema, type RegisterFormValues } from "@/lib/auth.schemas";
import {
  saveSession,
  getDashboardRoute,
  normalizeUser,
} from "@/lib/auth.utils";
import { apiRegister } from "@/lib/api";
import {
  buildCareProfileFromForm,
  clearPendingUser,
  saveCareProfile,
  savePendingUser,
} from "@/lib/careProfile";
import {
  CareSetupForm,
  type CareSetupFormValues,
} from "@/components/care-space/CareSetupForm";
import type { AuthUser } from "@/lib/types";
import { useHospitalStore } from "@/stores/hospitalStore";

const ROLES = [
  { value: "doctor", label: "Doctor", icon: "🩺" },
  { value: "caregiver", label: "Caregiver", icon: "🤝" },
  { value: "patient", label: "Patient", icon: "🏥" },
  { value: "family", label: "Family / Next of kin", icon: "👨‍👩‍👧" },
] as const;

const FEATURES = [
  { icon: Heart, label: "AI Health Insights", color: "#F87171" },
  { icon: Activity, label: "Real-Time Monitoring", color: "#34D399" },
  { icon: Shield, label: "Secure Medical Records", color: "#60A5FA" },
  { icon: Video, label: "Video Consultations", color: "#A78BFA" },
  { icon: Bell, label: "Smart Caregiver Alerts", color: "#FBBF24" },
];

const NEEDS_CARE_SETUP = new Set(["patient", "caregiver", "family"]);

export default function RegisterPage() {
  const router = useRouter();
  const applyCareProfile = useHospitalStore((s) => s.applyCareProfile);

  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<AuthUser | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const fullName = watch("fullName");
  const selectedRole = watch("role");

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      const user = normalizeUser(await apiRegister({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      }));

      if (data.role === "doctor" || data.role === "admin") {
        saveSession(user);
        clearPendingUser();
        toast.success("Account created successfully");
        router.push(getDashboardRoute(user.role));
        return;
      }

      if (NEEDS_CARE_SETUP.has(data.role)) {
        savePendingUser(user);
        setRegisteredUser(user);
        setStep(2);
        return;
      }

      saveSession(user);
      router.push(getDashboardRoute(user.role));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.detail ?? "Registration failed. Please try again."
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function submitCareSetup(form: CareSetupFormValues) {
    if (!registeredUser) {
      toast.error("Session expired — please register again.");
      setStep(1);
      return;
    }

    setIsLoading(true);

    try {
      const profile = buildCareProfileFromForm(registeredUser, {
        careUnitName: form.careUnitName,
        setupBy: form.setupBy,
        patientName:
          form.patientName ||
          (form.setupBy === "patient" ? registeredUser.fullName : ""),
        patientLocation: form.patientLocation,
        caregiverName:
          form.caregiverName ||
          (form.setupBy === "caregiver" ? registeredUser.fullName : ""),
        caregiverEmail: form.caregiverEmail || undefined,
        doctorName: form.doctorName,
        doctorEmail: form.doctorEmail || undefined,
        nextOfKinName: form.nextOfKinName,
        nextOfKinRelationship: form.nextOfKinRelationship,
        nextOfKinPhone: form.nextOfKinPhone || undefined,
        nextOfKinEmail: form.nextOfKinEmail || undefined,
      });

      saveCareProfile(profile);

      const displayName =
        registeredUser.role === "patient"
          ? profile.patientName
          : registeredUser.role === "caregiver"
            ? profile.caregiverName
            : registeredUser.role === "family"
              ? profile.nextOfKinName
              : registeredUser.fullName;

      const sessionUser = { ...registeredUser, fullName: displayName };
      saveSession(sessionUser);
      clearPendingUser();
      applyCareProfile(profile);

      toast.success("Care circle set up — welcome to CareSync");
      router.push(getDashboardRoute(sessionUser.role));
    } catch {
      toast.error("Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  }

  const defaultPatientName =
    selectedRole === "patient" ? fullName ?? "" : "";
  const defaultCaregiverName =
    selectedRole === "caregiver" ? fullName ?? "" : "";

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-950 text-white">
        <div className="relative z-10">
          <Image
            src="/logo.jpeg"
            alt="CareSync"
            width={56}
            height={56}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-bold">Join CareSync</h1>
          <p className="text-slate-400">Healthcare without distance.</p>

          <div className="space-y-2 pt-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <f.icon size={16} style={{ color: f.color }} />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">© CareSync</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div
          className={`w-full bg-white p-8 rounded-2xl shadow ${
            step === 2 ? "max-w-lg" : "max-w-sm"
          }`}
        >
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Create account
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Start your CareSync journey
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-slate-800">Full name</Label>
                  <Input {...register("fullName")} className="mt-1" />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-800">Role</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue("role", v as RegisterFormValues["role"], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 w-full border rounded-xl h-11 text-slate-900">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="w-[--radix-select-trigger-width]">
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.icon} {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-800">Email</Label>
                  <Input
                    type="email"
                    {...register("email")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-slate-800">Password</Label>
                  <Input
                    type="password"
                    {...register("password")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-slate-800">Confirm password</Label>
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    className="mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {isLoading ? "Creating…" : "Continue"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-cyan-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}

          {step === 2 && registeredUser && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Set up your care circle
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Link the patient, caregiver, doctor, and next of kin. If the
                patient is not tech-savvy, choose &quot;I am the caregiver&quot;
                to complete this on their behalf.
              </p>

              <CareSetupForm
                defaultPatientName={defaultPatientName}
                defaultCaregiverName={defaultCaregiverName}
                onSubmit={submitCareSetup}
                loading={isLoading}
              />

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-4 text-sm text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
