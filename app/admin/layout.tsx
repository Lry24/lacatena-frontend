'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { A } from '@/components/admin/kit';
import { Toaster, useMounted } from '@/components/ui';
import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { useAdmin } from '@/store/admin';

const ico = (d: ReactNode) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const NAV: { href: string; label: string; icon: ReactNode; exact?: boolean; admin?: boolean; badge?: 'pending' }[] = [
  { href: '/admin', label: 'Tableau de bord', exact: true, icon: ico(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>) },
  { href: '/admin/commandes', label: 'Commandes', badge: 'pending', icon: ico(<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>) },
  { href: '/admin/produits', label: 'Produits', icon: ico(<><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1" /></>) },
  { href: '/admin/categories', label: 'Catégories', icon: ico(<><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></>) },
  { href: '/admin/stock', label: 'Stock', icon: ico(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></>) },
  { href: '/admin/clients', label: 'Clients', icon: ico(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>) },
  { href: '/admin/paiements', label: 'Paiements', icon: ico(<><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>) },
  { href: '/admin/livraison', label: 'Frais de livraison', icon: ico(<><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>) },
  { href: '/admin/comptes', label: 'Comptes équipe', admin: true, icon: ico(<><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></>) },
  { href: '/admin/reglages', label: 'Réglages', icon: ico(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>) },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const { token, user, login, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const isLogin = pathname === '/admin/connexion';

  useEffect(() => {
    if (!mounted || isLogin) return;
    if (!token) { router.replace(`/admin/connexion?suite=${encodeURIComponent(pathname)}`); return; }
    // Vérifie la session et rafraîchit le profil (rôle modifié, compte désactivé...)
    api<AdminUser>('/api/v1/admin/auth/me').then((u) => login(token, u)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, token, isLogin]);

  const [path, setPath] = useState(pathname);
  if (path !== pathname) { setPath(pathname); setOpen(false); }

  useEffect(() => {
    if (!token || isLogin) return;
    api<Record<string, number>>('/api/v1/admin/orders/counts').then((c) => setPending(c.PENDING || 0)).catch(() => {});
  }, [pathname, token, isLogin]);

  if (isLogin) return <>{children}<Toaster /></>;
  if (!mounted || !token || !user) {
    return <div style={{ minHeight: '100vh', background: A.bg }} className="flex items-center justify-center"><span className="spin-ring" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(232,185,106,0.25)', borderTopColor: A.gold }} /></div>;
  }

  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const sidebar = (
    <aside className="flex flex-col h-full" style={{ background: '#1c2310', borderRight: `1px solid ${A.border}`, width: 240 }}>
      <Link href="/admin" className="flex flex-col items-center" style={{ padding: '20px 16px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <Image src="/images/noBack.png" alt="La Catena" width={120} height={52} style={{ objectFit: 'contain' }} />
        <span style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: A.faint, marginTop: 6 }}>Administration</span>
      </Link>
      <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 10px' }}>
        {NAV.filter((n) => !n.admin || user.role === 'ADMIN').map((n) => {
          const on = active(n.href, n.exact);
          return (
            <Link key={n.href} href={n.href} className="flex items-center gap-3 transition-colors hover:bg-white/5"
              style={{ padding: '10px 12px', borderRadius: 7, marginBottom: 2, fontSize: 13, color: on ? A.gold : 'rgba(255,255,255,0.82)', background: on ? A.goldBg : undefined, fontWeight: on ? 500 : 400 }}>
              <span style={{ opacity: on ? 1 : 0.8 }}>{n.icon}</span>
              <span className="flex-1">{n.label}</span>
              {n.badge === 'pending' && pending > 0 && <span style={{ fontSize: 10, fontWeight: 600, minWidth: 20, textAlign: 'center', padding: '2px 6px', borderRadius: 10, background: A.gold, color: '#2D3A0F' }}>{pending}</span>}
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: 14, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: '50%', background: A.olive, color: A.gold, fontSize: 13, fontWeight: 600 }}>
            {(user.full_name || user.username).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate" style={{ fontSize: 13, color: A.text }}>{user.full_name || user.username}</p>
            <p style={{ fontSize: 11, color: A.faint }}>{user.role === 'ADMIN' ? 'Administrateur' : 'Gestionnaire'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank" style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '7px 0', borderRadius: 6, border: `1px solid ${A.border}`, color: A.muted }}>Voir la boutique</Link>
          <button onClick={() => { logout(); router.replace('/admin/connexion'); }} style={{ fontSize: 12, padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(232,160,138,0.3)', color: A.red }}>Quitter</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="admin-root flex" style={{ minHeight: '100vh', background: A.bg, color: A.text }}>
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40">{sidebar}</div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setOpen(false)} />
          <div className="relative">{sidebar}</div>
        </div>
      )}
      <div className="flex-1 min-w-0 lg:ml-[240px]">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between" style={{ padding: '12px 16px', background: '#1c2310', borderBottom: `1px solid ${A.border}` }}>
          <button onClick={() => setOpen(true)} aria-label="Menu" style={{ color: A.text, fontSize: 20 }}>☰</button>
          <Image src="/images/noBack.png" alt="La Catena" width={96} height={42} style={{ objectFit: 'contain' }} />
          <Link href="/admin/commandes?statut=PENDING" style={{ fontSize: 12, color: A.gold }}>{pending > 0 ? `${pending} à confirmer` : ''}</Link>
        </header>
        <main style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: 1400 }}>{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
