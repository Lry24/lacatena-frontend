'use client';
import { create } from 'zustand';
import type { UserResponse, LoginData } from '@/types';
import * as api from '@/lib/api';

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
      // Poser aussi un cookie pour le middleware (protection routes /admin)
      document.cookie = `access_token=${res.access_token}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
    set({ token: res.access_token, isAuthenticated: true });
    const user = await api.getMe();
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Supprimer le cookie
      document.cookie = 'access_token=; path=/; max-age=0';
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true });
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
