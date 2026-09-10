'use client';
import { create } from 'zustand';
import type { UserResponse, LoginData } from '@/types';
import * as api from '@/lib/api';
import { useCartStore } from './cartStore';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,

  login: async (data) => {
    const res = await api.login(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      document.cookie = `access_token=${res.access_token}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
    set({ token: res.access_token, isAuthenticated: true });
    
    try {
      const user = await api.getMe();
      set({ user });
    } catch (e) {
      // Ignorer erreur temporaire
    }

    // Sync local cart items to server
    await useCartStore.getState().syncLocalToServer();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      document.cookie = 'access_token=; path=/; max-age=0';
    }
    set({ user: null, token: null, isAuthenticated: false });
    
    // Refresh cart (will switch to local storage, which should be empty)
    useCartStore.getState().fetchCart();
  },

  fetchMe: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    try {
      const user = await api.getMe();
      set({ user, token, isAuthenticated: true });
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0';
      }
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
