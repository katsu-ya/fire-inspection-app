// APIレスポンス型定義（一元管理）

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type CategoryResponse = {
  id: number;
  name: string;
  created_at: string;
};

export type ProductResponse = {
  id: number;
  name: string;
  sku: string;
  category_id: number | null;
  category: CategoryResponse | null;
  unit_price: string;
  current_stock: number;
  min_stock_alert: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type ProductCreate = {
  name: string;
  sku: string;
  category_id?: number | null;
  unit_price: number;
  current_stock?: number;
  min_stock_alert?: number;
};

export type ProductUpdate = {
  name?: string;
  sku?: string;
  category_id?: number | null;
  unit_price?: number;
  min_stock_alert?: number;
  is_active?: boolean;
};

export type ProductListResponse = {
  items: ProductResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type InventoryTransactionResponse = {
  id: number;
  product_id: number;
  type: string;
  quantity: number;
  note: string | null;
  created_by: number;
  created_at: string;
  user: UserResponse | null;
};

export type InventoryHistoryResponse = {
  items: InventoryTransactionResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type InventoryInRequest = {
  product_id: number;
  quantity: number;
  note?: string | null;
};

export type InventoryOutRequest = {
  product_id: number;
  quantity: number;
  note?: string | null;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
};

// アラート一覧はProductResponseと同形式を返す
export type AlertItem = ProductResponse;

export type DashboardSummary = {
  total_products: number;
  total_stock: number;
  alert_count: number;
  recent_transactions: number;
};

export type TrendDataPoint = {
  date: string;
  net_change: number;
};

export type CategoryStock = {
  category_id: number;
  category_name: string;
  stock: number;
};

export type DailyMovement = {
  date: string;
  in_quantity: number;
  out_quantity: number;
};

export type ReportSummaryItem = {
  product_id: number;
  product_name: string;
  sku: string;
  total_in: number;
  total_out: number;
  net_change: number;
};
