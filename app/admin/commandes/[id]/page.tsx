'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { A, AField, AInput, ATextarea, Alert, Badge, Btn, Card, Modal, PageTitle, Spin, useFetch } from '@/components/admin/kit';
import ProductImg from '@/components/shop/ProductImg';
import { useToast } from '@/components/ui';
import { API_URL, api } from '@/lib/api';
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, STATUS_ACTION, fcfa, formatDate } from '@/lib/format';
import type { AdminOrder } from '@/lib/types';
import { useAdmin } from '@/store/admin';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, error, setData } = useFetch<AdminOrder>(`/api/v1/admin/orders/${id}`);
  const toast = useToast((s) => s.show);
  const token = useAdmin((s) => s.token);
  const [target, setTarget] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [internal, setInternal] = useState('');

  if (error) return <Alert>{error}</Alert>;
  if (!order) return <Spin />;

  const run = async (fn: () => Promise<AdminOrder>, ok: string, close: () => void) => {
    setBusy(true); setActionError('');
    try { setData(await fn()); toast(ok); close(); } catch (e) { setActionError((e as Error).message); } finally { setBusy(false); }
  };

  const changeStatus = () => target && run(
    () => api<AdminOrder>(`/api/v1/admin/orders/${order.id}/status`, { method: 'POST', body: { status: target, note: note || null } }),
    `Commande ${ORDER_STATUS[target].label.toLowerCase()}`, () => { setTarget(null); setNote(''); });

  const pay = () => run(
    () => api<AdminOrder>(`/api/v1/admin/orders/${order.id}/payments`, { method: 'POST', body: { amount: Number(amount), reference: reference || null } }),
    'Paiement enregistré', () => { setPayOpen(false); setAmount(''); setReference(''); });

  const addNote = () => internal.trim() && run(
    () => api<AdminOrder>(`/api/v1/admin/orders/${order.id}/notes`, { method: 'POST', body: { note: internal } }),
    'Note ajoutée', () => setInternal(''));

  const openInvoice = async () => {
    const res = await fetch(`${API_URL}/api/v1/admin/orders/${order.id}/invoice`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { toast('Facture indisponible', 'error'); return; }
    window.open(URL.createObjectURL(await res.blob()), '_blank');
  };

  const st = ORDER_STATUS[order.status];
  const forward = order.next_statuses.filter((s) => !['CANCELLED', 'RETURNED'].includes(s));
  const backward = order.next_statuses.filter((s) => ['CANCELLED', 'RETURNED'].includes(s));
  const phoneDigits = order.customer.phone.replace(/\D/g, '');

  return (
    <>
      <Link href="/admin/commandes" style={{ fontSize: 12, color: A.muted }}>← Commandes</Link>
      <div className="mt-3">
        <PageTitle title={order.number}
          subtitle={<span className="flex flex-wrap gap-2 items-center">Passée le {formatDate(order.created_at, true)} <Badge tone={st.tone}>{st.label}</Badge><Badge tone={PAYMENT_STATUS[order.payment_status]?.tone}>{PAYMENT_STATUS[order.payment_status]?.label}</Badge></span>}
          actions={<Btn variant="ghost" onClick={openInvoice}>Facture PDF</Btn>} />
      </div>

      {/* Actions principales */}
      {(forward.length > 0 || backward.length > 0) && (
        <Card style={{ marginBottom: 16, borderColor: order.status === 'PENDING' ? 'rgba(232,185,106,0.45)' : A.border }}>
          {order.status === 'PENDING' && (
            <p style={{ fontSize: 13, color: A.gold, marginBottom: 12 }}>
              À faire : appeler {order.customer.first_name} au <a href={`tel:${order.customer.phone}`} style={{ textDecoration: 'underline' }}>{order.customer.phone}</a> pour confirmer tailles, adresse et paiement.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {forward.map((s) => <Btn key={s} onClick={() => setTarget(s)}>{STATUS_ACTION[s]}</Btn>)}
            {backward.map((s) => <Btn key={s} variant="danger" onClick={() => setTarget(s)}>{STATUS_ACTION[s]}</Btn>)}
            {order.balance_due > 0 && !['CANCELLED', 'RETURNED'].includes(order.status) && (
              <Btn variant="subtle" onClick={() => { setAmount(String(order.balance_due)); setPayOpen(true); }}>Enregistrer un paiement</Btn>
            )}
          </div>
        </Card>
      )}

      <div className="grid xl:grid-cols-[1fr_380px] gap-4">
        <div className="flex flex-col gap-4">
          <Card title={`Articles (${order.items.reduce((n, i) => n + i.quantity, 0)})`}>
            <ul className="flex flex-col">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-3 items-center py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="relative overflow-hidden flex-shrink-0" style={{ width: 48, height: 62, borderRadius: 4, background: A.bg }}><ProductImg src={i.image_url} alt={i.product_name} sizes="48px" /></div>
                  <div className="flex-1 min-w-0">
                    {i.product_id ? <Link href={`/admin/produits/${i.product_id}`} className="hover:text-[#E8B96A]" style={{ fontSize: 14 }}>{i.product_name}</Link> : <span style={{ fontSize: 14 }}>{i.product_name}</span>}
                    <p style={{ fontSize: 12, color: A.muted }}>{[i.brand, i.variant_label && i.variant_label !== 'Taille unique' ? `Taille ${i.variant_label}` : null].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span style={{ fontSize: 13, color: A.muted, whiteSpace: 'nowrap' }}>{i.quantity} × {fcfa(i.unit_price)}</span>
                  <span style={{ fontSize: 14, minWidth: 110, textAlign: 'right' }}>{fcfa(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-1.5 mt-4 ml-auto" style={{ maxWidth: 320, fontSize: 13 }}>
              <div className="flex justify-between"><span style={{ color: A.muted }}>Sous-total</span><span>{fcfa(order.subtotal)}</span></div>
              <div className="flex justify-between"><span style={{ color: A.muted }}>Livraison</span><span>{order.shipping_cost ? fcfa(order.shipping_cost) : 'Offerte'}</span></div>
              <div className="flex justify-between" style={{ fontSize: 16, marginTop: 4 }}><span>Total</span><span className="font-serif" style={{ color: A.gold, fontSize: 20 }}>{fcfa(order.total)}</span></div>
              <div className="flex justify-between"><span style={{ color: A.muted }}>Encaissé</span><span style={{ color: A.green }}>{fcfa(order.amount_paid)}</span></div>
              {order.balance_due > 0 && <div className="flex justify-between"><span style={{ color: A.muted }}>Reste dû</span><span style={{ color: A.gold }}>{fcfa(order.balance_due)}</span></div>}
            </div>
          </Card>

          <Card title="Historique">
            <ol className="flex flex-col gap-0">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="flex gap-3" style={{ paddingBottom: 14 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: h.internal ? 'transparent' : A.gold, border: `1px solid ${A.gold}` }} />
                  <div className="flex-1">
                    <p style={{ fontSize: 13 }}>
                      {h.internal ? <span style={{ color: A.muted }}>Note interne</span> : <>{h.from_status ? 'Passée à ' : ''}<strong style={{ fontWeight: 500 }}>{ORDER_STATUS[h.status]?.label}</strong></>}
                      <span style={{ color: A.faint }}> · {formatDate(h.at, true)}{h.actor ? ` · ${h.actor}` : ''}</span>
                    </p>
                    {h.note && <p style={{ fontSize: 13, color: A.muted, marginTop: 2 }}>{h.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex gap-2 mt-2">
              <AInput value={internal} onChange={(e) => setInternal(e.target.value)} placeholder="Note interne (jamais visible par la cliente)…" onKeyDown={(e) => e.key === 'Enter' && addNote()} />
              <Btn variant="subtle" onClick={addNote} disabled={!internal.trim() || busy}>Ajouter</Btn>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Cliente / client">
            <p style={{ fontSize: 16 }}>{order.customer.first_name} {order.customer.last_name}</p>
            <p style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>{order.customer.phone}</p>
            {order.customer.email && <p style={{ fontSize: 13, color: A.muted }}>{order.customer.email}</p>}
            <div className="flex flex-wrap gap-2 mt-4">
              <Btn small variant="subtle" href={`tel:${order.customer.phone}`}>Appeler</Btn>
              <Btn small variant="subtle" href={`https://wa.me/${phoneDigits.length === 8 ? `228${phoneDigits}` : phoneDigits}?text=${encodeURIComponent(`Bonjour ${order.customer.first_name}, ici La Catena au sujet de votre commande ${order.number}.`)}`}>WhatsApp</Btn>
              {order.customer.id && <Btn small variant="ghost" href={`/admin/clients/${order.customer.id}`}>Fiche client</Btn>}
            </div>
          </Card>
          <Card title="Livraison">
            <p style={{ fontSize: 14 }}>{order.shipping.rate_name}</p>
            <p style={{ fontSize: 13, color: A.muted, marginTop: 8, lineHeight: 1.7 }}>
              {order.shipping.address}<br />{[order.shipping.neighborhood, order.shipping.city].filter(Boolean).join(', ')}<br />{order.shipping.country}
            </p>
            {order.shipping.instructions && <p style={{ fontSize: 13, color: A.gold, marginTop: 8 }}>« {order.shipping.instructions} »</p>}
          </Card>
          <Card title="Paiement">
            <p style={{ fontSize: 14 }}>{PAYMENT_METHOD[order.payment_method]}</p>
            {order.payments.map((p) => (
              <p key={p.id} style={{ fontSize: 12, color: A.muted, marginTop: 6 }}>
                {fcfa(p.amount_received)} / {fcfa(p.amount)} · {PAYMENT_STATUS[p.status]?.label}{p.reference ? ` · réf. ${p.reference}` : ''}
              </p>
            ))}
          </Card>
          {order.customer_note && <Card title="Message de la cliente"><p style={{ fontSize: 13, color: A.text, lineHeight: 1.6 }}>{order.customer_note}</p></Card>}
        </div>
      </div>

      {target && (
        <Modal title={STATUS_ACTION[target]} onClose={() => { setTarget(null); setActionError(''); }}>
          <p style={{ fontSize: 13, color: A.muted, marginBottom: 16, lineHeight: 1.6 }}>
            {target === 'CANCELLED' ? 'Les pièces reviennent en stock. La cliente voit la commande annulée dans son suivi.'
              : target === 'DELIVERED' ? `La remise vaut paiement du reste dû (${fcfa(order.balance_due)}).`
                : target === 'RETURNED' ? 'Les pièces reviennent en stock et le paiement est marqué remboursé.'
                  : `La commande passera à « ${ORDER_STATUS[target].label} ».`}
          </p>
          <AField label="Note (facultative, visible dans l'historique de l'équipe)"><ATextarea value={note} onChange={(e) => setNote(e.target.value)} /></AField>
          {actionError && <div className="mt-3"><Alert>{actionError}</Alert></div>}
          <div className="flex justify-end gap-2 mt-5">
            <Btn variant="ghost" onClick={() => setTarget(null)}>Annuler</Btn>
            <Btn variant={['CANCELLED', 'RETURNED'].includes(target) ? 'danger' : 'gold'} onClick={changeStatus} disabled={busy}>{busy ? '…' : 'Confirmer'}</Btn>
          </div>
        </Modal>
      )}

      {payOpen && (
        <Modal title="Enregistrer un paiement" onClose={() => { setPayOpen(false); setActionError(''); }}>
          <div className="flex flex-col gap-4">
            <AField label={`Montant reçu (reste dû : ${fcfa(order.balance_due)})`}><AInput type="number" min={1} max={order.balance_due} value={amount} onChange={(e) => setAmount(e.target.value)} /></AField>
            <AField label="Référence (facultative)" hint="N° de transaction Flooz / T-Money, reçu…"><AInput value={reference} onChange={(e) => setReference(e.target.value)} /></AField>
            {actionError && <Alert>{actionError}</Alert>}
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setPayOpen(false)}>Annuler</Btn>
              <Btn onClick={pay} disabled={busy || !Number(amount)}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
