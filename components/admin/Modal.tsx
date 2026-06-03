'use client';
import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, children, width = 560 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1e2411',
        border: '1px solid rgba(240,234,210,0.1)',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 28,
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0ead2', margin: 0, fontFamily: 'var(--font-dm-sans)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'rgba(240,234,210,0.5)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
