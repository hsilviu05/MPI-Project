export type PortfolioRead = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioCreateBody = {
  name: string;
  description?: string | null;
};

export type PortfolioUpdateBody = {
  name?: string;
  description?: string | null;
};

export type ValuationAsset = {
  asset_id: number;
  symbol: string | null;
  name: string | null;
  quantity: string | number;
  price: string | number | null;
  value: string | number | null;
  missing_price: boolean;
};

export type PortfolioValuationRead = {
  portfolio_id: number;
  total_value: string | number;
  assets: ValuationAsset[];
};
