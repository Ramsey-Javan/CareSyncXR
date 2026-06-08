import axios from "axios";
import type { RefreshRequest, TokenResponse } from "@/lib/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * POST /auth/refresh
 * Standalone axios call — avoids interceptor loops in lib/api.ts.
 */
export async function refreshTokens(
  refreshToken: string
): Promise<TokenResponse> {
  const payload: RefreshRequest = { refresh_token: refreshToken };
  const response = await axios.post<TokenResponse>(
    `${API_BASE_URL}/auth/refresh`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    }
  );
  return response.data;
}
