export type AssetRead = {
  id: number;
  symbol: string;
  name: string | null;
  asset_type: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
};

export type AssetCreateBody = {
  symbol: string;
  name?: string | null;
  asset_type?: string | null;
  currency?: string | null;
};
