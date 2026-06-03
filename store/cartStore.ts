'use client';
import { create } from 'zustand';
import type { CartItemResponse } from '@/types';
import * as api from '@/lib/api';
import { useAuthStore } from './authStore';

export interface LocalCartItem {
  id?: number | string; // Use variant_uuid as id locally
  variant_uuid: string;
  quantity: number;
  product_name?: string;
  product_slug?: string;
  variant_sku?: string;
  unit_price?: number;
  subtotal?: number;
  product_image_url?: string;
  variant_size?: string;
  variant_color?: string;
}

interface CartState {
  items: CartItemResponse[] | LocalCartItem[];
  total: number;
  totalItems: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (variantUuid: string, quantity?: number, extraInfo?: Partial<LocalCartItem>) => Promise<void>;
  updateItem: (itemId: number | string, quantity: number) => Promise<void>;
  removeItem: (itemId: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncLocalToServer: () => Promise<void>;
}

const LOCAL_CART_KEY = 'lacatena_cart';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  totalItems: 0,
  loading: false,

  fetchCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      try {
        set({ loading: true });
        const cart = await api.getCart();
        set({ items: cart.items ?? [], total: cart.total_ttc ?? 0, totalItems: cart.total_items ?? 0 });
      } catch {
        set({ items: [], total: 0, totalItems: 0 });
      } finally {
        set({ loading: false });
      }
    } else {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_CART_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const items = (parsed.items || []).map((item: any) => ({
              ...item,
              unit_price: Number(item.unit_price) || 0,
              quantity: Number(item.quantity) || 0,
              subtotal: (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
            }));
            const totalItems = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
            const total = items.reduce((acc: number, item: any) => acc + item.unit_price * item.quantity, 0);
            set({ items, total, totalItems });
          } catch {
            set({ items: [], total: 0, totalItems: 0 });
          }
        } else {
            set({ items: [], total: 0, totalItems: 0 });
        }
      }
    }
  },

  addItem: async (variantUuid, quantity = 1, extraInfo = {}) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const previousState = { items: get().items, total: get().total, totalItems: get().totalItems };

    const { items } = get();
    const newItems = [...items] as LocalCartItem[];
    const existing = newItems.find((i) => i.variant_uuid === variantUuid);
    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = (Number(existing.unit_price) || 0) * existing.quantity;
    } else {
      const unitPrice = Number(extraInfo.unit_price) || 0;
      newItems.push({ id: variantUuid, variant_uuid: variantUuid, quantity, ...extraInfo, unit_price: unitPrice, subtotal: unitPrice * quantity });
    }
    const totalItems = newItems.reduce((acc, item) => acc + item.quantity, 0);
    const total = newItems.reduce((acc, item) => acc + (Number(item.unit_price) || 0) * item.quantity, 0);
    
    // Mise à jour optimiste
    set({ items: newItems as CartItemResponse[], total, totalItems });

    if (isAuthenticated) {
      try {
        const cart = await api.addToCart({ variant_uuid: variantUuid, quantity });
        set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
      } catch (err) {
        // En cas d'erreur API, on annule (rollback)
        set(previousState);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify({ items: newItems }));
      }
    }
  },

  updateItem: async (itemId, quantity) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const previousState = { items: get().items, total: get().total, totalItems: get().totalItems };

    const { items } = get();
    const newItems = [...items] as LocalCartItem[];
    const index = newItems.findIndex((i) => i.variant_uuid === itemId || i.id === itemId);
    
    if (index !== -1) {
      if (quantity <= 0) {
        newItems.splice(index, 1);
      } else {
        newItems[index].quantity = quantity;
        newItems[index].subtotal = (Number(newItems[index].unit_price) || 0) * quantity;
      }
      const totalItems = newItems.reduce((acc, item) => acc + item.quantity, 0);
      const total = newItems.reduce((acc, item) => acc + (Number(item.unit_price) || 0) * item.quantity, 0);
      
      // Mise à jour optimiste
      set({ items: newItems as CartItemResponse[], total, totalItems });

      if (isAuthenticated) {
        if (typeof itemId === 'number' || !isNaN(Number(itemId))) {
            try {
              const cart = await api.updateCartItem(Number(itemId), quantity);
              set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
            } catch (err) {
              set(previousState);
            }
        } else {
             // C'est un string temporaire avant fetch complet, on annule l'optimiste et on refresh
             set(previousState);
             get().fetchCart();
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_CART_KEY, JSON.stringify({ items: newItems }));
        }
      }
    }
  },

  removeItem: async (itemId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const previousState = { items: get().items, total: get().total, totalItems: get().totalItems };

    const { items } = get();
    const newItems = (items as LocalCartItem[]).filter((i) => i.variant_uuid !== itemId && i.id !== itemId);
    const totalItems = newItems.reduce((acc, item) => acc + item.quantity, 0);
    const total = newItems.reduce((acc, item) => acc + (item.unit_price || 0) * item.quantity, 0);
    
    // Mise à jour optimiste
    set({ items: newItems as CartItemResponse[], total, totalItems });

    if (isAuthenticated) {
        if (typeof itemId === 'number' || !isNaN(Number(itemId))) {
            try {
              const cart = await api.removeCartItem(Number(itemId));
              set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
            } catch (err) {
              set(previousState);
            }
        } else {
            set(previousState);
            get().fetchCart();
        }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify({ items: newItems }));
      }
    }
  },

  clearCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (isAuthenticated) {
      try {
        await api.clearCartServer();
      } catch {}
    }
    if (typeof window !== 'undefined') localStorage.removeItem(LOCAL_CART_KEY);
    set({ items: [], total: 0, totalItems: 0 });
  },

  syncLocalToServer: async () => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(LOCAL_CART_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          const items = parsed.items || [];
          for (const item of items) {
            try {
              await api.addToCart({ variant_uuid: item.variant_uuid, quantity: item.quantity });
            } catch (e) {
              console.error("Failed to sync item", item);
            }
          }
          localStorage.removeItem(LOCAL_CART_KEY);
        } catch (e) {
          console.error("Failed to parse local cart", e);
        }
      }
    }
    await get().fetchCart();
  }
}));
