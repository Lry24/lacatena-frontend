import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Stats / Dashboard ────────────────────────────────────────────────────────

export const getDashboard = () =>
  adminApi.get('/stats/dashboard').then((r) => r.data);

export const getRevenue = (params?: Record<string, unknown>) =>
  adminApi.get('/stats/revenue', { params }).then((r) => r.data);

export const getTopProducts = (limit = 10) =>
  adminApi.get('/stats/products/top', { params: { limit } }).then((r) => r.data);

export const getTopCustomers = (limit = 10) =>
  adminApi.get('/stats/customers/top', { params: { limit } }).then((r) => r.data);

export const getOrdersByChannel = () =>
  adminApi.get('/stats/orders/by-channel').then((r) => r.data);

export const getCashSummary = () =>
  adminApi.get('/stats/cash/summary').then((r) => r.data);

export const exportCsv = (type: 'orders' | 'products' | 'customers') =>
  adminApi.get('/stats/export/csv', { params: { type }, responseType: 'blob' }).then((r) => r.data);

// ─── Products ─────────────────────────────────────────────────────────────────

export const listProducts = (params?: Record<string, unknown>) =>
  adminApi.get('/products', { params }).then((r) => r.data);

export const getProductByUuid = (uuid: string) =>
  adminApi.get(`/products/uuid/${uuid}`).then((r) => r.data);

export const createProduct = (data: Record<string, unknown>) =>
  adminApi.post('/products', data).then((r) => r.data);

export const updateProduct = (uuid: string, data: Record<string, unknown>) =>
  adminApi.patch(`/products/uuid/${uuid}`, data).then((r) => r.data);

export const toggleProduct = (uuid: string) =>
  adminApi.patch(`/products/uuid/${uuid}/toggle`).then((r) => r.data);

export const deleteProduct = (uuid: string) =>
  adminApi.delete(`/products/uuid/${uuid}`).then((r) => r.data);

export const uploadProductImage = (uuid: string, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return adminApi.post(`/products/uuid/${uuid}/images`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteProductImage = (uuid: string, imgId: string) =>
  adminApi.delete(`/products/uuid/${uuid}/images/${imgId}`).then((r) => r.data);

export const setPrimaryImage = (uuid: string, imgId: string) =>
  adminApi.patch(`/products/uuid/${uuid}/images/${imgId}/set-primary`).then((r) => r.data);

export const getProductVariants = (uuid: string) =>
  adminApi.get(`/products/uuid/${uuid}/variants`).then((r) => r.data);

export const createVariant = (productUuid: string, data: Record<string, unknown>) =>
  adminApi.post(`/products/uuid/${productUuid}/variants`, data).then((r) => r.data);

export const updateVariant = (productUuid: string, varUuid: string, data: Record<string, unknown>) =>
  adminApi.patch(`/products/uuid/${productUuid}/variants/${varUuid}`, data).then((r) => r.data);

export const deleteVariant = (productUuid: string, varUuid: string) =>
  adminApi.delete(`/products/uuid/${productUuid}/variants/${varUuid}`).then((r) => r.data);

// ─── Categories ───────────────────────────────────────────────────────────────

export const listCategories = (activeOnly = false) =>
  adminApi.get('/categories', { params: { active_only: activeOnly } }).then((r) => r.data);

export const createCategory = (data: Record<string, unknown>) =>
  adminApi.post('/categories', data).then((r) => r.data);

export const updateCategory = (uuid: string, data: Record<string, unknown>) =>
  adminApi.put(`/categories/uuid/${uuid}`, data).then((r) => r.data);

export const deleteCategory = (uuid: string) =>
  adminApi.delete(`/categories/uuid/${uuid}`).then((r) => r.data);

export const uploadCategoryImage = (uuid: string, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return adminApi.post(`/categories/uuid/${uuid}/image`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const deleteCategoryImage = (uuid: string) =>
  adminApi.delete(`/categories/uuid/${uuid}/image`).then((r) => r.data);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const listOrders = (params?: Record<string, unknown>) =>
  adminApi.get('/orders', { params }).then((r) => r.data);

export const getOrder = (uuid: string) =>
  adminApi.get(`/orders/${uuid}`).then((r) => r.data);

export const updateOrderStatus = (uuid: string, data: Record<string, unknown>) =>
  adminApi.patch(`/orders/${uuid}/status`, data).then((r) => r.data);

export const refundOrder = (uuid: string, data: Record<string, unknown>) =>
  adminApi.post(`/orders/${uuid}/refund`, data).then((r) => r.data);

export const getOrderInvoice = (uuid: string) =>
  adminApi.get(`/orders/${uuid}/invoice`).then((r) => r.data);

// ─── Customers ────────────────────────────────────────────────────────────────

export const listCustomers = (params?: Record<string, unknown>) =>
  adminApi.get('/admin/customers', { params }).then((r) => r.data);

export const getCustomer = (uuid: string) =>
  adminApi.get(`/admin/customers/${uuid}`).then((r) => r.data);

export const createCustomer = (data: Record<string, unknown>) =>
  adminApi.post('/admin/customers', data).then((r) => r.data);

export const updateCustomer = (uuid: string, data: Record<string, unknown>) =>
  adminApi.patch(`/admin/customers/${uuid}`, data).then((r) => r.data);

export const toggleCustomerActive = (uuid: string) =>
  adminApi.patch(`/admin/customers/${uuid}/toggle-active`).then((r) => r.data);

export const getCustomerOrders = (uuid: string) =>
  adminApi.get(`/admin/customers/${uuid}/orders`).then((r) => r.data);

// ─── Users ────────────────────────────────────────────────────────────────────

export const listUsers = (params?: Record<string, unknown>) =>
  adminApi.get('/admin/users', { params }).then((r) => r.data);

export const createUser = (data: Record<string, unknown>) =>
  adminApi.post('/admin/users', data).then((r) => r.data);

export const getUser = (uuid: string) =>
  adminApi.get(`/admin/users/${uuid}`).then((r) => r.data);

export const updateUser = (uuid: string, data: Record<string, unknown>) =>
  adminApi.patch(`/admin/users/${uuid}`, data).then((r) => r.data);

export const deleteUser = (uuid: string) =>
  adminApi.delete(`/admin/users/${uuid}`).then((r) => r.data);

// ─── Stock ────────────────────────────────────────────────────────────────────

export const getStockAlerts = () =>
  adminApi.get('/stock/alerts').then((r) => r.data);

export const listMovements = (params?: Record<string, unknown>) =>
  adminApi.get('/stock/movements', { params }).then((r) => r.data);

export const createMovement = (data: Record<string, unknown>) =>
  adminApi.post('/stock/movements', data).then((r) => r.data);

export default adminApi;
