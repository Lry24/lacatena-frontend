'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductImg from '@/components/shop/ProductImg';
import { Button, EmptyState, ErrorNote, Field, Input, Loading, PageHeading, Textarea, label, useMounted } from '@/components/ui';
import { api } from '@/lib/api';
import { delay, fcfa } from '@/lib/format';
import type { OrderCreated, ShippingRate } from '@/lib/types';
import { cartSubtotal, useCart } from '@/store/cart';
import { useOrders, type SavedContact } from '@/store/orders';

const EMPTY: SavedContact = { first_name: '', last_name: '', phone: '', email: '', city: 'Lomé', neighborhood: '', address: '', instructions: '' };

const PAYMENTS = [
  { value: 'CASH_ON_DELIVERY', title: 'Paiement à la livraison', text: 'Réglez en espèces à la remise de votre colis ou en boutique.' },
  { value: 'MOBILE_MONEY', title: 'Mobile Money', text: 'Flooz ou T-Money : nous vous envoyons les instructions lors de l’appel de confirmation.' },
];

export default function CheckoutPage() {
  const mounted = useMounted();
  const router = useRouter();
  const { lines, clear } = useCart();
  const { contact, save, rememberContact } = useOrders();
  const [form, setForm] = useState<SavedContact>(EMPTY);
  const [remember, setRemember] = useState(true);
  const [rates, setRates] = useState<ShippingRate[] | null>(null);
  const [rateId, setRateId] = useState<number | null>(null);
  const [payment, setPayment] = useState('CASH_ON_DELIVERY');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SavedContact, string>>>({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  // Coordonnées mémorisées sur l'appareil : préremplies une seule fois
  const [prefilled, setPrefilled] = useState(false);
  if (mounted && !prefilled) {
    setPrefilled(true);
    if (contact) setForm({ ...EMPTY, ...contact });
  }
  useEffect(() => {
    api<ShippingRate[]>('/api/v1/shipping/rates').then((r) => {
      setRates(r);
      const standard = r.find((x) => x.name.toLowerCase().includes('standard')) || r[0];
      if (standard) setRateId(standard.id);
    }).catch((e) => setError(e.message));
  }, []);

  const subtotal = cartSubtotal(lines);
  const rate = rates?.find((r) => r.id === rateId);
  const shipping = rate ? (rate.free_from != null && subtotal >= rate.free_from ? 0 : rate.price) : 0;
  const zones = useMemo(() => {
    const out: Record<string, ShippingRate[]> = {};
    for (const r of rates || []) (out[r.zone] ||= []).push(r);
    return out;
  }, [rates]);

  if (!mounted) return <ShopShell><Loading /></ShopShell>;
  if (lines.length === 0 && !done) {
    return (
      <ShopShell narrow>
        <EmptyState title="Votre panier est vide" text="Ajoutez quelques pièces avant de passer commande." action={<Button href="/boutique">Découvrir la boutique</Button>} />
      </ShopShell>
    );
  }

  const set = (k: keyof SavedContact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er: typeof errors = {};
    if (!form.first_name.trim()) er.first_name = 'Indiquez votre prénom.';
    if (!form.last_name.trim()) er.last_name = 'Indiquez votre nom.';
    if (form.phone.replace(/\D/g, '').length < 8) er.phone = 'Un numéro joignable : nous vous appelons pour confirmer.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Adresse e-mail invalide.';
    if (form.city.trim().length < 2) er.city = 'Indiquez la ville.';
    if (form.address.trim().length < 3) er.address = 'Rue, maison, repère : de quoi vous trouver.';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (!rateId) { setError('Choisissez un mode de livraison.'); return; }
    setSending(true);
    try {
      const order = await api<OrderCreated>('/api/v1/orders', {
        method: 'POST',
        body: {
          ...form, email: form.email.trim() || null, neighborhood: form.neighborhood || null, instructions: form.instructions || null,
          shipping_rate_id: rateId, payment_method: payment, note: note || null,
          items: lines.map((l) => ({ variant_id: l.variantId, quantity: l.qty })),
        },
      });
      save({ number: order.number, phone: form.phone, total: order.total, createdAt: new Date().toISOString() });
      rememberContact(remember ? form : null);
      setDone(true);
      clear();
      router.replace(`/commande/confirmation?n=${encodeURIComponent(order.number)}&t=${encodeURIComponent(form.phone)}`);
    } catch (err) {
      setError((err as Error).message);
      setSending(false);
    }
  };

  const radio = (on: boolean): React.CSSProperties => ({
    border: on ? '0.5px solid var(--gold)' : '0.5px solid rgba(var(--fg-rgb),0.14)', background: on ? 'rgba(var(--accent-rgb),0.06)' : 'transparent',
    borderRadius: 4, padding: '16px 18px', cursor: 'pointer', transition: 'all .2s', display: 'flex', gap: 14, alignItems: 'flex-start', textAlign: 'left', width: '100%',
  });
  const dot = (on: boolean) => (
    <span style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 3, border: `0.5px solid ${on ? 'var(--gold)' : 'rgba(var(--fg-rgb),0.35)'}`, background: on ? 'radial-gradient(var(--gold) 45%, transparent 50%)' : 'transparent' }} />
  );

  return (
    <ShopShell>
      <PageHeading eyebrow="Finaliser" title="Votre commande">
        Aucun compte n&apos;est nécessaire. Notre équipe vous appelle pour confirmer avant toute préparation.
      </PageHeading>

      <form onSubmit={submit} noValidate className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="flex flex-col gap-12">
          <section>
            <p style={{ ...label, color: 'var(--gold)', marginBottom: 20 }}>01 — Vos coordonnées</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Prénom" error={errors.first_name}><Input value={form.first_name} onChange={set('first_name')} autoComplete="given-name" /></Field>
              <Field label="Nom" error={errors.last_name}><Input value={form.last_name} onChange={set('last_name')} autoComplete="family-name" /></Field>
              <Field label="Téléphone" error={errors.phone} hint="Pour la confirmation et le suivi de la commande"><Input value={form.phone} onChange={set('phone')} type="tel" inputMode="tel" placeholder="+228 90 00 00 00" autoComplete="tel" /></Field>
              <Field label="E-mail (facultatif)" error={errors.email} hint="Pour recevoir la facture et les étapes"><Input value={form.email} onChange={set('email')} type="email" autoComplete="email" /></Field>
            </div>
          </section>

          <section>
            <p style={{ ...label, color: 'var(--gold)', marginBottom: 20 }}>02 — Adresse de livraison</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Ville" error={errors.city}><Input value={form.city} onChange={set('city')} autoComplete="address-level2" /></Field>
              <Field label="Quartier"><Input value={form.neighborhood} onChange={set('neighborhood')} placeholder="Tokoin, Bè, Agoè…" /></Field>
              <div className="sm:col-span-2"><Field label="Adresse" error={errors.address}><Input value={form.address} onChange={set('address')} placeholder="Rue, numéro de maison" autoComplete="street-address" /></Field></div>
              <div className="sm:col-span-2"><Field label="Indications (facultatif)"><Input value={form.instructions} onChange={set('instructions')} placeholder="Portail bleu, près de la pharmacie…" /></Field></div>
            </div>
          </section>

          <section>
            <p style={{ ...label, color: 'var(--gold)', marginBottom: 20 }}>03 — Mode de livraison</p>
            {!rates ? <Loading text="Tarifs…" /> : (
              <div className="flex flex-col gap-6">
                {Object.entries(zones).map(([zone, list]) => (
                  <div key={zone}>
                    <p style={{ fontSize: 13, color: 'var(--cream)', marginBottom: 10 }}>{zone}</p>
                    <div className="flex flex-col gap-2">
                      {list.map((r) => {
                        const free = r.free_from != null && subtotal >= r.free_from;
                        return (
                          <button type="button" key={r.id} onClick={() => setRateId(r.id)} style={radio(rateId === r.id)} aria-pressed={rateId === r.id}>
                            {dot(rateId === r.id)}
                            <span className="flex-1">
                              <span style={{ display: 'block', fontSize: 14, color: 'var(--cream)' }}>{r.name}</span>
                              <span style={{ display: 'block', fontSize: 12, color: 'var(--cream-muted)', marginTop: 2 }}>
                                {delay(r)}{r.free_from != null && !free ? ` · offerte dès ${fcfa(r.free_from)}` : ''}
                              </span>
                            </span>
                            <span style={{ fontSize: 13, color: r.price === 0 || free ? 'var(--gold)' : 'var(--cream)' }}>{r.price === 0 || free ? 'Offerte' : fcfa(r.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <p style={{ ...label, color: 'var(--gold)', marginBottom: 20 }}>04 — Paiement</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENTS.map((p) => (
                <button type="button" key={p.value} onClick={() => setPayment(p.value)} style={radio(payment === p.value)} aria-pressed={payment === p.value}>
                  {dot(payment === p.value)}
                  <span>
                    <span style={{ display: 'block', fontSize: 14, color: 'var(--cream)' }}>{p.title}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--cream-muted)', marginTop: 4, lineHeight: 1.6 }}>{p.text}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6"><Field label="Un mot pour l'équipe (facultatif)"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Retouche, créneau de livraison, emballage cadeau…" maxLength={1000} /></Field></div>
            <label className="flex items-center gap-3 mt-5 cursor-pointer" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: '#E8B96A', width: 16, height: 16 }} />
              Mémoriser mes coordonnées sur cet appareil
            </label>
          </section>
        </div>

        <aside style={{ position: 'sticky', top: 128, alignSelf: 'start', background: 'rgba(var(--fg-rgb),0.025)', border: '0.5px solid rgba(var(--fg-rgb),0.07)', borderRadius: 8, padding: 28 }}>
          <div className="flex justify-between items-center mb-5">
            <p style={label}>Récapitulatif</p>
            <Link href="/panier" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>Modifier</Link>
          </div>
          <ul className="flex flex-col gap-4 mb-6" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-3 items-center">
                <div className="relative overflow-hidden flex-shrink-0" style={{ width: 52, height: 68, background: 'rgba(var(--fg-rgb),0.03)' }}>
                  <ProductImg src={l.image} alt={l.name} sizes="52px" />
                  <span className="absolute -top-0 -right-0 flex items-center justify-center" style={{ minWidth: 18, height: 18, background: 'var(--gold)', color: 'var(--on-accent)', fontSize: 10, fontWeight: 600 }}>{l.qty}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: 13, color: 'var(--cream)' }}>{l.name}</p>
                  {l.size !== 'Taille unique' && <p style={{ fontSize: 11, color: 'var(--cream-muted)' }}>Taille {l.size}</p>}
                </div>
                <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fcfa(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 16 }} />
          <div className="flex justify-between mb-2" style={{ fontSize: 14 }}><span style={{ color: 'var(--cream-muted)' }}>Sous-total</span><span>{fcfa(subtotal)}</span></div>
          <div className="flex justify-between mb-5" style={{ fontSize: 14 }}><span style={{ color: 'var(--cream-muted)' }}>Livraison</span><span style={{ color: shipping === 0 ? 'var(--gold)' : undefined }}>{rate ? (shipping === 0 ? 'Offerte' : fcfa(shipping)) : '—'}</span></div>
          <div className="flex justify-between items-baseline mb-6">
            <span style={{ fontSize: 13 }}>Total</span>
            <span className="font-serif" style={{ fontSize: 28, color: 'var(--gold)' }}>{fcfa(subtotal + shipping)}</span>
          </div>
          {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}
          <Button type="submit" full disabled={sending}>{sending ? 'Envoi en cours…' : 'Confirmer la commande'}</Button>
          <p style={{ fontSize: 11, color: 'rgba(var(--fg-rgb),0.45)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
            Rien n&apos;est débité maintenant : vous payez à la livraison ou après notre appel.
          </p>
        </aside>
      </form>
    </ShopShell>
  );
}
