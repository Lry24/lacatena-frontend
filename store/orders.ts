'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedOrder {
  number: string;
  phone: string;
  total: number;
  createdAt: string;
}

export interface SavedContact {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  neighborhood: string;
  address: string;
  instructions: string;
}

interface OrdersState {
  orders: SavedOrder[];
  contact: SavedContact | null;
  save: (o: SavedOrder) => void;
  forget: (number: string) => void;
  rememberContact: (c: SavedContact | null) => void;
}

/** Sans compte client : les commandes passées depuis cet appareil et les coordonnées y sont mémorisées. */
export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      contact: null,
      save: (o) => set((s) => ({ orders: [o, ...s.orders.filter((x) => x.number !== o.number)].slice(0, 30) })),
      forget: (number) => set((s) => ({ orders: s.orders.filter((x) => x.number !== number) })),
      rememberContact: (c) => set({ contact: c }),
    }),
    { name: 'lacatena-orders' },
  ),
);
