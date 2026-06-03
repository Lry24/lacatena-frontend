'use client';
import { create } from 'zustand';
import type { CartItemResponse } from '@/types';
import * as api from '@/lib/api';

interface CartState {
  sessionKey: string | null;
  items: CartItemResponse[];
  total: number;
  totalItems: number;
  loading: boolean;
  initSession: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addItem: (variantUuid: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
}

const SESSION_KEY = 'cart_session_key';

export const useCartStore = create<CartState>((set, get) => ({
  sessionKey: null,
  items: [],
  total: 0,
  totalItems: 0,
  loading: false,

  initSession: async () => {
    let key = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    if (!key) {
      const session = await api.createCartSession();
      key = session.session_key;
      if (typeof window !== 'undefined') localStorage.setItem(SESSION_KEY, key);
    }
    set({ sessionKey: key });
    await get().fetchCart();
  },

  fetchCart: async () => {
    const { sessionKey } = get();
    if (!sessionKey) return;
    try {
      set({ loading: true });
      const cart = await api.getCart(sessionKey);
      set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
    } catch {
      // session may be expired — reset
      if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
      set({ sessionKey: null, items: [], total: 0, totalItems: 0 });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (variantUuid, quantity = 1) => {
    let { sessionKey } = get();
    if (!sessionKey) {
      await get().initSession();
      sessionKey = get().sessionKey;
    }
    if (!sessionKey) return;
    const cart = await api.addToCart(sessionKey, { variant_uuid: variantUuid, quantity });
    set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
  },

  updateItem: async (itemId, quantity) => {
    const { sessionKey } = get();
    if (!sessionKey) return;
    const cart = await api.updateCartItem(sessionKey, itemId, quantity);
    set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
  },

  removeItem: async (itemId) => {
    const { sessionKey } = get();
    if (!sessionKey) return;
    const cart = await api.removeCartItem(sessionKey, itemId);
    set({ items: cart.items, total: cart.total_ttc, totalItems: cart.total_items });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
    set({ sessionKey: null, items: [], total: 0, totalItems: 0 });
  },
}));
