import { getApiBaseUrl } from "../lib/apiBase";
import type { HealthResponse } from "../types/health";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/health`);
  if (!response.ok) {
    throw new Error(`Healthcheck failed with status ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}
