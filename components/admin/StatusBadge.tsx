'use client';
import React from 'react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',  color: '#e6a817', bg: 'rgba(230,168,23,0.12)' },
  confirmed: { label: 'Confirmée',   color: '#4a8fc9', bg: 'rgba(74,143,201,0.12)' },
  shipped:   { label: 'Expédiée',    color: '#9b6fcf', bg: 'rgba(155,111,207,0.12)' },
  delivered: { label: 'Livrée',      color: '#6faa30', bg: 'rgba(111,170,48,0.12)' },
  cancelled: { label: 'Annulée',     color: '#c9634a', bg: 'rgba(201,99,74,0.12)' },
  refunded:  { label: 'Remboursée',  color: '#aaaaaa', bg: 'rgba(170,170,170,0.12)' },
  active:    { label: 'Actif',       color: '#6faa30', bg: 'rgba(111,170,48,0.12)' },
  inactive:  { label: 'Inactif',     color: '#c9634a', bg: 'rgba(201,99,74,0.12)' },
  admin:     { label: 'Admin',       color: '#E8B96A', bg: 'rgba(232,185,106,0.12)' },
  staff:     { label: 'Staff',       color: '#4a8fc9', bg: 'rgba(74,143,201,0.12)' },
  customer:  { label: 'Client',      color: 'rgba(240,234,210,0.6)', bg: 'rgba(240,234,210,0.06)' },
  store:     { label: 'Boutique',    color: '#E8B96A', bg: 'rgba(232,185,106,0.12)' },
  online:    { label: 'En ligne',    color: '#4a8fc9', bg: 'rgba(74,143,201,0.12)' },
};

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
}

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] || { label: status, color: 'rgba(240,234,210,0.6)', bg: 'rgba(240,234,210,0.06)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.5px',
      color: cfg.color,
      background: cfg.bg,
      whiteSpace: 'nowrap',
    }}>
      {customLabel ?? cfg.label}
    </span>
  );
}
