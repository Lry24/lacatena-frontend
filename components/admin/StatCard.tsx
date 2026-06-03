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
    danger: '#c9634a',
    success: '#6faa30',
  };
  const accent = accentMap[variant];

  if (loading) {
    return (
      <div style={{
        background: '#1e2411',
        border: '1px solid rgba(240,234,210,0.08)',
        borderRadius: 10,
        padding: '20px 24px',
      }}>
        <div style={{ width: 80, height: 12, background: 'rgba(240,234,210,0.08)', borderRadius: 4, marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: 120, height: 28, background: 'rgba(240,234,210,0.08)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      background: '#1e2411',
      border: '1px solid rgba(240,234,210,0.08)',
      borderRadius: 10,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.5)', fontFamily: 'var(--font-dm-sans)' }}>
          {label}
        </span>
        {icon && (
          <span style={{ color: accent, opacity: 0.7 }}>{icon}</span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: accent, fontFamily: 'var(--font-dm-sans)', lineHeight: 1 }}>
        {value}
      </div>
      {subLabel && (
        <div style={{ fontSize: 12, color: 'rgba(240,234,210,0.5)' }}>{subLabel}</div>
      )}
    </div>
  );
}
