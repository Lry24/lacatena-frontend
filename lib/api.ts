import axios from 'axios';
import type {
  LoginData, LoginResponse, RegisterData, VerifyOtpData, ResetPasswordData,
  ProductsParams, PaginatedProducts, ProductDetailResponse,
  CategoryResponse, CartResponse, AddToCartData,
  CreateOrderData, OrderResponse, PaginatedOrders,
  UserResponse, UserUpdate, PasswordChangeData,
  AddressCreate, AddressResponse,
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

export const getCart = () =>
  api.get<CartResponse>(`/cart/me`).then((r) => r.data);

export const addToCart = (item: AddToCartData) =>
  api.post<CartResponse>(`/cart/me/items`, item).then((r) => r.data);

export const updateCartItem = (itemId: number, quantity: number) =>
  api.patch<CartResponse>(`/cart/me/items/${itemId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (itemId: number) =>
  api.delete<CartResponse>(`/cart/me/items/${itemId}`).then((r) => r.data);

export const clearCartServer = () =>
  api.delete<CartResponse>(`/cart/me`).then((r) => r.data);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrderFromCart = (data: CreateOrderData) =>
  api.post<OrderResponse>('/orders/from-cart', data).then((r) => r.data);

export const getPaymentMethods = () =>
  api.get<{ value: string; label: string }[]>('/orders/payment-methods').then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUserAddresses = () =>
  api.get<AddressResponse[]>('/users/me/addresses').then((r) => r.data);

export const createAddress = (data: AddressCreate) =>
  api.post<AddressResponse>('/users/me/addresses', data).then((r) => r.data);

export const deleteAddress = (uuid: string) =>
  api.delete(`/users/me/addresses/${uuid}`).then((r) => r.data);

export const setDefaultAddress = (uuid: string) =>
  api.patch<AddressResponse>(`/users/me/addresses/${uuid}/set-default`).then((r) => r.data);

export const updateProfile = (data: UserUpdate) =>
  api.patch<UserResponse>('/users/me', data).then((r) => r.data);

export const changePassword = (data: PasswordChangeData) =>
  api.patch('/users/me/password', data).then((r) => r.data);

export const getMyOrders = (page = 1, size = 20) =>
  api.get<PaginatedOrders>('/users/me/orders', { params: { page, size } }).then((r) => r.data);

export const getOrderDetail = (uuid: string) =>
  api.get('/orders/' + uuid).then((r) => r.data);

export default api;
