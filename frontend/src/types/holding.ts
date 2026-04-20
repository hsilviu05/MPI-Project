export type HoldingRead = {
  id: number;
  portfolio_id: number;
  asset_id: number;
  quantity: string | number;
  avg_cost: string | number | null;
  created_at: string;
  updated_at: string;
};

export type HoldingCreateBody = {
  portfolio_id: number;
  asset_id: number;
  quantity: string;
  avg_cost?: string | null;
};

export type HoldingUpdateBody = {
  quantity?: string;
  avg_cost?: string | null;
};
