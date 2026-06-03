'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Modal from '@/components/admin/Modal';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface StockAlert {
  product_name: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  stock_alert: number;
  variant_uuid: string;
}

interface Movement {
  uuid: string;
  movement_type: string;
  quantity: number;
  reason: string;
  created_at: string;
  variant_sku?: string;
  product_name?: string;
  stock_before?: number;
  stock_after?: number;
}

const TYPE_LABELS: Record<string, string> = {
  in: 'Entrée', out: 'Sortie', adjustment: 'Ajustement', return: 'Retour',
};
const TYPE_COLORS: Record<string, string> = {
  in: '#6faa30', out: '#c9634a', adjustment: '#e6a817', return: '#4a8fc9',
};

const fmtDate = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none',
};

export default function StockPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingMov, setLoadingMov] = useState(true);
  const [movModal, setMovModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [movForm, setMovForm] = useState({ variant_uuid: '', movement_type: 'in', quantity: '1', reason: '' });
  const [saving, setSaving] = useState(false);

  const loadAlerts = () => {
    setLoadingAlerts(true);
    adminApi.getStockAlerts().then(setAlerts).catch(() => showToast('Erreur chargement alertes.', 'error')).finally(() => setLoadingAlerts(false));
  };

  const loadMovements = useCallback(() => {
    setLoadingMov(true);
    adminApi.listMovements({ size: 50, movement_type: typeFilter || undefined })
      .then((r) => setMovements(r.items ?? r))
      .catch(() => showToast('Erreur chargement mouvements.', 'error'))
      .finally(() => setLoadingMov(false));
  }, [typeFilter]);

  useEffect(() => { loadAlerts(); }, []);
  useEffect(() => { loadMovements(); }, [loadMovements]);

  const handleCreateMovement = async () => {
    if (!movForm.variant_uuid || !movForm.quantity) { showToast('UUID variante et quantité requis.', 'warning'); return; }
    setSaving(true);
    try {
      await adminApi.createMovement({
        variant_uuid: movForm.variant_uuid,
        movement_type: movForm.movement_type,
        quantity: parseInt(movForm.quantity),
        reason: movForm.reason,
      });
      showToast('Mouvement enregistré.', 'success');
      setMovModal(false);
      loadMovements();
      loadAlerts();
    } catch {
      showToast('Erreur création mouvement.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const movColumns: Column<Movement>[] = [
    {
      key: 'movement_type', label: 'Type',
      render: (r) => (
        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, background: `${TYPE_COLORS[r.movement_type]}18`, color: TYPE_COLORS[r.movement_type], fontWeight: 500 }}>
          {TYPE_LABELS[r.movement_type] ?? r.movement_type}
        </span>
      ),
    },
    { key: 'product_name', label: 'Produit', render: (r) => <span style={{ color: 'rgba(255,255,255,0.92)' }}>{r.product_name ?? '—'}</span> },
    { key: 'variant_sku', label: 'SKU', render: (r) => <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.65)' }}>{r.variant_sku ?? '—'}</span> },
    {
      key: 'quantity', label: 'Quantité',
      render: (r) => <span style={{ color: r.movement_type === 'out' ? '#c9634a' : '#6faa30', fontWeight: 600 }}>
        {r.movement_type === 'out' ? '-' : '+'}{r.quantity}
      </span>,
    },
    { key: 'stock_before', label: 'Avant', render: (r) => <span style={{ color: 'rgba(255,255,255,0.65)' }}>{r.stock_before ?? '—'}</span> },
    { key: 'stock_after', label: 'Après', render: (r) => <span style={{ color: 'rgba(240,234,210,0.7)' }}>{r.stock_after ?? '—'}</span> },
    { key: 'reason', label: 'Raison', render: (r) => <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{r.reason || '—'}</span> },
    { key: 'created_at', label: 'Date', render: (r) => <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>{fmtDate(r.created_at)}</span> },
  ];

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Gestion du stock</h1>
        <button onClick={() => setMovModal(true)}
          style={{ padding: '9px 18px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1c2310', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          + Nouveau mouvement
        </button>
      </div>

      {/* Alerts */}
      {(alerts.length > 0 || loadingAlerts) && (
        <div style={{ background: 'rgba(201,99,74,0.05)', border: '1px solid rgba(201,99,74,0.2)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: '#c9634a', margin: '0 0 16px' }}>
            ⚠ Alertes stock{!loadingAlerts ? ` (${alerts.length})` : ''}
          </h2>
          {loadingAlerts ? (
            <div style={{ height: 60, background: 'rgba(201,99,74,0.08)', borderRadius: 8, animation: 'adminPulse 1.5s infinite' }} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201,99,74,0.1)' }}>
                    {['Produit', 'SKU', 'Taille', 'Couleur', 'Stock actuel', 'Seuil'].map(h => (
                      <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(201,99,74,0.6)', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(201,99,74,0.06)' }}>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>{a.product_name}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{a.sku}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(240,234,210,0.7)' }}>{a.size}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(240,234,210,0.7)' }}>{a.color}</td>
                      <td style={{ padding: '10px 12px', color: '#c9634a', fontWeight: 700 }}>{a.stock}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.58)' }}>{a.stock_alert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Movements */}
      <div style={{ background: '#1e2614', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', margin: 0 }}>Mouvements de stock</h2>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '7px 12px', background: '#0f1209', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 12, outline: 'none' }}>
            <option value="">Tous les types</option>
            <option value="in">Entrée</option>
            <option value="out">Sortie</option>
            <option value="adjustment">Ajustement</option>
            <option value="return">Retour</option>
          </select>
        </div>
        <AdminTable columns={movColumns} data={movements} loading={loadingMov} emptyMessage="Aucun mouvement de stock." />
      </div>

      {/* New movement modal */}
      <Modal open={movModal} onClose={() => setMovModal(false)} title="Nouveau mouvement de stock" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>UUID de la variante *</label>
            <input value={movForm.variant_uuid} onChange={(e) => setMovForm(p => ({ ...p, variant_uuid: e.target.value }))} placeholder="uuid-de-la-variante" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Type de mouvement *</label>
            <select value={movForm.movement_type} onChange={(e) => setMovForm(p => ({ ...p, movement_type: e.target.value }))} style={inputStyle}>
              <option value="in">Entrée</option>
              <option value="out">Sortie</option>
              <option value="adjustment">Ajustement</option>
              <option value="return">Retour</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Quantité *</label>
            <input type="number" min="1" value={movForm.quantity} onChange={(e) => setMovForm(p => ({ ...p, quantity: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Raison</label>
            <input value={movForm.reason} onChange={(e) => setMovForm(p => ({ ...p, reason: e.target.value }))} placeholder="Ex: Réapprovisionnement" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => setMovModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={handleCreateMovement} disabled={saving} style={{ flex: 1, padding: '10px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1c2310', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </Modal>

      <style>{`@keyframes adminPulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }`}</style>
    </div>
  );
}
