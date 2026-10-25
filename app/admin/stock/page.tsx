'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { A, AField, AInput, ASelect, Alert, Badge, Btn, Card, Modal, PageTitle, Pager, Spin, Table, td, useFetch } from '@/components/admin/kit';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { MOVEMENT_TYPE, formatDate } from '@/lib/format';
import type { Page } from '@/lib/types';

interface Movement { id: number; product_id: number; product_name: string; variant_label: string | null; type: string; quantity_change: number; quantity_after: number; reference_type: string | null; reference_id: number | null; note: string | null; actor: string | null; created_at: string }
interface StockRow { variant_id: number; product_id: number; product_name: string; brand: string | null; label: string; stock: number }

const TONE: Record<string, string> = { PURCHASE: 'green', SALE: 'gold', RETURN: 'olive', ADJUSTMENT: 'cream', LOSS: 'red' };

function MovementForm({ onDone }: { onDone: () => void }) {
  const toast = useToast((s) => s.show);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<StockRow[]>([]);
  const [picked, setPicked] = useState<StockRow | null>(null);
  const [type, setType] = useState('PURCHASE');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const searching = !picked && q.trim().length >= 2;
  useEffect(() => {
    if (!searching) return;
    const t = setTimeout(() => api<StockRow[]>('/api/v1/admin/inventory/variants', { query: { q } }).then(setResults).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [q, searching]);

  const n = Number(qty) || 0;
  const change = type === 'ADJUSTMENT' && picked ? n - picked.stock : type === 'LOSS' ? -Math.abs(n) : Math.abs(n);

  const submit = async () => {
    if (!picked) return;
    setError('');
    try {
      await api('/api/v1/admin/inventory/movements', { method: 'POST', body: { variant_id: picked.variant_id, change, type, note: note || null } });
      toast('Mouvement de stock enregistré');
      onDone();
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="flex flex-col gap-4">
      {!picked ? (
        <AField label="Pièce et taille">
          <AInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tapez un nom, une marque…" autoFocus />
          {searching && results.length > 0 && (
            <div style={{ border: `1px solid ${A.border}`, borderRadius: 7, maxHeight: 240, overflowY: 'auto' }}>
              {results.map((r) => (
                <button key={r.variant_id} type="button" onClick={() => setPicked(r)} className="flex w-full justify-between hover:bg-white/5" style={{ padding: '8px 12px', fontSize: 13, textAlign: 'left' }}>
                  <span>{r.product_name} <span style={{ color: A.faint }}>· {r.label}</span></span><span style={{ color: A.muted }}>{r.stock} en stock</span>
                </button>
              ))}
            </div>
          )}
        </AField>
      ) : (
        <div className="flex justify-between items-center" style={{ background: A.bg, borderRadius: 7, padding: '10px 12px' }}>
          <span style={{ fontSize: 13 }}>{picked.product_name} · <strong style={{ fontWeight: 500 }}>{picked.label}</strong> <span style={{ color: A.muted }}>({picked.stock} en stock)</span></span>
          <button onClick={() => setPicked(null)} style={{ fontSize: 12, color: A.gold }}>Changer</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <AField label="Type">
          <ASelect value={type} onChange={(e) => setType(e.target.value)}>
            <option value="PURCHASE">Réception de marchandise (+)</option>
            <option value="LOSS">Perte / défaut (−)</option>
            <option value="ADJUSTMENT">Inventaire (stock compté)</option>
          </ASelect>
        </AField>
        <AField label={type === 'ADJUSTMENT' ? 'Stock compté' : 'Quantité'}><AInput type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} /></AField>
      </div>
      <AField label="Motif (facultatif)"><AInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Arrivage fournisseur, retouche ratée, inventaire mensuel…" /></AField>
      {picked && n > 0 && <p style={{ fontSize: 12, color: A.muted }}>Stock après : <strong style={{ color: A.gold }}>{picked.stock + change}</strong> ({change >= 0 ? '+' : ''}{change})</p>}
      {error && <Alert>{error}</Alert>}
      <div className="flex justify-end"><Btn onClick={submit} disabled={!picked || (!n && type !== 'ADJUSTMENT') || change === 0}>Enregistrer</Btn></div>
    </div>
  );
}

export default function StockPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [open, setOpen] = useState(false);
  const { data, error, reload } = useFetch<Page<Movement>>('/api/v1/admin/inventory/movements', { page, type, size: 30 });

  return (
    <>
      <PageTitle title="Stock" subtitle="Chaque entrée et sortie est tracée : ventes, annulations, réceptions, inventaires."
        actions={<><Btn variant="ghost" href="/admin/produits?stock=low">Stocks bas</Btn><Btn onClick={() => setOpen(true)}>+ Mouvement de stock</Btn></>} />
      <Card pad={12}>
        <div className="flex gap-2 flex-wrap mb-3">
          {['', 'SALE', 'PURCHASE', 'RETURN', 'ADJUSTMENT', 'LOSS'].map((t) => (
            <button key={t || 'all'} onClick={() => { setType(t); setPage(1); }}
              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, border: `1px solid ${t === type ? A.gold : A.border}`, background: t === type ? A.goldBg : 'transparent', color: t === type ? A.gold : A.muted }}>
              {t ? MOVEMENT_TYPE[t] : 'Tous'}
            </button>
          ))}
        </div>
        {error && <Alert>{error}</Alert>}
        {!data ? <Spin /> : (
          <>
            <Table head={['Date', 'Pièce', 'Taille', 'Mouvement', 'Variation', 'Stock après', 'Motif']} empty={!data.items.length && 'Aucun mouvement.'}>
              {data.items.map((m) => (
                <tr key={m.id}>
                  <td style={{ ...td, color: A.muted, whiteSpace: 'nowrap' }}>{formatDate(m.created_at, true)}</td>
                  <td style={td}><Link href={`/admin/produits/${m.product_id}`} className="hover:text-[#E8B96A]">{m.product_name}</Link></td>
                  <td style={{ ...td, color: A.muted }}>{m.variant_label || '—'}</td>
                  <td style={td}><Badge tone={TONE[m.type]}>{MOVEMENT_TYPE[m.type] || m.type}</Badge></td>
                  <td style={{ ...td, color: m.quantity_change > 0 ? A.green : A.red, fontWeight: 500 }}>{m.quantity_change > 0 ? '+' : ''}{m.quantity_change}</td>
                  <td style={td}>{m.quantity_after}</td>
                  <td style={{ ...td, color: A.muted, fontSize: 12 }}>{m.note}{m.actor ? <span style={{ color: A.faint }}> · {m.actor}</span> : null}</td>
                </tr>
              ))}
            </Table>
            <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
      {open && <Modal title="Mouvement de stock" onClose={() => setOpen(false)}><MovementForm onDone={() => { setOpen(false); reload(); }} /></Modal>}
    </>
  );
}
