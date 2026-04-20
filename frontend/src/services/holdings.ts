import { apiFetch } from "../lib/apiClient";
import { readApiErrorMessage } from "../lib/apiError";
import type { HoldingCreateBody, HoldingRead, HoldingUpdateBody } from "../types/holding";

export async function listHoldings(portfolioId: number): Promise<HoldingRead[]> {
  const response = await apiFetch(`/portfolios/${portfolioId}/holdings/`);
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as HoldingRead[];
}

export async function createHolding(
  portfolioId: number,
  body: HoldingCreateBody,
): Promise<HoldingRead> {
  const response = await apiFetch(`/portfolios/${portfolioId}/holdings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as HoldingRead;
}

export async function updateHolding(
  portfolioId: number,
  holdingId: number,
  body: HoldingUpdateBody,
): Promise<HoldingRead> {
  const response = await apiFetch(`/portfolios/${portfolioId}/holdings/${holdingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as HoldingRead;
}

export async function deleteHolding(portfolioId: number, holdingId: number): Promise<HoldingRead> {
  const response = await apiFetch(`/portfolios/${portfolioId}/holdings/${holdingId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as HoldingRead;
}
