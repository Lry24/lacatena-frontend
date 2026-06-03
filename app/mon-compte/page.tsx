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
import {
  getUserAddresses, createAddress, deleteAddress, setDefaultAddress,
  getMyOrders, getOrderDetail, updateProfile, changePassword as apiChangePassword,
} from '@/lib/api';
import type { AddressResponse, AddressCreate, OrderResponse, UserUpdate } from '@/types';

type Tab = 'profil' | 'commandes' | 'adresses' | 'favoris';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',    color: 'rgba(232,185,106,0.85)' },
  paid:       { label: 'Payée',         color: 'rgba(80,190,110,0.85)' },
  processing: { label: 'En traitement', color: 'rgba(100,150,220,0.85)' },
  shipped:    { label: 'Expédiée',      color: 'rgba(60,190,190,0.85)' },
  delivered:  { label: 'Livrée',        color: 'rgba(80,190,110,0.9)' },
  cancelled:  { label: 'Annulée',       color: 'rgba(210,80,80,0.85)' },
  refunded:   { label: 'Remboursée',    color: 'rgba(170,120,210,0.85)' },
};

const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 });
const fmtDate = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

interface OrderDetail {
  uuid: string; order_number: string; status: string;
  total_ttc: number; shipping_cost: number; subtotal_ht: number; tva_amount: number;
  payment_method?: string; created_at: string; notes?: string;
  shipping_address_snapshot?: Record<string, string>;
  items: { product_name: string; variant_sku?: string; variant_size?: string; variant_color?: string; quantity: number; unit_price_ttc: number; subtotal_ttc: number }[];
}

export default function MonComptePage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchMe, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const [tab, setTab] = useState<Tab>('profil');

  // ── Addresses
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [addrForm, setAddrForm] = useState<AddressCreate>({
    label: '', recipient_name: '', phone: '', street: '', city: '',
    state: '', postal_code: '', country: 'Togo', is_default: false,
  });

  // ── Orders
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<string, OrderDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  // ── Profile edit
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<UserUpdate>({ first_name: '', last_name: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // ── Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/connexion'); return; }
    fetchMe();
  }, [isAuthenticated, router, fetchMe]);

  useEffect(() => {
    if (isAuthenticated) {
      getUserAddresses().then(setAddresses).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (tab === 'commandes' && isAuthenticated && !ordersLoaded) {
      setOrdersLoading(true);
      getMyOrders(1, 50)
        .then((d) => { setOrders(d.items); setOrdersLoaded(true); })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, isAuthenticated, ordersLoaded]);

  useEffect(() => {
    if (user && !editProfile) {
      setProfileForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' });
    }
  }, [user, editProfile]);

  const toggleOrderDetail = async (uuid: string) => {
    if (expandedOrder === uuid) { setExpandedOrder(null); return; }
    setExpandedOrder(uuid);
    if (orderDetails[uuid]) return;
    setDetailLoading(uuid);
    try {
      const d = await getOrderDetail(uuid);
      setOrderDetails((prev) => ({ ...prev, [uuid]: d }));
    } catch {}
    finally { setDetailLoading(null); }
  };

  const setAddr = (key: keyof AddressCreate) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddrForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrLoading(true); setAddrError('');
    try {
      const newAddr = await createAddress(addrForm);
      setAddresses((prev) => [...prev, newAddr]);
      setShowAddressForm(false);
      setAddrForm({ label: '', recipient_name: '', phone: '', street: '', city: '', state: '', postal_code: '', country: 'Togo', is_default: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setAddrError(msg || "Erreur lors de l'enregistrement.");
    } finally { setAddrLoading(false); }
  };

  const handleDeleteAddress = async (uuid: string) => {
    try { await deleteAddress(uuid); setAddresses((p) => p.filter((a) => a.uuid !== uuid)); } catch {}
  };

  const handleSetDefault = async (uuid: string) => {
    try { await setDefaultAddress(uuid); setAddresses((p) => p.map((a) => ({ ...a, is_default: a.uuid === uuid }))); } catch {}
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileError(''); setProfileSuccess(false);
    try {
      await updateProfile(profileForm);
      await fetchMe();
      setEditProfile(false); setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setProfileError(msg || 'Erreur lors de la mise à jour.');
    } finally { setProfileLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    setPwLoading(true); setPwError(''); setPwSuccess(false);
    try {
      await apiChangePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwSuccess(true); setPwForm({ old_password: '', new_password: '', confirm_password: '' }); setShowPasswordForm(false);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPwError(msg || 'Erreur lors du changement.');
    } finally { setPwLoading(false); }
  };

  const handleLogout = () => { logout(); router.push('/'); };

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
        <main style={{ paddingTop: 190, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13 }}>Chargement...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: 190 }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1440, margin: '0 auto' }}>

          {/* Bandeau admin */}
          {(user.role === 'admin' || user.role === 'staff') && (
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(74,96,32,0.2)', border: '1px solid rgba(232,185,106,0.3)', borderRadius: 8, padding: '14px 20px', marginBottom: 32, textDecoration: 'none' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>Espace Administration</p>
                <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 2 }}>Connecté en tant que <strong style={{ color: 'var(--cream)' }}>{user.role}</strong></p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>Ouvrir →</span>
            </Link>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif" style={{ fontSize: 40, color: 'var(--gold)' }}>Mon compte</h1>
              <p style={{ fontSize: 13, color: 'var(--cream-muted)', marginTop: 4 }}>Bonjour, <span style={{ color: 'var(--cream)' }}>{user.full_name}</span></p>
            </div>
            <button onClick={handleLogout} style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', border: '0.5px solid rgba(240,234,210,0.15)', padding: '8px 16px', borderRadius: 2 }}>
              Deconnexion
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-10" style={{ borderBottom: '0.5px solid var(--border)' }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className="transition-all duration-150" style={{ padding: '12px 24px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: tab === t.key ? 'var(--gold)' : 'var(--cream-muted)', borderBottom: tab === t.key ? '1.5px solid var(--gold)' : '1.5px solid transparent', marginBottom: -1 }}>
                {t.label}
                {t.key === 'commandes' && orders.length > 0 && (
                  <span style={{ marginLeft: 6, background: 'rgba(232,185,106,0.15)', color: 'var(--gold)', borderRadius: 20, padding: '1px 6px', fontSize: 8 }}>{orders.length}</span>
                )}
                {t.key === 'favoris' && wishlistItems.length > 0 && (
                  <span style={{ marginLeft: 6, background: 'var(--gold)', color: '#2D3A0F', borderRadius: 20, padding: '1px 6px', fontSize: 8 }}>{wishlistItems.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── PROFIL */}
          {tab === 'profil' && (
            <div style={{ maxWidth: 480 }}>
              {profileSuccess && <div style={{ background: 'rgba(80,190,110,0.1)', border: '0.5px solid rgba(80,190,110,0.3)', borderRadius: 4, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: 'rgba(80,190,110,0.9)' }}>Profil mis à jour.</div>}
              {pwSuccess && <div style={{ background: 'rgba(80,190,110,0.1)', border: '0.5px solid rgba(80,190,110,0.3)', borderRadius: 4, padding: '10px 16px', marginBottom: 20, fontSize: 12, color: 'rgba(80,190,110,0.9)' }}>Mot de passe modifié.</div>}

              {!editProfile ? (
                <>
                  <div className="flex flex-col gap-5">
                    {[{ label: 'Prenom', value: user.first_name }, { label: 'Nom', value: user.last_name }, { label: 'Email', value: user.email }, { label: 'Telephone', value: user.phone || '—' }, { label: 'Statut', value: user.is_verified ? 'Verifie' : 'Non verifie' }].map((field) => (
                      <div key={field.label}>
                        <p style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 4 }}>{field.label}</p>
                        <p style={{ fontSize: 14, color: field.label === 'Statut' && user.is_verified ? 'var(--gold)' : 'var(--cream)' }}>{field.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button onClick={() => setEditProfile(true)} className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '10px 20px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>Modifier</button>
                    <button onClick={() => setShowPasswordForm((v) => !v)} style={{ padding: '10px 20px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>Mot de passe</button>
                  </div>
                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-8" style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: '24px' }}>
                      <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Changer le mot de passe</p>
                      <Input label="Mot de passe actuel" type="password" value={pwForm.old_password} onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))} required />
                      <Input label="Nouveau mot de passe" type="password" value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} required />
                      <Input label="Confirmer" type="password" value={pwForm.confirm_password} onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))} required />
                      {pwError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{pwError}</p>}
                      <div className="flex gap-3">
                        <button type="submit" disabled={pwLoading} className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>{pwLoading ? '...' : 'Confirmer'}</button>
                        <button type="button" onClick={() => { setShowPasswordForm(false); setPwError(''); }} style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>Annuler</button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Modifier le profil</p>
                  <Input label="Prenom" value={profileForm.first_name || ''} onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))} required />
                  <Input label="Nom" value={profileForm.last_name || ''} onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))} required />
                  <Input label="Telephone" value={profileForm.phone || ''} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} type="tel" placeholder="+228 ..." />
                  {profileError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{profileError}</p>}
                  <div className="flex gap-3 mt-2">
                    <button type="submit" disabled={profileLoading} className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>{profileLoading ? '...' : 'Enregistrer'}</button>
                    <button type="button" onClick={() => { setEditProfile(false); setProfileError(''); }} style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>Annuler</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── COMMANDES — ARCHIVE */}
          {tab === 'commandes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif" style={{ fontSize: 22, color: 'var(--cream)' }}>Historique des commandes</h2>
                {orders.length > 0 && <span style={{ fontSize: 11, color: 'var(--cream-muted)' }}>{orders.length} commande{orders.length > 1 ? 's' : ''}</span>}
              </div>

              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
                  <p style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Chargement...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: 240, gap: 16 }}>
                  <span style={{ fontSize: 32, color: 'rgba(232,185,106,0.2)' }}>⊙</span>
                  <p style={{ fontSize: 14, color: 'var(--cream-muted)' }}>Aucune commande pour le moment</p>
                  <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>Découvrir la boutique →</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => {
                    const s = STATUS_MAP[order.status] || { label: order.status, color: 'var(--cream-muted)' };
                    const isExpanded = expandedOrder === order.uuid;
                    const detail = orderDetails[order.uuid];
                    const isLoadingDetail = detailLoading === order.uuid;

                    return (
                      <div key={order.uuid} style={{ background: 'rgba(240,234,210,0.04)', border: `0.5px solid ${isExpanded ? 'rgba(232,185,106,0.3)' : 'rgba(240,234,210,0.1)'}`, borderRadius: 4 }}>
                        {/* Header row */}
                        <button
                          onClick={() => toggleOrderDetail(order.uuid)}
                          className="w-full text-left"
                          style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                        >
                          <div>
                            <p style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{order.order_number}</p>
                            <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 2 }}>{fmtDate(order.created_at)}</p>
                          </div>
                          <span style={{ fontSize: 10, letterSpacing: '1px', color: s.color, border: `0.5px solid ${s.color}`, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{s.label}</span>
                          <p style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 500, minWidth: 100, textAlign: 'right' }}>{fmt(order.total_ttc)}</p>
                          <span style={{ fontSize: 16, color: 'var(--cream-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                        </button>

                        {/* Detail expandé */}
                        {isExpanded && (
                          <div style={{ borderTop: '0.5px solid rgba(240,234,210,0.08)', padding: '20px' }}>
                            {isLoadingDetail ? (
                              <p style={{ fontSize: 12, color: 'var(--cream-muted)', textAlign: 'center' }}>Chargement...</p>
                            ) : detail ? (
                              <div className="flex flex-col gap-5">
                                {/* Articles */}
                                <div>
                                  <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>Articles</p>
                                  <div className="flex flex-col gap-2">
                                    {detail.items.map((item, i) => (
                                      <div key={i} className="flex justify-between items-start gap-4" style={{ paddingBottom: 8, borderBottom: '0.5px solid rgba(240,234,210,0.05)' }}>
                                        <div className="flex-1">
                                          <p style={{ fontSize: 13, color: 'var(--cream)' }}>{item.product_name}</p>
                                          <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 2 }}>
                                            {item.variant_size && `Taille: ${item.variant_size}`}
                                            {item.variant_size && item.variant_color && ' · '}
                                            {item.variant_color && `Couleur: ${item.variant_color}`}
                                          </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <p style={{ fontSize: 12, color: 'var(--cream-muted)' }}>× {item.quantity}</p>
                                          <p style={{ fontSize: 13, color: 'var(--gold)', marginTop: 2 }}>{fmt(item.subtotal_ttc)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Totaux */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                  <div>
                                    <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 10 }}>Récapitulatif</p>
                                    {[
                                      ['Sous-total HT', fmt(detail.subtotal_ht)],
                                      ['TVA', fmt(detail.tva_amount)],
                                      ['Livraison', detail.shipping_cost === 0 ? 'Gratuite' : fmt(detail.shipping_cost)],
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex justify-between" style={{ fontSize: 12, color: 'var(--cream-muted)', marginBottom: 4 }}>
                                        <span>{k}</span><span>{v}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between" style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500, borderTop: '0.5px solid rgba(240,234,210,0.1)', paddingTop: 8, marginTop: 4 }}>
                                      <span>Total TTC</span><span style={{ color: 'var(--gold)' }}>{fmt(detail.total_ttc)}</span>
                                    </div>
                                  </div>

                                  {detail.shipping_address_snapshot && (
                                    <div>
                                      <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 10 }}>Adresse de livraison</p>
                                      <div style={{ fontSize: 12, color: 'var(--cream-muted)', lineHeight: 1.7 }}>
                                        <p style={{ color: 'var(--cream)', fontWeight: 500 }}>{detail.shipping_address_snapshot.recipient_name}</p>
                                        <p>{detail.shipping_address_snapshot.street}</p>
                                        <p>{detail.shipping_address_snapshot.city}{detail.shipping_address_snapshot.state ? `, ${detail.shipping_address_snapshot.state}` : ''}</p>
                                        <p>{detail.shipping_address_snapshot.country}</p>
                                        {detail.shipping_address_snapshot.phone && <p>{detail.shipping_address_snapshot.phone}</p>}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {detail.notes && (
                                  <div>
                                    <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 6 }}>Note</p>
                                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', fontStyle: 'italic' }}>{detail.notes}</p>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ADRESSES */}
          {tab === 'adresses' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {addresses.map((addr) => (
                  <div key={addr.uuid} style={{ padding: '20px 24px', background: 'rgba(240,234,210,0.04)', border: `0.5px solid ${addr.is_default ? 'rgba(232,185,106,0.4)' : 'rgba(240,234,210,0.1)'}`, borderRadius: 4 }}>
                    <div className="flex items-start justify-between mb-2">
                      <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>{addr.label || '—'}</p>
                      {addr.is_default && <span style={{ fontSize: 9, letterSpacing: '1px', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.3)', padding: '1px 8px', borderRadius: 20 }}>Par defaut</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{addr.recipient_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4, lineHeight: 1.6 }}>{addr.street}<br />{addr.city}{addr.state ? `, ${addr.state}` : ''}<br />{addr.country}</p>
                    {addr.phone && <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>{addr.phone}</p>}
                    <div className="flex gap-2 mt-4">
                      {!addr.is_default && <button onClick={() => handleSetDefault(addr.uuid)} style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.3)', padding: '4px 10px', borderRadius: 2 }}>Definir par defaut</button>}
                      <button onClick={() => handleDeleteAddress(addr.uuid)} style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(210,80,80,0.8)', border: '0.5px solid rgba(210,80,80,0.25)', padding: '4px 10px', borderRadius: 2 }}>Supprimer</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setShowAddressForm(true)} className="flex flex-col items-center justify-center gap-2" style={{ padding: '20px', border: '0.5px dashed rgba(240,234,210,0.15)', borderRadius: 4, minHeight: 120 }}>
                  <span style={{ fontSize: 24, color: 'var(--cream-muted)' }}>+</span>
                  <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Ajouter</span>
                </button>
              </div>
              {showAddressForm && (
                <div style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: '28px', maxWidth: 540 }}>
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>Nouvelle adresse</p>
                  <form onSubmit={handleAddAddress} className="flex flex-col gap-4">
                    <Input label="Libelle" value={addrForm.label} onChange={setAddr('label')} required placeholder="Domicile, Bureau..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Nom complet" value={addrForm.recipient_name} onChange={setAddr('recipient_name')} required placeholder="Prenom Nom" />
                      <Input label="Telephone" value={addrForm.phone} onChange={setAddr('phone')} required placeholder="+228 ..." type="tel" />
                    </div>
                    <Input label="Adresse" value={addrForm.street} onChange={setAddr('street')} required placeholder="Rue, quartier..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Ville" value={addrForm.city} onChange={setAddr('city')} required placeholder="Lome" />
                      <Input label="Region" value={addrForm.state} onChange={setAddr('state')} required placeholder="Maritime" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Code postal" value={addrForm.postal_code} onChange={setAddr('postal_code')} placeholder="00228" />
                      <Input label="Pays" value={addrForm.country} onChange={setAddr('country')} required placeholder="Togo" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={addrForm.is_default} onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))} className="accent-[#E8B96A]" />
                      <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>Definir comme adresse par defaut</span>
                    </label>
                    {addrError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{addrError}</p>}
                    <div className="flex gap-3">
                      <button type="submit" disabled={addrLoading} className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>{addrLoading ? '...' : 'Enregistrer'}</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>Annuler</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── FAVORIS */}
          {tab === 'favoris' && (
            wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: 300, gap: 16 }}>
                <span style={{ fontSize: 32, color: 'rgba(232,185,106,0.2)' }}>♡</span>
                <p style={{ fontSize: 14, color: 'var(--cream-muted)' }}>Votre liste de favoris est vide</p>
                <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>Decouvrir la boutique →</Link>
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
