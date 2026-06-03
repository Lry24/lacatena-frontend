// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterData {
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  new_password: string;
}

// ─── User / Address ───────────────────────────────────────────────────────────

export interface AddressResponse {
  uuid: string;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface AddressCreate {
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface UserResponse {
  uuid: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  addresses: AddressResponse[];
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  uuid: string;
  name: string;
  slug: string;
  image_url?: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface VariantResponse {
  uuid: string;
  sku: string;
  size: string;
  color: string;
  extra_price: number;
  stock: number;
  is_active: boolean;
}

export interface ProductImageResponse {
  uuid: string;
  url: string;
  alt?: string;
  is_primary: boolean;
}

export interface ProductResponse {
  uuid: string;
  name: string;
  slug: string;
  reference: string;
  price_ttc: number;
  is_promo: boolean;
  promo_price?: number;
  is_new: boolean;
  is_featured: boolean;
  gender: string;
  brand: string;
  tags: string[];
  primary_image_url?: string;
}

export interface ProductDetailResponse extends ProductResponse {
  images: ProductImageResponse[];
  variants: VariantResponse[];
  category?: CategoryResponse;
  description?: string;
}

export interface ProductsParams {
  page?: number;
  size?: number;
  category_slug?: string;
  gender?: string;
  is_new?: boolean;
  is_promo?: boolean;
  is_featured?: boolean;
  q?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

export interface PaginatedProducts {
  items: ProductResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartSessionResponse {
  session_key: string;
  expires_at: string;
}

export interface CartItemResponse {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name: string;
  product_image_url?: string;
  variant_size: string;
  variant_color: string;
}

export interface CartResponse {
  uuid: string;
  session_key: string;
  total_ttc: number;
  total_items: number;
  items: CartItemResponse[];
}

export interface AddToCartData {
  variant_uuid: string;
  quantity: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface CreateOrderData {
  session_key: string;
  payment_method: string;
  shipping_address_uuid?: string;
  shipping_cost: number;
  notes?: string;
}

export interface OrderResponse {
  uuid: string;
  reference: string;
  status: string;
  total_ttc: number;
  created_at: string;
}
