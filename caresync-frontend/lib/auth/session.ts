import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_COOKIE_KEY,
} from "@/lib/constants/auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Persist tokens to localStorage and set access-token cookie for proxy.ts */
export function persistTokens(
  accessToken: string,
  refreshToken: string
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(accessToken)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Remove all client-side auth artifacts */
export function clearSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${TOKEN_COOKIE_KEY}=; path=/; max-age=0`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
