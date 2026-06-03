'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';

const NAV_LEFT = [
  { label: 'Boutique', href: '/boutique' },
  { label: 'Nouveautés', href: '/boutique?is_new=true' },
  { label: 'Promos', href: '/boutique?is_promo=true' },
];

const NAV_RIGHT = [
  { label: 'Marques', href: '/boutique?sort=brand' },
  { label: 'Contact', href: '/contact' },
];

const ANNOUNCEMENTS = [
  '⊙  Livraison gratuite dès 50 000 FCFA  ⊙',
  '⊙  Nouvelles arrivées disponibles  ⊙',
  '⊙  Retours acceptés sous 14 jours  ⊙',
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Rotate announcements every 4s
  useEffect(() => {
    const t = setInterval(() => setAnnouncementIdx((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: '#1A1F0E' }}>

      {/* ── Announcement bar ──────────────────────────────────────────── */}
      <div style={{
        background: '#2D3A0F',
        borderBottom: '0.5px solid rgba(232,185,106,0.15)',
        padding: '7px 0',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <p
          key={announcementIdx}
          className="animate-fade-up"
          style={{ fontSize: 10, letterSpacing: '2.5px', color: 'var(--gold)', textTransform: 'uppercase' }}
        >
          {ANNOUNCEMENTS[announcementIdx]}
        </p>
      </div>

      {/* ── Main nav ──────────────────────────────────────────────────── */}
      <div
        className="transition-all duration-300"
        style={{
          borderBottom: '0.5px solid rgba(240,234,210,0.08)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          background: scrolled ? 'rgba(26,31,14,0.97)' : 'transparent',
        }}
      >
        <div
          className="flex items-center"
          style={{ padding: '0 40px', height: 96, maxWidth: 1440, margin: '0 auto' }}
        >
          {/* LEFT nav */}
          <nav className="hidden md:flex items-center gap-7 flex-1">
            {NAV_LEFT.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,237,216,0.75)' }}
                className="transition-colors hover:text-[#E8B96A] whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CENTER — Logo */}
          <div className="flex-1 flex justify-center md:flex-none md:mx-0">
            <Link href="/" className="flex items-center justify-center group" style={{ filter: 'drop-shadow(0 0 12px rgba(232,185,106,0.18))' }}>
              <Image
                src="/images/noBack.png"
                alt="La Catena"
                width={110}
                height={110}
                className="object-contain transition-all duration-300 group-hover:scale-105"
                style={{ filter: 'brightness(1.08)' }}
                priority
              />
            </Link>
          </div>

          {/* RIGHT nav + icons */}
          <div className="hidden md:flex items-center gap-7 flex-1 justify-end">
            {NAV_RIGHT.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,237,216,0.75)' }}
                className="transition-colors hover:text-[#E8B96A] whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ width: '0.5px', height: 16, background: 'rgba(240,234,210,0.2)' }} />

            {/* Search */}
            <Link href="/boutique" aria-label="Rechercher" className="transition-opacity hover:opacity-60">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.75)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link href="/favoris" aria-label="Favoris" className="relative transition-opacity hover:opacity-60">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={wishlistItems.length > 0 ? 'var(--gold)' : 'var(--cream-muted)'} strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={wishlistItems.length > 0 ? 'var(--gold)' : 'none'} />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-medium"
                  style={{ width: 15, height: 15, borderRadius: '50%', background: 'var(--gold)', color: '#2D3A0F' }}>
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/panier" aria-label="Panier" className="relative transition-opacity hover:opacity-60">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.75)" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-medium"
                  style={{ width: 15, height: 15, borderRadius: '50%', background: 'var(--gold)', color: '#2D3A0F' }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link href={isAuthenticated ? '/mon-compte' : '/connexion'} aria-label="Compte" className="transition-opacity hover:opacity-60">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.75)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>

          {/* Mobile icons */}
          <div className="flex md:hidden items-center gap-4 ml-auto">
            <Link href="/panier" className="relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.75)" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center text-[8px]"
                  style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--gold)', color: '#2D3A0F' }}>
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col justify-center gap-1.5" style={{ width: 22, height: 22 }} aria-label="Menu">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block transition-all duration-200" style={{
                  height: 1, background: 'rgba(245,237,216,0.75)', width: '100%',
                  transform: menuOpen ? (i === 0 ? 'rotate(45deg) translateY(5px)' : i === 2 ? 'rotate(-45deg) translateY(-5px)' : 'none') : 'none',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: menuOpen ? 400 : 0, background: '#1A1F0E', borderBottom: menuOpen ? '0.5px solid rgba(240,234,210,0.08)' : 'none' }}
      >
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[...NAV_LEFT, ...NAV_RIGHT].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>
              {item.label}
            </Link>
          ))}
          <div style={{ height: '0.5px', background: 'var(--border)' }} />
          <Link href="/favoris" onClick={() => setMenuOpen(false)} style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Favoris</Link>
          <Link href={isAuthenticated ? '/mon-compte' : '/connexion'} onClick={() => setMenuOpen(false)}
            style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>
            {isAuthenticated ? 'Mon compte' : 'Connexion'}
          </Link>
        </div>
      </div>
    </header>
  );
}
