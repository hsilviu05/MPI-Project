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
