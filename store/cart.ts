'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  brand: string | null;
  size: string;
  price: number;
  image: string | null;
  qty: number;
  maxStock: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, 'qty'>, qty: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
}

/** Panier gardé sur l'appareil : le prix et le stock réels sont revérifiés par le serveur à la commande. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, qty) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.variantId === line.variantId ? { ...l, ...line, qty: Math.min(l.qty + qty, line.maxStock, 20) } : l),
            };
          }
          return { lines: [...s.lines, { ...line, qty: Math.min(qty, line.maxStock, 20) }] };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, qty: Math.max(1, Math.min(qty, l.maxStock, 20)) } : l)),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'lacatena-cart' },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price, 0);
