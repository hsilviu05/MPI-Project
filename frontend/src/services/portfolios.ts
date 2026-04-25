import { apiFetch } from "../lib/apiClient";
import { readApiErrorMessage } from "../lib/apiError";
import type {
  PortfolioCreateBody,
  PortfolioRefreshResponse,
  PortfolioRead,
  PortfolioUpdateBody,
  PortfolioValuationRead,
} from "../types/portfolio";

export async function listPortfolios(): Promise<PortfolioRead[]> {
  const response = await apiFetch("/portfolios/");
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as PortfolioRead[];
}

export async function createPortfolio(body: PortfolioCreateBody): Promise<PortfolioRead> {
  const response = await apiFetch("/portfolios/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as PortfolioRead;
}

export async function updatePortfolio(
  id: number,
  body: PortfolioUpdateBody,
): Promise<PortfolioRead> {
  const response = await apiFetch(`/portfolios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as PortfolioRead;
}

export async function deletePortfolio(id: number): Promise<PortfolioRead> {
  const response = await apiFetch(`/portfolios/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as PortfolioRead;
}

export async function getPortfolioValuation(portfolioId: number): Promise<PortfolioValuationRead> {
  const response = await apiFetch(`/portfolios/${portfolioId}/valuation`);
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as PortfolioValuationRead;
}

export async function refreshPortfolioPrices(portfolioId: number): Promise<PortfolioRefreshResponse> {
  const response = await apiFetch(`/portfolios/${portfolioId}/refresh-prices`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as PortfolioRefreshResponse;
}
