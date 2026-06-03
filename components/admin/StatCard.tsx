'use client';
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  loading?: boolean;
}

export default function StatCard({ label, value, subLabel, icon, variant = 'default', loading }: StatCardProps) {
  const accentMap = {
    default: '#E8B96A',
    warning: '#e6a817',
    danger: '#e07070',
    success: '#82c840',
  };
  const accent = accentMap[variant];

  if (loading) {
    return (
      <div style={{
        background: 'var(--admin-surface, #1e2614)',
        border: '1px solid var(--admin-border, rgba(255,255,255,0.11))',
        borderRadius: 12,
        padding: '22px 24px',
      }}>
        <div style={{ width: 80, height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ width: 120, height: 28, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--admin-surface, #1e2614)',
      border: '1px solid var(--admin-border, rgba(255,255,255,0.11))',
      borderRadius: 12,
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 11, letterSpacing: '1.8px', textTransform: 'uppercase',
          color: 'var(--admin-text-muted, rgba(255,255,255,0.58))',
          fontFamily: 'var(--font-dm-sans)',
        }}>
          {label}
        </span>
        {icon && <span style={{ color: accent, opacity: 0.85 }}>{icon}</span>}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 700, color: accent,
        fontFamily: 'var(--font-dm-sans)', lineHeight: 1,
        letterSpacing: '-0.5px',
      }}>
        {value}
      </div>
      {subLabel && (
        <div style={{ fontSize: 12, color: 'var(--admin-text-muted, rgba(255,255,255,0.55))' }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}
