'use client';
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const TYPE_STYLES = {
  success: { color: '#6faa30', border: 'rgba(111,170,48,0.3)' },
  error:   { color: '#c9634a', border: 'rgba(201,99,74,0.3)' },
  info:    { color: '#4a8fc9', border: 'rgba(74,143,201,0.3)' },
  warning: { color: '#e6a817', border: 'rgba(230,168,23,0.3)' },
};

export default function Toast({ message, type = 'info', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const s = TYPE_STYLES[type];

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 99999,
      background: '#1e2411',
      border: `1px solid ${s.border}`,
      borderLeft: `3px solid ${s.color}`,
      borderRadius: 8,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 260,
      maxWidth: 380,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      fontFamily: 'var(--font-dm-sans)',
    }}>
      <span style={{ color: s.color, fontSize: 14 }}>
        {type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: '#f0ead2' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,234,210,0.4)', cursor: 'pointer', fontSize: 16 }}>×</button>
    </div>
  );
}

// Simple toast manager hook
import { useState, useCallback } from 'react';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}
