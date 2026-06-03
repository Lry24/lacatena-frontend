'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/common/ProductCard';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { getUserAddresses, createAddress } from '@/lib/api';
import type { AddressResponse, AddressCreate } from '@/types';

type Tab = 'profil' | 'commandes' | 'adresses' | 'favoris';

export default function MonComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchMe, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const [tab, setTab] = useState<Tab>('profil');
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [addrForm, setAddrForm] = useState<AddressCreate>({
    label: '', recipient_name: '', phone: '', street: '', city: '',
    state: '', postal_code: '', country: 'Togo', is_default: false,
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/connexion'); return; }
    fetchMe();
  }, [isAuthenticated, router, fetchMe]);

  useEffect(() => {
    if (isAuthenticated) {
      getUserAddresses().then(setAddresses).catch(() => {});
    }
  }, [isAuthenticated]);

  const setAddr = (key: keyof AddressCreate) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddrForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrLoading(true);
    setAddrError('');
    try {
      const newAddr = await createAddress(addrForm);
      setAddresses((prev) => [...prev, newAddr]);
      setShowAddressForm(false);
      setAddrForm({ label: '', recipient_name: '', phone: '', street: '', city: '', state: '', postal_code: '', country: 'Togo', is_default: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setAddrError(msg || 'Erreur lors de l\'enregistrement.');
    } finally {
      setAddrLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profil', label: 'Profil' },
    { key: 'commandes', label: 'Commandes' },
    { key: 'adresses', label: 'Adresses' },
    { key: 'favoris', label: 'Favoris' },
  ];

  if (!user) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 100, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13 }}>Chargement...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: 100 }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1440, margin: '0 auto' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif" style={{ fontSize: 40, color: 'var(--gold)' }}>Mon compte</h1>
              <p style={{ fontSize: 13, color: 'var(--cream-muted)', marginTop: 4 }}>
                Bonjour, <span style={{ color: 'var(--cream)' }}>{user.full_name}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', border: '0.5px solid rgba(240,234,210,0.15)', padding: '8px 16px', borderRadius: 2 }}
            >
              Déconnexion
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-10" style={{ borderBottom: '0.5px solid var(--border)' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="transition-all duration-150"
                style={{
                  padding: '12px 24px',
                  fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
                  color: tab === t.key ? 'var(--gold)' : 'var(--cream-muted)',
                  borderBottom: tab === t.key ? '1.5px solid var(--gold)' : '1.5px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t.label}
                {t.key === 'favoris' && wishlistItems.length > 0 && (
                  <span style={{ marginLeft: 6, background: 'var(--gold)', color: '#2D3A0F', borderRadius: 20, padding: '1px 6px', fontSize: 8 }}>
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'profil' && (
            <div style={{ maxWidth: 480 }}>
              <div className="flex flex-col gap-5">
                {[
                  { label: 'Prénom', value: user.first_name },
                  { label: 'Nom', value: user.last_name },
                  { label: 'Email', value: user.email },
                  { label: 'Téléphone', value: user.phone || '—' },
                  { label: 'Statut', value: user.is_verified ? 'Vérifié ✓' : 'Non vérifié' },
                ].map((field) => (
                  <div key={field.label}>
                    <p style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 4 }}>{field.label}</p>
                    <p style={{ fontSize: 14, color: field.label === 'Statut' && user.is_verified ? 'var(--gold)' : 'var(--cream)' }}>{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'commandes' && (
            <div className="flex flex-col items-center justify-center" style={{ minHeight: 240, gap: 16 }}>
              <span style={{ fontSize: 32, color: 'rgba(232,185,106,0.2)' }}>⊙</span>
              <p style={{ fontSize: 14, color: 'var(--cream-muted)' }}>Aucune commande pour le moment</p>
              <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                Découvrir la boutique →
              </Link>
            </div>
          )}

          {tab === 'adresses' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.uuid}
                    style={{
                      padding: '20px 24px',
                      background: 'rgba(240,234,210,0.04)',
                      border: `0.5px solid ${addr.is_default ? 'rgba(232,185,106,0.4)' : 'rgba(240,234,210,0.1)'}`,
                      borderRadius: 4,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>{addr.label}</p>
                      {addr.is_default && <span style={{ fontSize: 9, letterSpacing: '1px', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.3)', padding: '1px 8px', borderRadius: 20 }}>Par défaut</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{addr.recipient_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4, lineHeight: 1.6 }}>
                      {addr.street}<br />{addr.city}, {addr.state}<br />{addr.country}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>{addr.phone}</p>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex flex-col items-center justify-center gap-2 transition-colors hover:border-[rgba(232,185,106,0.3)]"
                  style={{ padding: '20px', border: '0.5px dashed rgba(240,234,210,0.15)', borderRadius: 4, minHeight: 120 }}
                >
                  <span style={{ fontSize: 24, color: 'var(--cream-muted)' }}>+</span>
                  <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Ajouter une adresse</span>
                </button>
              </div>

              {showAddressForm && (
                <div style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: '28px', maxWidth: 540 }}>
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>Nouvelle adresse</p>
                  <form onSubmit={handleAddAddress} className="flex flex-col gap-4">
                    <Input label="Libellé" value={addrForm.label} onChange={setAddr('label')} required placeholder="Domicile, Bureau..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Nom complet" value={addrForm.recipient_name} onChange={setAddr('recipient_name')} required placeholder="Prénom Nom" />
                      <Input label="Téléphone" value={addrForm.phone} onChange={setAddr('phone')} required placeholder="+228 ..." type="tel" />
                    </div>
                    <Input label="Adresse" value={addrForm.street} onChange={setAddr('street')} required placeholder="Rue, quartier..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Ville" value={addrForm.city} onChange={setAddr('city')} required placeholder="Lomé" />
                      <Input label="Région" value={addrForm.state} onChange={setAddr('state')} required placeholder="Maritime" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Code postal" value={addrForm.postal_code} onChange={setAddr('postal_code')} placeholder="00228" />
                      <Input label="Pays" value={addrForm.country} onChange={setAddr('country')} required placeholder="Togo" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addrForm.is_default}
                        onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))}
                        className="accent-[#E8B96A]"
                      />
                      <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>Définir comme adresse par défaut</span>
                    </label>
                    {addrError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{addrError}</p>}
                    <div className="flex gap-3">
                      <button type="submit" disabled={addrLoading} className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
                        {addrLoading ? '...' : 'Enregistrer'}
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {tab === 'favoris' && (
            wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: 300, gap: 16 }}>
                <span style={{ fontSize: 32, color: 'rgba(232,185,106,0.2)' }}>♡</span>
                <p style={{ fontSize: 14, color: 'var(--cream-muted)' }}>Votre liste de favoris est vide</p>
                <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>Découvrir la boutique →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistItems.map((p) => <ProductCard key={p.uuid} product={p} />)}
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
