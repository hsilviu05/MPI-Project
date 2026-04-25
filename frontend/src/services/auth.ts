import { getApiBaseUrl } from "../lib/apiBase";
import { readApiErrorMessage } from "../lib/apiError";
import type { LoginPayload, RegisterPayload } from "../types/auth";
import type { TokenResponse } from "../types/token";

export async function submitLogin(payload: LoginPayload): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", payload.email);
  body.set("password", payload.password);

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }

  return (await response.json()) as TokenResponse;
}

export async function submitRegister(payload: RegisterPayload): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName.trim() || null,
    }),
  });

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
}
