export interface Plan {
  id: string;
  name: string;
  duration_months: number;
  price_iqd: number;
  official_price_iqd?: number;
  product_id: string;
}
