"use client";

import { create } from "zustand";
import { REMEMBER_EMAIL_KEY } from "@/lib/constants/auth";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  persistTokens,
} from "@/lib/auth/session";
import * as authService from "@/lib/services/auth";
import type { LoginRequest } from "@/lib/types/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
  login: (data: LoginRequest, rememberEmail?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  error: null,

  initializeAuth: () => {
    if (typeof window === "undefined") return;

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
      persistTokens(accessToken, refreshToken);
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        initialized: true,
      });
      return;
    }

    clearSession();
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      initialized: true,
    });
  },

  login: async (data, rememberEmail = false) => {
    set({ isLoading: true, error: null });

    try {
      const tokens = await authService.login(data);
      persistTokens(tokens.access_token, tokens.refresh_token);

      if (rememberEmail) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Invalid email or password");
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    const refreshToken = get().refreshToken ?? getRefreshToken();

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Always clear local session even if the server call fails
    } finally {
      clearSession();
      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: { detail?: unknown } } })
      .response?.data?.detail;

    if (typeof data === "string") return data;

    if (Array.isArray(data) && data.length > 0) {
      const first = data[0] as { msg?: string };
      if (first?.msg) return first.msg;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
