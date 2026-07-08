"use client";

import { useAuthStore } from "@/stores/auth-store";

/**
 * Convenience hook for authentication state and actions.
 */
export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialized = useAuthStore((state) => state.initialized);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    accessToken,
    user,
    isAuthenticated,
    isLoading,
    initialized,
    error,
    login,
    logout,
    initializeAuth,
    clearError,
  };
}
