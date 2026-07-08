import api from "@/lib/api";
import { refreshTokens } from "@/lib/auth/token-refresh";
import type {
  LoginRequest,
  LogoutRequest,
  TokenResponse,
} from "@/lib/types/auth";

/**
 * POST /auth/login
 * Returns JWT access and refresh tokens.
 */
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/login", data);
  return response.data;
}

/**
 * POST /auth/logout
 * Invalidates the refresh token on the server.
 */
export async function logout(refreshToken: string): Promise<void> {
  const payload: LogoutRequest = { refresh_token: refreshToken };
  await api.post("/auth/logout", payload);
}

/**
 * POST /auth/refresh
 */
export async function refresh(refreshToken: string): Promise<TokenResponse> {
  return refreshTokens(refreshToken);
}
