'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Input from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrderFromCart, getUserAddresses } from '@/lib/api';
import type { AddressResponse } from '@/types';

interface FormData {
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  notes: string;
}

export default function CommandePage() {
  const { items, total, sessionKey, initSession } = useCartStore();
  const { isAuthenticated, fetchMe } = useAuthStore();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [form, setForm] = useState<FormData>({ recipient_name: '', phone: '', street: '', city: '', state: '', postal_code: '', country: 'Togo', notes: '' });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [error, setError] = useState('');

  const shipping = total >= 50000 ? 0 : 3500;

  useEffect(() => {
    initSession();
    if (isAuthenticated) {
      fetchMe();
      getUserAddresses().then((a) => { setAddresses(a); if (a.length > 0) { setUseNewAddress(false); setSelectedAddress(a[0].uuid); } }).catch(() => {});
    }
  }, [isAuthenticated, initSession, fetchMe]);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionKey) return;
    setLoading(true);
    setError('');
    try {
      const order = await createOrderFromCart({
        session_key: sessionKey,
        payment_method: 'mobile_money',
        shipping_address_uuid: (!useNewAddress && selectedAddress) ? selectedAddress : undefined,
        shipping_cost: shipping,
        notes: form.notes || undefined,
      });
      setConfirmed(order.reference);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Une erreur est survenue. Veuillez rÃ©essayer.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 132, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center animate-fade-up" style={{ maxWidth: 480, padding: '0 24px' }}>
            <div className="chain-divider mb-8" style={{ fontSize: 28, letterSpacing: '4px', color: 'rgba(232,185,106,0.4)' }}>âŠ™âŠ™âŠ™âŠ™âŠ™âŠ™</div>
            <h1 className="font-serif mb-4" style={{ fontSize: 40, color: 'var(--gold)' }}>Commande confirmÃ©e</h1>
            <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Merci pour votre commande. Nous l&apos;avons bien reÃ§ue et la prÃ©parons avec soin.
            </p>
            <p style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--cream-muted)', marginBottom: 40 }}>
              RÃ©fÃ©rence : <span style={{ color: 'var(--gold)' }}>{confirmed}</span>
            </p>
            <Link href="/boutique" className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
              Continuer les achats
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: 132 }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1440, margin: '0 auto' }}>
          <h1 className="font-serif mb-10" style={{ fontSize: 40, color: 'var(--gold)' }}>Finaliser la commande</h1>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
              {/* Saved addresses */}
              {isAuthenticated && addresses.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Adresses enregistrÃ©es</p>
                  <div className="flex flex-col gap-3 mb-4">
                    {addresses.map((addr) => (
                      <label key={addr.uuid} className="flex items-start gap-3 cursor-pointer p-4" style={{ border: `0.5px solid ${selectedAddress === addr.uuid && !useNewAddress ? 'var(--gold)' : 'rgba(240,234,210,0.15)'}`, borderRadius: 4, background: selectedAddress === addr.uuid && !useNewAddress ? 'rgba(232,185,106,0.04)' : 'transparent' }}>
                        <input
                          type="radio" name="addr_choice" checked={!useNewAddress && selectedAddress === addr.uuid}
                          onChange={() => { setSelectedAddress(addr.uuid); setUseNewAddress(false); }}
                          className="mt-1 accent-[#E8B96A]"
                        />
                        <div>
                          <p style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{addr.label} â€” {addr.recipient_name}</p>
                          <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>{addr.street}, {addr.city}, {addr.country}</p>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="addr_choice" checked={useNewAddress} onChange={() => setUseNewAddress(true)} className="accent-[#E8B96A]" />
                      <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Nouvelle adresse</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Address form */}
              {(useNewAddress || !isAuthenticated) && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Adresse de livraison</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nom complet" value={form.recipient_name} onChange={set('recipient_name')} required placeholder="PrÃ©nom Nom" />
                    <Input label="TÃ©lÃ©phone" value={form.phone} onChange={set('phone')} required placeholder="+228 ..." type="tel" />
                    <div className="md:col-span-2">
                      <Input label="Adresse" value={form.street} onChange={set('street')} required placeholder="Rue, numÃ©ro, quartier" />
                    </div>
                    <Input label="Ville" value={form.city} onChange={set('city')} required placeholder="LomÃ©" />
                    <Input label="RÃ©gion / Ã‰tat" value={form.state} onChange={set('state')} required placeholder="Maritime" />
                    <Input label="Code postal" value={form.postal_code} onChange={set('postal_code')} placeholder="00228" />
                    <Input label="Pays" value={form.country} onChange={set('country')} required placeholder="Togo" />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>Note de commande (optionnel)</p>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  placeholder="Instructions particuliÃ¨res pour la livraison..."
                  className="w-full px-4 py-3 text-sm outline-none resize-none transition-all"
                  style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, color: 'var(--cream)', fontSize: 13 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
                />
              </div>

              {error && <p style={{ color: 'rgba(220,100,100,0.9)', fontSize: 13 }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '16px', borderRadius: 2, fontSize: 11, letterSpacing: '2px' }}
              >
                {loading ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </form>

            {/* Order summary */}
            <div className="flex-shrink-0 flex flex-col gap-5" style={{ width: 'min(100%, 340px)', alignSelf: 'flex-start', background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: '28px' }}>
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Votre commande</p>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 12, color: 'var(--cream)', lineHeight: 1.4 }}>{item.product_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--cream-muted)' }}>Ã— {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--cream)', flexShrink: 0 }}>
                      {item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ height: '0.5px', background: 'var(--border)' }} />
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>Sous-total</span>
                  <span style={{ fontSize: 12, color: 'var(--cream)' }}>{total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>Livraison</span>
                  <span style={{ fontSize: 12, color: shipping === 0 ? 'var(--gold)' : 'var(--cream)' }}>{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString('fr-FR')} FCFA`}</span>
                </div>
                <div style={{ height: '0.5px', background: 'var(--border)' }} />
                <div className="flex justify-between items-baseline">
                  <span style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Total TTC</span>
                  <span className="font-serif text-xl" style={{ color: 'var(--gold)' }}>{(total + shipping).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

