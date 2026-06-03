'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface Order {
  uuid: string;
  order_number: string;
  customer_name: string;
  total_ttc: number;
  status: string;
  channel: string;
  created_at: string;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const STATUSES = ['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_LABELS: Record<string, string> = {
  '': 'Tous les statuts',
  pending: 'En attente',
  paid: 'Payée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export default function CommandesPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminApi.listOrders({ page, size: 20, status: status || undefined, channel: channel || undefined, q: search || undefined })
      .then((r) => { setOrders(r.items ?? r); setTotal(r.total ?? r.length); })
      .catch(() => showToast('Erreur chargement commandes.', 'error'))
      .finally(() => setLoading(false));
  }, [page, status, channel, search]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Order>[] = [
    { key: 'order_number', label: 'N° Commande', render: (r) => <span style={{ color: '#E8B96A', fontWeight: 500 }}>{r.order_number}</span> },
    { key: 'customer_name', label: 'Client' },
    { key: 'total_ttc', label: 'Montant TTC', render: (r) => fmt(r.total_ttc) },
    { key: 'status', label: 'Statut', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'channel', label: 'Canal', render: (r) => <StatusBadge status={r.channel} /> },
    { key: 'created_at', label: 'Date', render: (r) => <span style={{ color: 'rgba(255,255,255,0.65)' }}>{fmtDate(r.created_at)}</span> },
  ];

  const pages = Math.ceil(total / 20);

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Commandes</h1>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)' }}>{total} commande{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(q); setPage(1); } }}
          placeholder="Rechercher…"
          style={{
            padding: '9px 14px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none', width: 220,
          }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none' }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select
          value={channel}
          onChange={(e) => { setChannel(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none' }}
        >
          <option value="">Tous les canaux</option>
          <option value="store">Boutique</option>
          <option value="online">En ligne</option>
        </select>
        {(q !== search || status || channel) && (
          <button onClick={() => { setQ(''); setSearch(''); setStatus(''); setChannel(''); setPage(1); }}
            style={{ padding: '9px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.65)', fontSize: 13, cursor: 'pointer' }}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#1e2614', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, overflow: 'hidden' }}>
        <AdminTable
          columns={columns}
          data={orders}
          loading={loading}
          onRowClick={(r) => router.push(`/admin/commandes/${r.uuid}`)}
          emptyMessage="Aucune commande trouvée."
        />
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '7px 14px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.92)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 13 }}>
            ← Précédent
          </button>
          <span style={{ padding: '7px 14px', color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '7px 14px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.92)', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1, fontSize: 13 }}>
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
