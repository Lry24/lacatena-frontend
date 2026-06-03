'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleString('fr-FR');

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
};

interface OrderDetail {
  uuid: string;
  order_number: string;
  status: string;
  channel: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address?: Record<string, string>;
  items: { product_name: string; sku: string; size: string; color: string; quantity: number; unit_price: number; subtotal: number }[];
  subtotal_ht: number;
  tva_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_ttc: number;
  notes: string;
  internal_notes: string;
  payment_method: string;
}

export default function CommandeDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [refundModal, setRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [restock, setRestock] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getOrder(uuid)
      .then((d) => { setOrder(d); setNewStatus(d.status); setNotes(d.internal_notes ?? ''); })
      .catch(() => showToast('Erreur chargement commande.', 'error'))
      .finally(() => setLoading(false));
  }, [uuid]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return;
    setSaving(true);
    try {
      await adminApi.updateOrderStatus(uuid, { status: newStatus, internal_notes: notes });
      setOrder({ ...order, status: newStatus, internal_notes: notes });
      showToast('Statut mis à jour.', 'success');
    } catch {
      showToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason) { showToast('Veuillez indiquer une raison.', 'warning'); return; }
    setSaving(true);
    try {
      await adminApi.refundOrder(uuid, { reason: refundReason, restock });
      setOrder(order ? { ...order, status: 'refunded' } : order);
      setRefundModal(false);
      showToast('Remboursement effectué.', 'success');
    } catch {
      showToast('Erreur lors du remboursement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E8B96A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) return <div style={{ color: 'rgba(240,234,210,0.5)', textAlign: 'center', paddingTop: 80 }}>Commande introuvable.</div>;

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push('/admin/commandes')}
          style={{ background: 'none', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 6, padding: '6px 12px', color: 'rgba(240,234,210,0.5)', cursor: 'pointer', fontSize: 12 }}>
          ← Retour
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0ead2', margin: 0 }}>
          Commande <span style={{ color: '#E8B96A' }}>{order.order_number}</span>
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Info */}
          <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
            <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.4)', margin: '0 0 16px' }}>Informations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Date', fmtDate(order.created_at)],
                ['Canal', order.channel === 'store' ? 'Boutique' : 'En ligne'],
                ['Paiement', order.payment_method],
                ['Client', order.customer_name],
                ['E-mail', order.customer_email || '—'],
                ['Téléphone', order.customer_phone || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: 'rgba(240,234,210,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#f0ead2' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
            <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.4)', margin: '0 0 16px' }}>Articles</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(240,234,210,0.06)' }}>
                  {['Produit', 'SKU', 'Taille', 'Couleur', 'Qté', 'Prix unit.', 'Sous-total'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'rgba(240,234,210,0.4)', fontWeight: 400, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(order.items ?? []).map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(240,234,210,0.04)' }}>
                    <td style={{ padding: '10px 8px', color: '#f0ead2' }}>{item.product_name}</td>
                    <td style={{ padding: '10px 8px', color: 'rgba(240,234,210,0.5)', fontFamily: 'monospace', fontSize: 11 }}>{item.sku}</td>
                    <td style={{ padding: '10px 8px', color: 'rgba(240,234,210,0.6)' }}>{item.size}</td>
                    <td style={{ padding: '10px 8px', color: 'rgba(240,234,210,0.6)' }}>{item.color}</td>
                    <td style={{ padding: '10px 8px', color: '#f0ead2', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 8px', color: '#f0ead2', textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                    <td style={{ padding: '10px 8px', color: '#E8B96A', fontWeight: 500, textAlign: 'right' }}>{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ borderTop: '1px solid rgba(240,234,210,0.08)', marginTop: 16, paddingTop: 16 }}>
              {[
                ['Sous-total HT', fmt(order.subtotal_ht)],
                ['TVA', fmt(order.tva_amount)],
                ['Livraison', fmt(order.shipping_cost)],
                order.discount_amount ? ['Réduction', `-${fmt(order.discount_amount)}`] : null,
              ].filter(Boolean).map((item) => { const [k, v] = item as [string, string]; return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: 'rgba(240,234,210,0.6)' }}>
                  <span>{k}</span><span>{v}</span>
                </div>); })}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: 16, fontWeight: 700, color: '#f0ead2', borderTop: '1px solid rgba(240,234,210,0.08)', marginTop: 8 }}>
                <span>Total TTC</span><span style={{ color: '#E8B96A' }}>{fmt(order.total_ttc)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
            <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.4)', margin: '0 0 12px' }}>Notes internes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,234,210,0.1)',
                borderRadius: 8, color: '#f0ead2', fontSize: 13, resize: 'vertical', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Right — Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
            <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.4)', margin: '0 0 16px' }}>Changer le statut</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving}
              style={{ width: '100%', padding: '10px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1a1f0e', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>

          {order.status !== 'refunded' && order.status !== 'cancelled' && (
            <button
              onClick={() => setRefundModal(true)}
              style={{
                padding: '11px', background: 'rgba(201,99,74,0.1)', border: '1px solid rgba(201,99,74,0.3)',
                borderRadius: 8, color: '#c9634a', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Rembourser la commande
            </button>
          )}
        </div>
      </div>

      {/* Refund modal */}
      <Modal open={refundModal} onClose={() => setRefundModal(false)} title="Remboursement">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'rgba(240,234,210,0.5)', marginBottom: 8 }}>Raison du remboursement *</label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none', resize: 'none' }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(240,234,210,0.7)', marginBottom: 20, cursor: 'pointer' }}>
          <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
          Remettre en stock
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setRefundModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: 'rgba(240,234,210,0.6)', cursor: 'pointer', fontSize: 13 }}>
            Annuler
          </button>
          <button onClick={handleRefund} disabled={saving} style={{ flex: 1, padding: '10px', background: '#c9634a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {saving ? 'Traitement…' : 'Confirmer le remboursement'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
