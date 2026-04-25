import { clearAccessToken, getAccessToken } from "./authToken";
import { getApiBaseUrl } from "./apiBase";
import { notifySessionExpired } from "./sessionExpiry";

export type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  let hadToken = false;

  if (auth) {
    const token = getAccessToken();
    if (token) {
      hadToken = true;
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers,
  });

  if (auth && hadToken && (response.status === 401 || response.status === 403)) {
    clearAccessToken();
    notifySessionExpired();
  }

  return response;
}
