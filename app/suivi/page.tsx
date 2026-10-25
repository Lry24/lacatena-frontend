'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductImg from '@/components/shop/ProductImg';
import { Button, ErrorNote, Field, Input, Loading, PageHeading, label } from '@/components/ui';
import { api, invoiceUrl } from '@/lib/api';
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, TRACK_STEPS, fcfa, formatDate } from '@/lib/format';
import type { TrackedOrder } from '@/lib/types';
import { useOrders } from '@/store/orders';

function Progress({ order }: { order: TrackedOrder }) {
  if (order.status === 'CANCELLED' || order.status === 'RETURNED') {
    return (
      <div style={{ border: '0.5px solid rgba(232,160,138,0.4)', background: 'rgba(232,160,138,0.06)', padding: '20px 24px', borderRadius: 4 }}>
        <p className="font-serif" style={{ fontSize: 22, color: '#F0C2B4' }}>{ORDER_STATUS[order.status].label}</p>
        <p style={{ fontSize: 13, color: 'var(--cream-muted)', marginTop: 6 }}>
          {order.status === 'CANCELLED' ? 'Cette commande a été annulée. Une question ? Contactez-nous, nous sommes là pour vous.' : 'Le retour de cette commande a été enregistré.'}
        </p>
      </div>
    );
  }
  const reached = new Map(order.history.map((h) => [h.status, h.at]));
  // Retrait en boutique : « Prête » mène directement à « Livrée »
  const steps = TRACK_STEPS.filter((s) => s.status !== 'SHIPPED' || reached.has('SHIPPED') || order.status !== 'DELIVERED');
  const currentIndex = steps.findIndex((s) => s.status === order.status);
  return (
    <ol className="flex flex-col md:flex-row gap-0">
      {steps.map((s, i) => {
        const done = i <= currentIndex;
        const current = i === currentIndex;
        return (
          <li key={s.status} className="flex md:flex-col gap-4 md:gap-3 flex-1 relative pb-6 md:pb-0">
            <div className="flex md:items-center flex-col md:flex-row">
              <span className="flex items-center justify-center flex-shrink-0 transition-all" style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 11, zIndex: 1,
                background: done ? 'var(--gold)' : '#1A1F0E', color: done ? '#2D3A0F' : 'var(--cream-muted)',
                border: done ? 'none' : '0.5px solid rgba(240,234,210,0.25)', boxShadow: current ? '0 0 0 6px rgba(232,185,106,0.15)' : 'none',
              }}>{done && !current ? '✓' : i + 1}</span>
              {i < steps.length - 1 && <span className="hidden md:block flex-1" style={{ height: 1, background: i < currentIndex ? 'var(--gold)' : 'var(--border)' }} />}
              {i < steps.length - 1 && <span className="md:hidden absolute" style={{ left: 13.5, top: 28, bottom: 0, width: 1, background: i < currentIndex ? 'var(--gold)' : 'var(--border)' }} />}
            </div>
            <div className="md:pr-4">
              <p style={{ fontSize: 13, color: done ? 'var(--cream)' : 'var(--cream-muted)', fontWeight: current ? 500 : 400 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: 'rgba(248,242,228,0.45)', marginTop: 2, lineHeight: 1.5 }}>
                {reached.get(s.status) ? formatDate(reached.get(s.status)!, true) : s.hint}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Tracking() {
  const params = useSearchParams();
  const router = useRouter();
  const saved = useOrders((s) => s.orders);
  const [number, setNumber] = useState(params.get('commande') || '');
  const [phone, setPhone] = useState(params.get('tel') || '');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = useCallback(async (n: string, p: string) => {
    if (!n.trim() || p.replace(/\D/g, '').length < 8) { setError('Indiquez le numéro de commande et le téléphone utilisé lors de l’achat.'); return; }
    setLoading(true); setError('');
    try {
      setOrder(await api<TrackedOrder>(`/api/v1/orders/${encodeURIComponent(n.trim())}/track`, { query: { phone: p } }));
      router.replace(`/suivi?commande=${encodeURIComponent(n.trim().toUpperCase())}`, { scroll: false });
    } catch (e) {
      setOrder(null); setError((e as Error).message);
    } finally { setLoading(false); }
  }, [router]);

  // Arrivée depuis la confirmation, un e-mail ou « Mes commandes » : recherche automatique
  useEffect(() => {
    const n = params.get('commande');
    const p = n ? params.get('tel') || saved.find((o) => o.number === n.toUpperCase())?.phone : null;
    if (!n || !p) return;
    api<TrackedOrder>(`/api/v1/orders/${encodeURIComponent(n)}/track`, { query: { phone: p } })
      .then((o) => { setOrder(o); setNumber(o.number); setPhone(p); })
      .catch((e) => setError((e as Error).message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeading eyebrow="Suivi" title="Où en est ma commande ?">
        Votre numéro de commande (LC-…) et le téléphone utilisé lors de l&apos;achat suffisent.
      </PageHeading>

      <form onSubmit={(e) => { e.preventDefault(); lookup(number, phone); }} className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end mb-12">
        <Field label="Numéro de commande"><Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="LC-2026-XXXXXX" autoCapitalize="characters" /></Field>
        <Field label="Téléphone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+228 90 00 00 00" /></Field>
        <Button type="submit" disabled={loading}>{loading ? 'Recherche…' : 'Suivre'}</Button>
      </form>

      {error && <div className="mb-10"><ErrorNote>{error}</ErrorNote></div>}
      {loading && <Loading text="Recherche de votre commande…" />}

      {order && !loading && (
        <div className="animate-fade-up flex flex-col gap-10">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <p style={label}>Commande du {formatDate(order.created_at)}</p>
              <p className="font-serif" style={{ fontSize: 34, color: 'var(--gold)', marginTop: 6 }}>{order.number}</p>
              <p style={{ fontSize: 14, color: 'var(--cream-muted)', marginTop: 6 }}>Bonjour {order.first_name}, voici où en est votre commande.</p>
            </div>
            <a href={invoiceUrl(order.number, phone)} className="hover:text-[#f5cb85]" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.4)', padding: '11px 20px' }}>
              Facture PDF ↓
            </a>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '32px 28px' }}>
            <Progress order={order} />
          </div>

          <div className="grid lg:grid-cols-[1fr_340px] gap-10">
            <ul className="flex flex-col" style={{ borderTop: '0.5px solid var(--border)' }}>
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-4 py-5 items-center" style={{ borderBottom: '0.5px solid var(--border)' }}>
                  <div className="relative overflow-hidden flex-shrink-0" style={{ width: 60, height: 80, background: 'rgba(255,255,255,0.03)' }}><ProductImg src={i.image_url} alt={i.product_name} sizes="60px" /></div>
                  <div className="flex-1 min-w-0">
                    {i.product_slug ? <Link href={`/produits/${i.product_slug}`} className="hover:text-[#E8B96A]" style={{ fontSize: 14 }}>{i.product_name}</Link> : <p style={{ fontSize: 14 }}>{i.product_name}</p>}
                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 2 }}>{i.variant_label !== 'Taille unique' ? `Taille ${i.variant_label} · ` : ''}Qté {i.quantity}</p>
                  </div>
                  <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{fcfa(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 8, padding: 24, alignSelf: 'start' }}>
              <div className="flex justify-between mb-2" style={{ fontSize: 13 }}><span style={{ color: 'var(--cream-muted)' }}>Sous-total</span><span>{fcfa(order.subtotal)}</span></div>
              <div className="flex justify-between mb-4" style={{ fontSize: 13 }}><span style={{ color: 'var(--cream-muted)' }}>Livraison</span><span>{order.shipping_cost ? fcfa(order.shipping_cost) : 'Offerte'}</span></div>
              <div className="flex justify-between items-baseline mb-5"><span>Total</span><span className="font-serif" style={{ fontSize: 24, color: 'var(--gold)' }}>{fcfa(order.total)}</span></div>
              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 16 }} />
              <p style={{ fontSize: 12, color: 'var(--cream-muted)', lineHeight: 1.8 }}>
                {order.shipping_rate_name}<br />{order.city}<br />{PAYMENT_METHOD[order.payment_method]} · <span style={{ color: 'var(--gold)' }}>{PAYMENT_STATUS[order.payment_status]?.label}</span>
              </p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Une question sur votre commande ? <Link href="/contact" style={{ color: 'var(--gold)' }}>Contactez-nous</Link>, en rappelant le numéro {order.number}.</p>
        </div>
      )}

      {!order && !loading && saved.length > 0 && (
        <div>
          <p style={{ ...label, marginBottom: 16 }}>Commandes passées depuis cet appareil</p>
          <div className="flex flex-wrap gap-3">
            {saved.slice(0, 6).map((o) => (
              <button key={o.number} onClick={() => { setNumber(o.number); setPhone(o.phone); lookup(o.number, o.phone); }}
                className="hover:border-[#E8B96A]" style={{ border: '0.5px solid var(--border)', padding: '12px 16px', textAlign: 'left', borderRadius: 4 }}>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--gold)' }}>{o.number}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--cream-muted)', marginTop: 2 }}>{formatDate(o.createdAt)} · {fcfa(o.total)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function SuiviPage() {
  return (
    <ShopShell narrow>
      <Suspense fallback={<Loading />}><Tracking /></Suspense>
    </ShopShell>
  );
}
