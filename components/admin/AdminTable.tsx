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
  emptyMessage = 'Aucune donnée disponible.',
  skeletonRows = 5,
}: AdminTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-dm-sans)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(240,234,210,0.08)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: 10,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'rgba(240,234,210,0.4)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  width: col.width,
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
                    <td key={col.key} style={{ padding: '12px 14px' }}>
                      <div style={{
                        height: 14,
                        borderRadius: 4,
                        background: 'rgba(240,234,210,0.06)',
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
                  <td colSpan={columns.length} style={{ padding: '32px 14px', textAlign: 'center', color: 'rgba(240,234,210,0.3)', fontSize: 13 }}>
                    {emptyMessage}
                  </td>
                </tr>
              )
            : data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: '1px solid rgba(240,234,210,0.04)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(240,234,210,0.03)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '12px 14px', fontSize: 13, color: '#f0ead2', verticalAlign: 'middle' }}>
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
