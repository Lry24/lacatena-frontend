'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductCard } from '@/lib/types';

interface WishlistState {
  items: ProductCard[];
  toggle: (p: ProductCard) => void;
  has: (id: number) => boolean;
  remove: (id: number) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) =>
        set((s) => ({ items: s.items.some((i) => i.id === p.id) ? s.items.filter((i) => i.id !== p.id) : [p, ...s.items] })),
      has: (id) => get().items.some((i) => i.id === id),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: 'lacatena-wishlist' },
  ),
);
