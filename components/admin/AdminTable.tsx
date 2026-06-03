'use client';
import React from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: number | string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  skeletonRows?: number;
}

export default function AdminTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  emptyMessage = 'Aucune donnee disponible.',
  skeletonRows = 5,
}: AdminTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-dm-sans)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--admin-border, rgba(255,255,255,0.11))' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '11px 16px',
                  textAlign: 'left',
                  fontSize: 10,
                  letterSpacing: '1.8px',
                  textTransform: 'uppercase',
                  color: 'var(--admin-text-muted, rgba(255,255,255,0.55))',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  width: col.width,
                  background: 'rgba(255,255,255,0.025)',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '13px 16px' }}>
                      <div style={{
                        height: 14, borderRadius: 4,
                        background: 'rgba(255,255,255,0.07)',
                        animation: 'adminPulse 1.5s ease-in-out infinite',
                        width: '70%',
                      }} />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
            ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--admin-text-faint, rgba(255,255,255,0.35))', fontSize: 13 }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
            : data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ padding: '13px 16px', fontSize: 13, color: 'var(--admin-text, rgba(255,255,255,0.92))', verticalAlign: 'middle' }}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
}
