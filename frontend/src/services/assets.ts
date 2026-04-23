import { apiFetch } from "../lib/apiClient";
import { readApiErrorMessage } from "../lib/apiError";
import type { AssetCreateBody, AssetRead } from "../types/asset";

export async function listAssets(params?: {
  symbol?: string;
  asset_type?: string;
}): Promise<AssetRead[]> {
  const search = new URLSearchParams();
  if (params?.symbol) search.set("symbol", params.symbol);
  if (params?.asset_type) search.set("asset_type", params.asset_type);
  const q = search.toString();
  const path = q ? `/assets/?${q}` : "/assets/";
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as AssetRead[];
}

export async function createAsset(body: AssetCreateBody): Promise<AssetRead> {
  const response = await apiFetch("/assets/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }
  return (await response.json()) as AssetRead;
}
