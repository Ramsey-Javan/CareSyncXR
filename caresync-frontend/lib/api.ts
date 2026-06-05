import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { ACCESS_TOKEN_KEY } from "@/lib/constants/auth";
import {
  clearSession,
  getRefreshToken,
  persistTokens,
} from "@/lib/auth/session";
import { refreshTokens } from "@/lib/auth/token-refresh";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Shared Axios instance for CareSync API requests.
 * Reads base URL from NEXT_PUBLIC_API_URL.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** Attach access token from localStorage on every client request. */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const storedRefresh = getRefreshToken();
  if (!storedRefresh) return null;

  if (!refreshPromise) {
    refreshPromise = refreshTokens(storedRefresh)
      .then((tokens) => {
        persistTokens(tokens.access_token, tokens.refresh_token);
        return tokens.access_token;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/** Handle 401 globally — attempt refresh, then redirect to login. */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      const url = originalRequest.url ?? "";
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/refresh");

      if (!isAuthEndpoint) {
        originalRequest._retry = true;
        const newToken = await tryRefreshToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

      clearSession();

      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
