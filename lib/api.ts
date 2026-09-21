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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur requête : attache le token ──────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Intercepteur réponse : refresh token automatique ────────────────────────
// Pages publiques où un 401 ne doit PAS déclencher une redirection vers /connexion
const PUBLIC_PATHS = ['/', '/boutique', '/produits', '/contact', '/connexion', '/inscription', '/mot-de-passe-oublie', '/mentions-legales', '/livraison-retours'];

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et qu'on n'a pas déjà tenté un refresh sur cette requête
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      const refreshToken = localStorage.getItem('refresh_token');

      // Pas de refresh token disponible → déconnexion propre
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        // Ne rediriger vers /connexion que depuis les pages protégées
        const currentPath = window.location.pathname;
        if (!isPublicPath(currentPath) && currentPath !== '/connexion') {
          window.location.href = '/connexion';
        }
        return Promise.reject(error);
      }

      // Si un refresh est déjà en cours, mettre en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<LoginResponse>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const newToken = data.access_token;
        localStorage.setItem('access_token', newToken);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        document.cookie = `access_token=${newToken}; path=/; max-age=${60 * 60 * 24 * 30}`;

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        const currentPath = window.location.pathname;
        if (!isPublicPath(currentPath) && currentPath !== '/connexion') {
          window.location.href = '/connexion';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
