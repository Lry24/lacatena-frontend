'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface DashboardData {
  total_orders_today: number;
  total_revenue_today: number;
  total_orders_month: number;
  total_revenue_month: number;
  total_customers: number;
  new_customers_month: number;
  pending_orders: number;
  pending_quotes: number;
  stock_alerts: unknown[];
  top_products: { name: string; reference: string; qty_sold: number; revenue: number }[];
  recent_orders: { uuid: string; order_number: string; customer_name: string; total_ttc: number; status: string; channel: string; created_at: string }[];
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .catch(() => showToast('Erreur lors du chargement du tableau de bord.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (type: 'orders' | 'products' | 'customers') => {
    setExportOpen(false);
    try {
      const blob = await adminApi.exportCsv(type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export CSV téléchargé.', 'success');
    } catch {
      showToast('Erreur lors de l\'export.', 'error');
    }
  };

  const stockAlerts = (data?.stock_alerts ?? []) as { product_name: string; sku: string; size: string; color: string; stock: number; stock_alert: number }[];

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0ead2', margin: 0, fontFamily: 'var(--font-dm-sans)' }}>
            Tableau de bord
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(240,234,210,0.4)', marginTop: 4 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            style={{
              padding: '9px 16px', background: 'rgba(232,185,106,0.1)',
              border: '1px solid rgba(232,185,106,0.25)', borderRadius: 8,
              color: '#E8B96A', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter CSV
          </button>
          {exportOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)',
              borderRadius: 8, overflow: 'hidden', zIndex: 100, minWidth: 160,
            }}>
              {(['orders', 'products', 'customers'] as const).map((type) => (
                <button key={type} onClick={() => handleExport(type)} style={{
                  display: 'block', width: '100%', padding: '10px 16px',
                  background: 'none', border: 'none', color: '#f0ead2',
                  fontSize: 13, textAlign: 'left', cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(232,185,106,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  {{ orders: 'Commandes', products: 'Produits', customers: 'Clients' }[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Commandes aujourd'hui" value={loading ? '…' : data?.total_orders_today ?? 0} loading={loading} />
        <StatCard label="Revenu aujourd'hui" value={loading ? '…' : fmt(data?.total_revenue_today ?? 0)} loading={loading} />
        <StatCard label="Commandes ce mois" value={loading ? '…' : data?.total_orders_month ?? 0} loading={loading} />
        <StatCard label="Revenu ce mois" value={loading ? '…' : fmt(data?.total_revenue_month ?? 0)} loading={loading} />
        <StatCard label="Clients total" value={loading ? '…' : data?.total_customers ?? 0} loading={loading} />
        <StatCard label="Nouveaux clients" value={loading ? '…' : data?.new_customers_month ?? 0} subLabel="ce mois" loading={loading} />
        <StatCard label="Commandes en attente" value={loading ? '…' : data?.pending_orders ?? 0} variant="warning" loading={loading} />
        <StatCard label="Devis en attente" value={loading ? '…' : data?.pending_quotes ?? 0} variant="warning" loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Recent orders */}
        <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#f0ead2', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Commandes récentes
            </h2>
            <button onClick={() => router.push('/admin/commandes')} style={{ background: 'none', border: 'none', color: '#E8B96A', fontSize: 12, cursor: 'pointer' }}>
              Voir tout →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(240,234,210,0.06)' }}>
                {['N°', 'Client', 'Total', 'Statut', 'Canal', 'Date'].map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'rgba(240,234,210,0.4)', fontWeight: 400, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} style={{ padding: '10px 8px' }}><div style={{ height: 12, background: 'rgba(240,234,210,0.06)', borderRadius: 3, animation: 'adminPulse 1.5s infinite' }} /></td></tr>
                  ))
                : (data?.recent_orders ?? []).slice(0, 5).map((o) => (
                    <tr key={o.uuid} style={{ borderBottom: '1px solid rgba(240,234,210,0.04)', cursor: 'pointer' }} onClick={() => router.push(`/admin/commandes/${o.uuid}`)}>
                      <td style={{ padding: '10px 8px', color: '#E8B96A', fontWeight: 500 }}>{o.order_number}</td>
                      <td style={{ padding: '10px 8px', color: '#f0ead2' }}>{o.customer_name}</td>
                      <td style={{ padding: '10px 8px', color: '#f0ead2' }}>{fmt(o.total_ttc)}</td>
                      <td style={{ padding: '10px 8px' }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding: '10px 8px' }}><StatusBadge status={o.channel} /></td>
                      <td style={{ padding: '10px 8px', color: 'rgba(240,234,210,0.4)' }}>{fmtDate(o.created_at)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Top products */}
        <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#f0ead2', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Top produits
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 40, background: 'rgba(240,234,210,0.06)', borderRadius: 6, animation: 'adminPulse 1.5s infinite' }} />
                ))
              : (data?.top_products ?? []).slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(232,185,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#E8B96A', fontWeight: 600, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#f0ead2', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,234,210,0.4)' }}>{p.reference} · {p.qty_sold} ventes</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#E8B96A', fontWeight: 500, flexShrink: 0 }}>{fmt(p.revenue)}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Stock alerts */}
      {stockAlerts.length > 0 && (
        <div style={{ background: 'rgba(201,99,74,0.06)', border: '1px solid rgba(201,99,74,0.2)', borderRadius: 10, padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#c9634a', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            ⚠ Alertes stock ({stockAlerts.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {stockAlerts.map((a, i) => (
              <div key={i} style={{
                background: 'rgba(201,99,74,0.08)', borderRadius: 8, padding: '10px 14px',
                border: '1px solid rgba(201,99,74,0.15)',
              }}>
                <div style={{ fontSize: 13, color: '#f0ead2', fontWeight: 500, marginBottom: 4 }}>{a.product_name}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,234,210,0.5)' }}>
                  SKU: {a.sku} · {a.size} / {a.color}
                </div>
                <div style={{ fontSize: 12, color: '#c9634a', fontWeight: 500, marginTop: 6 }}>
                  Stock: {a.stock} / Seuil: {a.stock_alert}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
