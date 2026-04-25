import { getAccessToken } from "./authToken";
import { getApiBaseUrl } from "./apiBase";

export type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers,
  });
}
