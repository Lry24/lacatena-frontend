'use client';
import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function StoreInitializer() {
  const { fetchCart } = useCartStore();
  const { fetchMe } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchMe()
      .catch(() => {})
      .finally(() => fetchCart());
  }, [fetchCart, fetchMe]);

  return null;
}
