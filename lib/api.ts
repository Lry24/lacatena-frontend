import axios from 'axios';
import type {
  LoginData, LoginResponse, RegisterData, VerifyOtpData, ResetPasswordData,
  ProductsParams, PaginatedProducts, ProductDetailResponse,
  CategoryResponse, CartSessionResponse, CartResponse, AddToCartData,
  CreateOrderData, OrderResponse, UserResponse, AddressCreate, AddressResponse,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = (data: LoginData) =>
  api.post<LoginResponse>('/auth/login', data).then((r) => r.data);

export const register = (data: RegisterData) =>
  api.post('/auth/register', data).then((r) => r.data);

export const verifyOtp = (data: VerifyOtpData) =>
  api.post('/auth/verify-otp', data).then((r) => r.data);

export const resendOtp = (email: string) =>
  api.post('/auth/resend-otp', { email }).then((r) => r.data);

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (data: ResetPasswordData) =>
  api.post('/auth/reset-password', data).then((r) => r.data);

export const getMe = () =>
  api.get<UserResponse>('/auth/me').then((r) => r.data);

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = (params?: ProductsParams) =>
  api.get<PaginatedProducts>('/products', { params }).then((r) => r.data);

export const getProduct = (slug: string) =>
  api.get<ProductDetailResponse>(`/products/${slug}`).then((r) => r.data);

export const getCategories = () =>
  api.get<CategoryResponse[]>('/categories').then((r) => r.data);

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const createCartSession = () =>
  api.post<CartSessionResponse>('/cart/session').then((r) => r.data);

export const getCart = (sessionKey: string) =>
  api.get<CartResponse>(`/cart/${sessionKey}`).then((r) => r.data);

export const addToCart = (sessionKey: string, item: AddToCartData) =>
  api.post<CartResponse>(`/cart/${sessionKey}/items`, item).then((r) => r.data);

export const updateCartItem = (sessionKey: string, itemId: number, quantity: number) =>
  api.patch<CartResponse>(`/cart/${sessionKey}/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (sessionKey: string, itemId: number) =>
  api.delete<CartResponse>(`/cart/${sessionKey}/items/${itemId}`).then((r) => r.data);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrderFromCart = (data: CreateOrderData) =>
  api.post<OrderResponse>('/orders/from-cart', data).then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUserAddresses = () =>
  api.get<AddressResponse[]>('/users/me/addresses').then((r) => r.data);

export const createAddress = (data: AddressCreate) =>
  api.post<AddressResponse>('/users/me/addresses', data).then((r) => r.data);

export default api;
