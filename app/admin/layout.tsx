'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  ), exact: true },
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchMe, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchMe().then(() => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) {
        router.replace('/admin/connexion');
      }
    });
  }, []);

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
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace('/admin/connexion');
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : 'A';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1209', fontFamily: 'var(--font-dm-sans)' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#1a1f0e',
        borderRight: '1px solid rgba(240,234,210,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(240,234,210,0.06)' }}>
          <div style={{ fontSize: 18, color: '#E8B96A', fontFamily: 'var(--font-dm-serif)', letterSpacing: '-0.5px' }}>
            La Catena
          </div>
          <div style={{ fontSize: 9, color: 'rgba(240,234,210,0.4)', letterSpacing: '3px', textTransform: 'uppercase', marginTop: 4 }}>
            Administration
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 7,
                  marginBottom: 2,
                  color: active ? '#E8B96A' : 'rgba(240,234,210,0.6)',
                  background: active ? 'rgba(232,185,106,0.08)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(240,234,210,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px', borderRadius: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(240,234,210,0.5)', fontSize: 13, textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#c9634a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,234,210,0.5)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 56,
          background: '#1a1f0e',
          borderBottom: '1px solid rgba(240,234,210,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: '#f0ead2', cursor: 'pointer', display: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ fontSize: 12, color: 'rgba(240,234,210,0.4)' }}>
              {pathname.replace('/admin', '').replace(/\//g, ' / ').replace(/^/, 'Admin').trim() || 'Admin / Dashboard'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(240,234,210,0.6)' }}>
              Bonjour, <span style={{ color: '#E8B96A', fontWeight: 500 }}>{user?.first_name}</span>
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(232,185,106,0.15)',
              border: '1px solid rgba(232,185,106,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#E8B96A',
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 28px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes adminPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @media (max-width: 768px) {
          aside { transform: translateX(-100%); }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
