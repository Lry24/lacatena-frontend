'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function StoreInitializer() {
  const { fetchCart } = useCartStore();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    // Auth d'abord (synchronise isAuthenticated), puis cart
    fetchMe()
      .catch(() => {})
      .finally(() => fetchCart());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
