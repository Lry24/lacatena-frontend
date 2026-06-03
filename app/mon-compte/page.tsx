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
import api from '@/lib/api';
import type { AddressResponse, AddressCreate, OrderResponse } from '@/types';

type Tab = 'profil' | 'commandes' | 'adresses' | 'favoris';

function statusColor(status: string): string {
  switch (status) {
    case 'pending': return '#E8B96A';
    case 'confirmed': return '#4A6020';
    case 'shipped': return '#3b82f6';
    case 'delivered': return '#22c55e';
    case 'cancelled': return 'rgba(220,80,80,0.9)';
    default: return 'var(--cream-muted)';
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirm&eacute;e';
    case 'shipped': return 'Exp&eacute;di&eacute;e';
    case 'delivered': return 'Livr&eacute;e';
    case 'cancelled': return 'Annul&eacute;e';
    default: return status;
  }
}

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

  // Orders
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
    if (tab === 'commandes' && isAuthenticated) {
      setOrdersLoading(true);
      api.get<{ items: OrderResponse[]; total: number; page: number; pages: number }>('/users/me/orders')
        .then((r) => setOrders(r.data.items))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, isAuthenticated]);

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
      setAddrError(msg || "Erreur lors de l'enregistrement.");
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = (uuid: string) => {
    api.delete(`/users/me/addresses/${uuid}`)
      .then(() => setAddresses((prev) => prev.filter((a) => a.uuid !== uuid)))
      .catch(() => {});
  };

  const handleSetDefaultAddress = (uuid: string) => {
    api.patch(`/users/me/addresses/${uuid}/set-default`)
      .then(() => getUserAddresses().then(setAddresses))
      .catch(() => {});
  };

  const handleEditProfile = () => {
    if (!user) return;
    setProfileForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' });
    setEditingProfile(true);
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError('');
    try {
      await api.patch('/users/me', profileForm);
      await fetchMe();
      setEditingProfile(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setProfileError(msg || 'Erreur lors de la sauvegarde.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) { setPasswordError('Les mots de passe ne correspondent pas.'); return; }
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordMsg('');
    try {
      await api.patch('/users/me/password', { old_password: oldPassword, new_password: newPassword });
      setPasswordMsg('Mot de passe modifi&eacute; avec succ&egrave;s.');
      setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
      setShowPasswordForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setPasswordError(msg || 'Erreur lors du changement de mot de passe.');
    } finally {
      setPasswordSaving(false);
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
        <main style={{ paddingTop: 166, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13 }}>Chargement...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: 166 }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1440, margin: '0 auto' }}>

          {/* Bandeau admin */}
          {(user.role === 'admin' || user.role === 'staff') && (
            <Link href="/admin" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(74,96,32,0.2)', border: '1px solid rgba(232,185,106,0.3)',
              borderRadius: 8, padding: '14px 20px', marginBottom: 32,
              textDecoration: 'none',
            }}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8B96A" strokeWidth="1.6">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Espace Administration
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 2 }}>
                    Connect&eacute; en tant que <strong style={{ color: 'var(--cream)' }}>{user.role}</strong> &mdash; Acc&egrave;s au dashboard
                  </p>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Ouvrir &rarr;
              </span>
            </Link>
          )}

          {/* Header compte */}
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
              D&eacute;connexion
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

          {/* Tab: Profil */}
          {tab === 'profil' && (
            <div style={{ maxWidth: 480 }}>
              {!editingProfile ? (
                <>
                  <div className="flex flex-col gap-5 mb-8">
                    {[
                      { label: 'Pr&eacute;nom', value: user.first_name },
                      { label: 'Nom', value: user.last_name },
                      { label: 'Email', value: user.email },
                      { label: 'T&eacute;l&eacute;phone', value: user.phone || '—' },
                      { label: 'Statut', value: user.is_verified ? 'V&eacute;rifi&eacute;' : 'Non v&eacute;rifi&eacute;' },
                    ].map((field) => (
                      <div key={field.label}>
                        <p style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: field.label }} />
                        <p style={{ fontSize: 14, color: field.label === 'Statut' && user.is_verified ? 'var(--gold)' : 'var(--cream)' }} dangerouslySetInnerHTML={{ __html: field.value }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditProfile}
                      className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                      style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '10px 20px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                    >
                      Modifier le profil
                    </button>
                    <button
                      onClick={() => { setShowPasswordForm((v) => !v); setPasswordMsg(''); setPasswordError(''); }}
                      style={{ border: '0.5px solid rgba(240,234,210,0.2)', color: 'var(--cream-muted)', padding: '10px 20px', borderRadius: 2, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}
                    >
                      Changer le mot de passe
                    </button>
                  </div>
                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4 mt-8" style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: 24 }}>
                      <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Changer le mot de passe</p>
                      <Input label="Ancien mot de passe" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required placeholder="Mot de passe actuel" />
                      <Input label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="8 caract&egrave;res minimum" />
                      <Input label="Confirmer le nouveau mot de passe" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required placeholder="Confirmer" />
                      {passwordError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{passwordError}</p>}
                      {passwordMsg && <p style={{ fontSize: 12, color: 'var(--gold)' }} dangerouslySetInnerHTML={{ __html: passwordMsg }} />}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                          style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                        >
                          {passwordSaving ? '...' : 'Enregistrer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Modifier le profil</p>
                  <Input label="Pr&eacute;nom" value={profileForm.first_name} onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))} required placeholder="Pr&eacute;nom" />
                  <Input label="Nom" value={profileForm.last_name} onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))} required placeholder="Nom" />
                  <Input label="T&eacute;l&eacute;phone" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+228 ..." type="tel" />
                  {profileError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{profileError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                      style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                    >
                      {profileSaving ? '...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Commandes */}
          {tab === 'commandes' && (
            <div>
              {ordersLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ height: 72, background: 'rgba(240,234,210,0.04)', borderRadius: 4, border: '0.5px solid rgba(240,234,210,0.1)' }} />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: 240, gap: 16 }}>
                  <span style={{ fontSize: 32, color: 'rgba(232,185,106,0.2)' }}>&#9711;</span>
                  <p style={{ fontSize: 14, color: 'var(--cream-muted)' }}>Aucune commande pour le moment</p>
                  <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                    D&eacute;couvrir la boutique &rarr;
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => (
                    <div key={order.uuid} style={{ padding: '20px 24px', background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4 }}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: '1px' }}>{order.order_number}</p>
                          <p style={{ fontSize: 11, color: 'var(--cream-muted)' }}>
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p style={{ fontSize: 14, color: 'var(--cream)', fontWeight: 500 }}>
                            {order.total_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                          </p>
                          <span style={{
                            fontSize: 10, letterSpacing: '1px', padding: '3px 10px',
                            border: `0.5px solid ${statusColor(order.status)}`,
                            borderRadius: 20, color: statusColor(order.status),
                            textTransform: 'uppercase',
                          }} dangerouslySetInnerHTML={{ __html: statusLabel(order.status) }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Adresses */}
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
                      {addr.is_default && (
                        <span style={{ fontSize: 9, letterSpacing: '1px', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.3)', padding: '1px 8px', borderRadius: 20 }}>
                          Par d&eacute;faut
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{addr.recipient_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4, lineHeight: 1.6 }}>
                      {addr.street}<br />{addr.city}, {addr.state}<br />{addr.country}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>{addr.phone}</p>
                    <div className="flex gap-2 mt-4">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.uuid)}
                          style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.3)', padding: '4px 10px', borderRadius: 2 }}
                        >
                          Par d&eacute;faut
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.uuid)}
                        className="transition-colors hover:text-red-400"
                        style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--cream-muted)', border: '0.5px solid rgba(240,234,210,0.15)', padding: '4px 10px', borderRadius: 2 }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex flex-col items-center justify-center gap-2 transition-colors"
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
                    <Input label="Libell&eacute;" value={addrForm.label} onChange={setAddr('label')} required placeholder="Domicile, Bureau..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Nom complet" value={addrForm.recipient_name} onChange={setAddr('recipient_name')} required placeholder="Prenom Nom" />
                      <Input label="T&eacute;l&eacute;phone" value={addrForm.phone} onChange={setAddr('phone')} required placeholder="+228 ..." type="tel" />
                    </div>
                    <Input label="Adresse" value={addrForm.street} onChange={setAddr('street')} required placeholder="Rue, quartier..." />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Ville" value={addrForm.city} onChange={setAddr('city')} required placeholder="Lome" />
                      <Input label="R&eacute;gion" value={addrForm.state} onChange={setAddr('state')} required placeholder="Maritime" />
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
                      <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>D&eacute;finir comme adresse par d&eacute;faut</span>
                    </label>
                    {addrError && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{addrError}</p>}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={addrLoading}
                        className="flex-1 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                        style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                      >
                        {addrLoading ? '...' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        style={{ padding: '12px 16px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2, color: 'var(--cream-muted)', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Tab: Favoris */}
          {tab === 'favoris' && (
            wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: 300, gap: 16 }}>
                <span style={{ fontSize: 32, color: 'rgba(232,185,106,0.2)' }}>&#9825;</span>
                <p style={{ fontSize: 14, color: 'var(--cream-muted)' }}>Votre liste de favoris est vide</p>
                <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                  D&eacute;couvrir la boutique &rarr;
                </Link>
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
