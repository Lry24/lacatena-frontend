'use client';
import React, { useEffect, useState, useCallback } from 'react';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import Modal from '@/components/admin/Modal';
import StatusBadge from '@/components/admin/StatusBadge';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface Customer {
  uuid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  orders_count?: number;
  created_at?: string;
}

interface CustomerOrder {
  uuid: string;
  order_number: string;
  total_ttc: number;
  status: string;
  created_at: string;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('fr-FR');

export default function ClientsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [detail, setDetail] = useState<Customer | null>(null);
  const [detailOrders, setDetailOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi.listCustomers({ page, size: 20, q: search || undefined, is_active: activeFilter !== '' ? activeFilter === 'true' : undefined })
      .then((r) => { setCustomers(r.items ?? r); setTotal(r.total ?? r.length); })
      .catch(() => showToast('Erreur chargement clients.', 'error'))
      .finally(() => setLoading(false));
  }, [page, search, activeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminApi.toggleCustomerActive(uuid);
      setCustomers((prev) => prev.map((c) => c.uuid === uuid ? { ...c, is_active: !c.is_active } : c));
      showToast('Statut mis à jour.', 'success');
    } catch {
      showToast('Erreur toggle client.', 'error');
    }
  };

  const openDetail = async (cust: Customer) => {
    setDetail(cust);
    setLoadingOrders(true);
    try {
      const orders = await adminApi.getCustomerOrders(cust.uuid);
      setDetailOrders(orders?.items ?? orders ?? []);
    } catch {
      setDetailOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'full_name', label: 'Nom',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500, color: 'rgba(255,255,255,0.92)' }}>{r.full_name}</div>
        </div>
      ),
    },
    { key: 'email', label: 'E-mail', render: (r) => <span style={{ color: 'rgba(240,234,210,0.7)', fontSize: 12 }}>{r.email}</span> },
    { key: 'phone', label: 'Téléphone', render: (r) => <span style={{ color: 'rgba(255,255,255,0.65)' }}>{r.phone ?? '—'}</span> },
    { key: 'role', label: 'Type', render: (r) => <StatusBadge status={r.role} /> },
    { key: 'is_active', label: 'Statut', render: (r) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
    { key: 'orders_count', label: 'Commandes', render: (r) => <span style={{ color: '#E8B96A', fontWeight: 500 }}>{r.orders_count ?? 0}</span> },
    { key: 'created_at', label: 'Inscription', render: (r) => <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>{r.created_at ? fmtDate(r.created_at) : '—'}</span> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <button
          onClick={(e) => handleToggle(r.uuid, e)}
          style={{ padding: '5px 10px', background: r.is_active ? 'rgba(201,99,74,0.1)' : 'rgba(111,170,48,0.1)', border: `1px solid ${r.is_active ? 'rgba(201,99,74,0.2)' : 'rgba(111,170,48,0.2)'}`, borderRadius: 6, color: r.is_active ? '#c9634a' : '#6faa30', cursor: 'pointer', fontSize: 11 }}>
          {r.is_active ? 'Désactiver' : 'Activer'}
        </button>
      ),
    },
  ];

  const pages = Math.ceil(total / 20);

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Clients</h1>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)' }}>{total} client{total !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(q); setPage(1); } }}
          placeholder="Rechercher un client…"
          style={{ padding: '8px 12px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none', width: 240 }}
        />
        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', background: '#1e2614', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none' }}>
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      <div style={{ background: '#1e2614', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, overflow: 'hidden' }}>
        <AdminTable columns={columns} data={customers} loading={loading} onRowClick={openDetail} emptyMessage="Aucun client trouvé." />
      </div>

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

      {/* Client detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail client" width={620}>
        {detail && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                ['Nom', detail.full_name],
                ['E-mail', detail.email],
                ['Téléphone', detail.phone ?? '—'],
                ['Rôle', detail.role],
                ['Statut', detail.is_active ? 'Actif' : 'Inactif'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.58)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', marginBottom: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.09)' }}>
              Commandes
            </div>
            {loadingOrders ? (
              <div style={{ height: 60, background: 'rgba(240,234,210,0.04)', borderRadius: 8, animation: 'adminPulse 1.5s infinite' }} />
            ) : detailOrders.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Aucune commande.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
                    {['N°', 'Total', 'Statut', 'Date'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'rgba(255,255,255,0.58)', fontWeight: 400, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailOrders.map((o) => (
                    <tr key={o.uuid} style={{ borderBottom: '1px solid rgba(240,234,210,0.04)' }}>
                      <td style={{ padding: '8px', color: '#E8B96A', fontWeight: 500 }}>{o.order_number}</td>
                      <td style={{ padding: '8px', color: 'rgba(255,255,255,0.92)' }}>{fmt(o.total_ttc)}</td>
                      <td style={{ padding: '8px' }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding: '8px', color: 'rgba(255,255,255,0.58)' }}>{fmtDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
      <style>{`@keyframes adminPulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }`}</style>
    </div>
  );
}
