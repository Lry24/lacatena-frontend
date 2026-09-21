'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductResponse } from '@/types';

interface WishlistState {
  items: ProductResponse[];
  toggle: (product: ProductResponse) => void;
  isInWishlist: (uuid: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const current = get().items;
        const exists = current.some((p) => p.uuid === product.uuid);
        set({ items: exists ? current.filter((p) => p.uuid !== product.uuid) : [...current, product] });
      },

      isInWishlist: (uuid) => get().items.some((p) => p.uuid === uuid),
    }),
    {
      name: 'lacatena_wishlist',
    }
  )
);
