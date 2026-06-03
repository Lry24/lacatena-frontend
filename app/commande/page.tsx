'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Input from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import {
  createOrderFromCart, getUserAddresses,
  register as apiRegister, verifyOtp as apiVerifyOtp,
} from '@/lib/api';
import type { AddressResponse } from '@/types';

type Stage = 'loading' | 'gate' | 'checkout' | 'confirmed';
type AuthTab = 'login' | 'register';

interface ShipForm {
  recipient_name: string; phone: string; street: string;
  city: string; state: string; postal_code: string; country: string; notes: string;
}

const apiErr = (err: unknown) =>
  (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;

export default function CommandePage() {
  const { items, total, fetchCart } = useCartStore();
  const { isAuthenticated, fetchMe, login } = useAuthStore();

  const [stage, setStage] = useState<Stage>('loading');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [regStep, setRegStep] = useState<1 | 2>(1);

  // Auth gate fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regFirst, setRegFirst] = useState('');
  const [regLast, setRegLast] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Checkout fields
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [useNew, setUseNew] = useState(true);
  const [form, setForm] = useState<ShipForm>({
    recipient_name: '', phone: '', street: '', city: '',
    state: '', postal_code: '', country: 'Togo', notes: '',
  });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const shipping = total >= 50000 ? 0 : 3500;

  const loadAddresses = () => {
    getUserAddresses().then((a) => {
      setAddresses(a);
      if (a.length > 0) {
        const def = a.find((x) => x.is_default) || a[0];
        setSelectedAddr(def.uuid);
        setUseNew(false);
      }
    }).catch(() => {});
  };

  // Vérification auth au montage
  useEffect(() => {
    fetchCart();
    fetchMe().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        loadAddresses();
        setStage('checkout');
      } else {
        setStage('gate');
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await login({ email: loginEmail, password: loginPw });
      await fetchCart();
      loadAddresses();
      setStage('checkout');
    } catch (err) {
      setAuthError(apiErr(err) || 'Email ou mot de passe incorrect.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Register step 1
  const handleRegStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPw !== regConfirm) { setAuthError('Les mots de passe ne correspondent pas.'); return; }
    setAuthLoading(true);
    setAuthError('');
    try {
      await apiRegister({ email: regEmail, phone: regPhone || undefined, first_name: regFirst, last_name: regLast, password: regPw });
      setRegStep(2);
    } catch (err) {
      setAuthError(apiErr(err) || 'Une erreur est survenue.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Register step 2 (OTP)
  const handleRegStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await apiVerifyOtp({ email: regEmail, otp: regOtp });
      await login({ email: regEmail, password: regPw });
      await fetchCart();
      loadAddresses();
      setStage('checkout');
    } catch (err) {
      setAuthError(apiErr(err) || 'Code incorrect ou expiré.');
    } finally {
      setAuthLoading(false);
    }
  };

  const setF = (k: keyof ShipForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Submit order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setOrderError('');
    try {
      const order = await createOrderFromCart({
        payment_method: 'mobile_money',
        shipping_address_uuid: (!useNew && selectedAddr) ? selectedAddr : undefined,
        shipping_address_snapshot: useNew ? {
          recipient_name: form.recipient_name, phone: form.phone,
          street: form.street, city: form.city, state: form.state,
          postal_code: form.postal_code, country: form.country,
        } : undefined,
        shipping_cost: shipping,
        notes: form.notes || undefined,
      });
      setConfirmed(order.order_number);
      setStage('confirmed');
    } catch (err) {
      setOrderError(apiErr(err) || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setOrderLoading(false);
    }
  };

  // ───────────────────────────────────────── LOADING
  if (stage === 'loading') {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 190, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13 }}>Chargement...</p>
        </main>
        <Footer />
      </>
    );
  }

  // ───────────────────────────────────────── CONFIRMATION
  if (stage === 'confirmed' && confirmed) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 190, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center" style={{ maxWidth: 520, padding: '0 24px' }}>
            <div style={{ fontSize: 28, letterSpacing: '6px', color: 'rgba(232,185,106,0.35)', marginBottom: 32 }}>⊙⊙⊙⊙⊙⊙</div>
            <h1 className="font-serif mb-4" style={{ fontSize: 40, color: 'var(--gold)' }}>Commande confirmée</h1>
            <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Merci pour votre confiance. Votre commande a bien été reçue et est en cours de préparation.
            </p>
            <p style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--cream-muted)', marginBottom: 40 }}>
              Référence : <span style={{ color: 'var(--gold)' }}>{confirmed}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/mon-compte"
                className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px 24px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                Voir mes commandes
              </Link>
              <Link
                href="/boutique"
                style={{ border: '0.5px solid rgba(240,234,210,0.2)', color: 'var(--cream-muted)', padding: '14px 24px', borderRadius: 2, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}
              >
                Continuer les achats
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ───────────────────────────────────────── AUTH GATE
  if (stage === 'gate') {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 190 }}>
          <div style={{ padding: '40px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
            <div className="flex flex-col lg:flex-row gap-12 items-start">

              {/* Auth form */}
              <div className="flex-1" style={{ maxWidth: 480 }}>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                  Étape 1 — Identification
                </p>
                <h1 className="font-serif mb-2" style={{ fontSize: 32, color: 'var(--cream)' }}>
                  Finalisez votre commande
                </h1>
                <p style={{ fontSize: 13, color: 'var(--cream-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                  Connectez-vous ou créez un compte pour associer votre panier et valider votre commande.
                </p>

                {/* Tabs */}
                <div className="flex" style={{ borderBottom: '0.5px solid var(--border)', marginBottom: 28 }}>
                  {(['login', 'register'] as AuthTab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setAuthTab(t); setAuthError(''); setRegStep(1); }}
                      style={{
                        padding: '10px 20px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
                        color: authTab === t ? 'var(--gold)' : 'var(--cream-muted)',
                        borderBottom: authTab === t ? '1.5px solid var(--gold)' : '1.5px solid transparent',
                        marginBottom: -1,
                      }}
                    >
                      {t === 'login' ? 'Se connecter' : 'Créer un compte'}
                    </button>
                  ))}
                </div>

                {authError && (
                  <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)', marginBottom: 16 }}>{authError}</p>
                )}

                {/* LOGIN */}
                {authTab === 'login' && (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Input label="Email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="vous@exemple.com" />
                    <Input label="Mot de passe" type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} required placeholder="••••••••" />
                    <div className="flex justify-end">
                      <Link href="/mot-de-passe-oublie" style={{ fontSize: 11, color: 'var(--cream-muted)' }}>Mot de passe oublié ?</Link>
                    </div>
                    <button
                      type="submit" disabled={authLoading}
                      className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                      style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                    >
                      {authLoading ? 'Connexion...' : 'Se connecter et continuer'}
                    </button>
                  </form>
                )}

                {/* REGISTER */}
                {authTab === 'register' && (
                  <>
                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-6">
                      {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: regStep >= s ? 'var(--gold)' : 'transparent',
                            border: `0.5px solid ${regStep >= s ? 'var(--gold)' : 'rgba(240,234,210,0.2)'}`,
                            color: regStep >= s ? '#2D3A0F' : 'var(--cream-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 500,
                          }}>{s}</div>
                          {s < 2 && <div style={{ width: 24, height: 1, background: regStep > s ? 'var(--gold)' : 'rgba(240,234,210,0.15)' }} />}
                        </div>
                      ))}
                      <span style={{ fontSize: 11, color: 'var(--cream-muted)', marginLeft: 4 }}>
                        {regStep === 1 ? 'Informations personnelles' : 'Vérification email'}
                      </span>
                    </div>

                    {regStep === 1 ? (
                      <form onSubmit={handleRegStep1} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Input label="Prénom" value={regFirst} onChange={(e) => setRegFirst(e.target.value)} required placeholder="Ama" />
                          <Input label="Nom" value={regLast} onChange={(e) => setRegLast(e.target.value)} required placeholder="Kofi" />
                        </div>
                        <Input label="Email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required placeholder="vous@exemple.com" />
                        <Input label="Téléphone (optionnel)" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+228 ..." />
                        <Input label="Mot de passe" type="password" value={regPw} onChange={(e) => setRegPw(e.target.value)} required placeholder="8 caractères minimum" />
                        <Input label="Confirmer" type="password" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required placeholder="••••••••" />
                        <button
                          type="submit" disabled={authLoading}
                          className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                          style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                        >
                          {authLoading ? 'Création...' : 'Créer mon compte'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleRegStep2} className="flex flex-col gap-6">
                        <div>
                          <p style={{ fontSize: 13, color: 'var(--cream-muted)', textAlign: 'center', marginBottom: 4 }}>
                            Code envoyé à
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--gold)', textAlign: 'center', fontWeight: 500, marginBottom: 20 }}>{regEmail}</p>
                          <input
                            type="text" value={regOtp}
                            onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6} required placeholder="000000"
                            className="w-full text-center text-3xl font-serif tracking-widest outline-none"
                            style={{
                              background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)',
                              borderRadius: 4, color: 'var(--gold)', padding: '20px', letterSpacing: '12px',
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
                          />
                        </div>
                        <button
                          type="submit" disabled={authLoading || regOtp.length !== 6}
                          className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                          style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                        >
                          {authLoading ? 'Vérification...' : 'Vérifier et continuer'}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>

              {/* Cart summary (droite) */}
              <CartSummary items={items} total={total} shipping={shipping} />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ───────────────────────────────────────── CHECKOUT
  return (
    <>
      <Header />
      <main style={{ paddingTop: 190 }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
            Étape 2 — Livraison & confirmation
          </p>
          <h1 className="font-serif mb-10" style={{ fontSize: 40, color: 'var(--gold)' }}>Finaliser la commande</h1>

          <div className="flex flex-col lg:flex-row gap-12">
            <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col gap-8">
              {/* Adresses sauvegardées */}
              {addresses.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Adresses enregistrées</p>
                  <div className="flex flex-col gap-3 mb-4">
                    {addresses.map((addr) => (
                      <label key={addr.uuid} className="flex items-start gap-3 cursor-pointer p-4" style={{ border: `0.5px solid ${selectedAddr === addr.uuid && !useNew ? 'var(--gold)' : 'rgba(240,234,210,0.15)'}`, borderRadius: 4, background: selectedAddr === addr.uuid && !useNew ? 'rgba(232,185,106,0.04)' : 'transparent' }}>
                        <input type="radio" name="addr" checked={!useNew && selectedAddr === addr.uuid} onChange={() => { setSelectedAddr(addr.uuid); setUseNew(false); }} className="mt-1 accent-[#E8B96A]" />
                        <div>
                          <p style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{addr.label || addr.recipient_name} — {addr.recipient_name}</p>
                          <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>{addr.street}, {addr.city}, {addr.country}</p>
                        </div>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="addr" checked={useNew} onChange={() => setUseNew(true)} className="accent-[#E8B96A]" />
                      <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Nouvelle adresse</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Formulaire adresse */}
              {(useNew || addresses.length === 0) && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Adresse de livraison</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nom complet" value={form.recipient_name} onChange={setF('recipient_name')} required placeholder="Prénom Nom" />
                    <Input label="Téléphone" value={form.phone} onChange={setF('phone')} required placeholder="+228 ..." type="tel" />
                    <div className="md:col-span-2"><Input label="Adresse" value={form.street} onChange={setF('street')} required placeholder="Rue, numéro, quartier" /></div>
                    <Input label="Ville" value={form.city} onChange={setF('city')} required placeholder="Lomé" />
                    <Input label="Région" value={form.state} onChange={setF('state')} required placeholder="Maritime" />
                    <Input label="Code postal" value={form.postal_code} onChange={setF('postal_code')} placeholder="00228" />
                    <Input label="Pays" value={form.country} onChange={setF('country')} required placeholder="Togo" />
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Mode de paiement</p>
                <div className="flex flex-col gap-3">
                  {[
                    { value: 'mobile_money', label: 'Mobile Money (Flooz / T-Money)' },
                    { value: 'cash', label: 'Paiement a la livraison' },
                    { value: 'card', label: 'Carte bancaire' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-4" style={{ border: `0.5px solid ${paymentMethod === opt.value ? 'var(--gold)' : 'rgba(240,234,210,0.15)'}`, borderRadius: 4, background: paymentMethod === opt.value ? 'rgba(232,185,106,0.04)' : 'transparent' }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="accent-[#E8B96A]"
                      />
                      <span style={{ fontSize: 13, color: paymentMethod === opt.value ? 'var(--cream)' : 'var(--cream-muted)' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>Note (optionnel)</p>
                <textarea value={form.notes} onChange={setF('notes')} rows={3} placeholder="Instructions particulières..."
                  className="w-full px-4 py-3 outline-none resize-none"
                  style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, color: 'var(--cream)', fontSize: 13 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
                />
              </div>

              {orderError && <p style={{ color: 'rgba(220,100,100,0.9)', fontSize: 13 }}>{orderError}</p>}

              <button type="submit" disabled={orderLoading}
                className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '16px', borderRadius: 2, fontSize: 11, letterSpacing: '2px' }}
              >
                {orderLoading ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </form>

            <CartSummary items={items} total={total} shipping={shipping} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Composant récapitulatif du panier ──────────────────────────────────────────
function CartSummary({ items, total, shipping }: { items: { id?: number | string; product_name?: string; quantity: number; subtotal?: number }[]; total: number; shipping: number }) {
  return (
    <div className="flex-shrink-0 flex flex-col gap-5" style={{ width: 'min(100%, 340px)', alignSelf: 'flex-start', background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: '28px' }}>
      <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Votre commande</p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12, color: 'var(--cream)', lineHeight: 1.4 }}>{item.product_name}</p>
              <p style={{ fontSize: 11, color: 'var(--cream-muted)' }}>× {item.quantity}</p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--cream)', flexShrink: 0 }}>
              {item.subtotal ? item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }) : ''}
            </span>
          </div>
        ))}
      </div>
      {items.length === 0 && <p style={{ fontSize: 12, color: 'var(--cream-muted)' }}>Panier vide</p>}
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
  );
}
