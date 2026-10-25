export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  position: number;
  active: boolean;
  product_count: number;
  children: Category[];
}

export interface CategoryRef {
  id: number;
  name: string;
  slug: string;
  parent: CategoryRef | null;
}

export interface ProductCard {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  compare_at_price: number | null;
  is_promo: boolean;
  is_new: boolean;
  stock: number;
  image: string | null;
  hover_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  sizes: string[];
}

export interface Variant {
  id: number;
  label: string;
  sku: string | null;
  stock: number;
  active: boolean;
}

export interface ProductDetail extends ProductCard {
  description: string | null;
  details: string[];
  sku: string | null;
  currency: string;
  active: boolean;
  featured: boolean;
  category: CategoryRef | null;
  variants: Variant[];
  images: { id: number; url: string; alt: string | null }[];
  created_at: string;
}

export interface ShippingRate {
  id: number;
  zone: string;
  name: string;
  price: number;
  free_from: number | null;
  days_min: number | null;
  days_max: number | null;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_slug: string | null;
  product_name: string;
  brand: string | null;
  variant_label: string | null;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface HistoryStep {
  status: string;
  from_status?: string | null;
  note: string | null;
  actor?: string | null;
  internal?: boolean;
  at: string;
}

export interface TrackedOrder {
  number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string;
  first_name: string;
  city: string;
  shipping_rate_name: string | null;
  items: OrderItem[];
  history: HistoryStep[];
  created_at: string;
}

export interface OrderCreated {
  number: string;
  phone: string;
  total: number;
  status: string;
}

// ── Administration ─────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  role: 'ADMIN' | 'GESTIONNAIRE';
  active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface OrderRow {
  id: number;
  number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  customer_name: string;
  customer_phone: string;
  city: string;
  item_count: number;
  created_at: string;
}

export interface AdminOrder {
  id: number;
  number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  currency: string;
  customer: { id: number | null; first_name: string; last_name: string; phone: string; email: string | null };
  shipping: { country: string; city: string; neighborhood: string | null; address: string; instructions: string | null; rate_name: string | null };
  customer_note: string | null;
  items: OrderItem[];
  history: HistoryStep[];
  payments: { id: number; method: string; amount: number; amount_received: number; status: string; reference: string | null; created_at: string }[];
  next_statuses: string[];
  created_at: string;
  delivered_at: string | null;
}

export interface ProductAdminRow {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  image: string | null;
  category_name: string | null;
  variant_count: number;
  created_at: string;
}

export interface Dashboard {
  orders_today: number;
  revenue_today: number;
  orders_pending: number;
  orders_in_progress: number;
  orders_delivered: number;
  revenue_month: number;
  average_basket: number;
  products_out_of_stock: number;
  low_stock: { product_id: number; name: string; label: string; stock: number }[];
  recent_orders: OrderRow[];
}

export interface Sales {
  daily: { date: string; orders: number; revenue: number }[];
  top_products: { name: string; quantity: number; revenue: number }[];
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  period_revenue: number;
  period_orders: number;
}
