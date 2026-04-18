import type { HealthResponse } from "../types/health";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Healthcheck failed with status ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}
