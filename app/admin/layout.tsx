'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true, icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  ) },
  { href: '/admin/commandes', label: 'Commandes', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  ) },
  { href: '/admin/produits', label: 'Produits', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
  ) },
  { href: '/admin/categories', label: 'Catégories', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
  ) },
  { href: '/admin/stock', label: 'Stock', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ) },
  { href: '/admin/clients', label: 'Clients', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ) },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
  ) },
];

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchMe, logout } = useAuthStore();

  const [expanded, setExpanded] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchMe().then(() => {
      if (!useAuthStore.getState().isAuthenticated) router.replace('/admin/connexion');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hydrated && !isAuthenticated && pathname !== '/admin/connexion') {
      router.replace('/admin/connexion');
    }
  }, [hydrated, isAuthenticated, pathname]);

  if (pathname === '/admin/connexion') return <>{children}</>;

  if (!hydrated || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1209', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E8B96A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleLogout = () => { logout(); router.replace('/'); };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'A';

  const sidebarW = expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#141a0b', fontFamily: 'var(--font-dm-sans)' }}>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
        background: '#1c2310',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        transition: 'width 0.22s ease, min-width 0.22s ease',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: expanded ? '18px 16px 14px' : '18px 0 14px',
          borderBottom: '1px solid rgba(255,255,255,0.09)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          transition: 'padding 0.22s ease',
        }}>
          <img
            src="/images/noBack.png"
            alt="La Catena"
            style={{
              width: expanded ? 90 : 38,
              height: expanded ? 90 : 38,
              objectFit: 'contain',
              filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(232,185,106,0.18))',
              transition: 'width 0.22s ease, height 0.22s ease',
              flexShrink: 0,
            }}
          />
          {expanded && (
            <div style={{
              fontSize: 8, color: 'rgba(255,255,255,0.4)',
              letterSpacing: '3px', textTransform: 'uppercase', marginTop: 6,
              whiteSpace: 'nowrap',
            }}>
              Administration
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!expanded ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  gap: expanded ? 10 : 0,
                  padding: expanded ? '10px 12px' : '11px 0',
                  borderRadius: 7,
                  marginBottom: 2,
                  color: active ? '#E8B96A' : 'rgba(255,255,255,0.82)',
                  background: active ? 'rgba(232,185,106,0.12)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.8, flexShrink: 0 }}>{item.icon}</span>
                {expanded && (
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            title={!expanded ? 'Déconnexion' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: expanded ? 'flex-start' : 'center',
              gap: expanded ? 10 : 0,
              width: '100%',
              padding: expanded ? '10px 12px' : '11px 0',
              borderRadius: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'left',
              transition: 'color 0.15s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e07070')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {expanded && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div style={{
        marginLeft: sidebarW,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        transition: 'margin-left 0.22s ease',
      }}>

        {/* Top header */}
        <header style={{
          height: 58,
          background: '#1c2310',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Bouton toggle sidebar */}
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Réduire le menu' : 'Développer le menu'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.75)',
                display: 'flex', flexDirection: 'column', gap: 5, padding: 4, borderRadius: 4,
              }}
            >
              <span style={{ display: 'block', width: 20, height: 1.5, background: 'currentColor', borderRadius: 2 }} />
              <span style={{ display: 'block', width: expanded ? 14 : 20, height: 1.5, background: 'currentColor', borderRadius: 2, transition: 'width 0.2s' }} />
              <span style={{ display: 'block', width: 20, height: 1.5, background: 'currentColor', borderRadius: 2 }} />
            </button>

            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>
              {pathname.replace('/admin', '').replace(/\//g, ' / ').replace(/^\s*\/?\s*/, 'Admin / ').trim() || 'Admin / Dashboard'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              Bonjour, <span style={{ color: '#E8B96A', fontWeight: 500 }}>{user?.first_name}</span>
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(232,185,106,0.18)',
              border: '1.5px solid rgba(232,185,106,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#E8B96A',
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
