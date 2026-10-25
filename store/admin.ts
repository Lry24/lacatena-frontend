'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { configureAuth } from '@/lib/api';
import type { AdminUser } from '@/lib/types';

interface AdminState {
  token: string | null;
  user: AdminUser | null;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'lacatena-admin' },
  ),
);

// Chaque appel /api/v1/admin porte le jeton ; une session expirée renvoie à la connexion
configureAuth(
  () => useAdmin.getState().token,
  () => useAdmin.getState().logout(),
);
