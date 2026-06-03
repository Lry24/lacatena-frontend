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

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const W = 'rgba(255,255,255,0.92)';       // texte principal blanc
const WM = 'rgba(255,255,255,0.55)';      // texte secondaire
const CARD = '#1e2614';                   // fond carte
const BORDER = 'rgba(255,255,255,0.11)'; // bordure

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .catch(() => showToast('Erreur chargement tableau de bord.', 'error'))
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
      showToast('Export CSV telecharge.', 'success');
    } catch {
      showToast("Erreur lors de l'export.", 'error');
    }
  };

  const stockAlerts = (data?.stock_alerts ?? []) as {
    product_name: string; sku: string; size: string; color: string; stock: number; stock_alert: number;
  }[];

  return (
    <div style={{ color: W }}>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.4px' }}>
            Tableau de bord
          </h1>
          <p style={{ fontSize: 13, color: WM, marginTop: 6 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            style={{
              padding: '10px 18px', background: 'rgba(232,185,106,0.12)',
              border: '1px solid rgba(232,185,106,0.3)', borderRadius: 8,
              color: '#E8B96A', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter CSV
          </button>
          {exportOpen && (
            <div style={{
              position: 'absolute', top: '110%', right: 0,
              background: '#252e16', border: `1px solid ${BORDER}`,
              borderRadius: 8, overflow: 'hidden', zIndex: 100, minWidth: 170,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {(['orders', 'products', 'customers'] as const).map((type) => (
                <button key={type} onClick={() => handleExport(type)} style={{
                  display: 'block', width: '100%', padding: '11px 16px',
                  background: 'none', border: 'none', color: W,
                  fontSize: 13, textAlign: 'left', cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
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
        <StatCard label="Commandes aujourd'hui" value={loading ? '...' : data?.total_orders_today ?? 0} loading={loading} />
        <StatCard label="Revenu aujourd'hui"    value={loading ? '...' : fmt(data?.total_revenue_today ?? 0)} loading={loading} />
        <StatCard label="Commandes ce mois"     value={loading ? '...' : data?.total_orders_month ?? 0} loading={loading} />
        <StatCard label="Revenu ce mois"        value={loading ? '...' : fmt(data?.total_revenue_month ?? 0)} loading={loading} />
        <StatCard label="Clients total"         value={loading ? '...' : data?.total_customers ?? 0} loading={loading} />
        <StatCard label="Nouveaux clients"      value={loading ? '...' : data?.new_customers_month ?? 0} subLabel="ce mois" loading={loading} />
        <StatCard label="Commandes en attente"  value={loading ? '...' : data?.pending_orders ?? 0} variant="warning" loading={loading} />
        <StatCard label="Devis en attente"      value={loading ? '...' : data?.pending_quotes ?? 0} variant="warning" loading={loading} />
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 24 }}>

        {/* Recent orders */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Commandes recentes
            </h2>
            <button onClick={() => router.push('/admin/commandes')}
              style={{ background: 'none', border: 'none', color: '#E8B96A', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
              Voir tout &rarr;
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {['N°', 'Client', 'Total', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '8px 10px', textAlign: 'left',
                    color: WM, fontWeight: 600,
                    fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} style={{ padding: '10px' }}>
                      <div style={{ height: 13, background: 'rgba(255,255,255,0.07)', borderRadius: 4, animation: 'adminPulse 1.5s infinite' }} />
                    </td></tr>
                  ))
                : (data?.recent_orders ?? []).slice(0, 6).map((o) => (
                    <tr key={o.uuid}
                      onClick={() => router.push(`/admin/commandes/${o.uuid}`)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '11px 10px', color: '#E8B96A', fontWeight: 600 }}>{o.order_number}</td>
                      <td style={{ padding: '11px 10px', color: W }}>{o.customer_name}</td>
                      <td style={{ padding: '11px 10px', color: W, fontWeight: 500 }}>{fmt(o.total_ttc)}</td>
                      <td style={{ padding: '11px 10px' }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding: '11px 10px', color: WM }}>{fmtDate(o.created_at)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Top produits */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: '0 0 20px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Top produits
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 44, background: 'rgba(255,255,255,0.07)', borderRadius: 8, animation: 'adminPulse 1.5s infinite' }} />
                ))
              : (data?.top_products ?? []).slice(0, 6).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(232,185,106,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#E8B96A', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: W, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: WM, marginTop: 2 }}>{p.qty_sold} ventes</div>
                    </div>
                    <div style={{ fontSize: 13, color: '#E8B96A', fontWeight: 600, flexShrink: 0 }}>{fmt(p.revenue)}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Stock alerts */}
      {stockAlerts.length > 0 && (
        <div style={{ background: 'rgba(220,80,60,0.07)', border: '1px solid rgba(220,80,60,0.25)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: '#e07070', margin: '0 0 16px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Alertes stock ({stockAlerts.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {stockAlerts.map((a, i) => (
              <div key={i} style={{
                background: 'rgba(220,80,60,0.08)', borderRadius: 8, padding: '12px 16px',
                border: '1px solid rgba(220,80,60,0.18)',
              }}>
                <div style={{ fontSize: 13, color: W, fontWeight: 600, marginBottom: 4 }}>{a.product_name}</div>
                <div style={{ fontSize: 11, color: WM }}>SKU: {a.sku} · {a.size} / {a.color}</div>
                <div style={{ fontSize: 13, color: '#e07070', fontWeight: 600, marginTop: 8 }}>
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
