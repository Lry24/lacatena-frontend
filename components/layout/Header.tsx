'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fermer le menu mobile au clic en dehors
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const linkStyle: React.CSSProperties = {
    fontSize: 16,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: scrolled ? 'rgba(245,237,216,0.75)' : 'rgba(245,237,216,0.9)',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s',
  };

  return (
    <header
      ref={menuRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled || searchOpen ? 'rgba(26,31,14,0.98)' : 'transparent',
        backdropFilter: scrolled || searchOpen ? 'blur(14px)' : 'none',
        borderBottom: scrolled || searchOpen ? '0.5px solid rgba(240,234,210,0.08)' : 'none',
      }}
    >
      {/* ── Main nav ────────────────────────────────────────────────── */}
      <div
        className="flex items-center"
        style={{ padding: '0 40px', height: 68, maxWidth: 1440, margin: '0 auto' }}
      >
        {/* LEFT */}
        <nav className="hidden md:flex items-center gap-8 flex-1">
          {NAV_LEFT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={linkStyle}
              className="hover:text-[#E8B96A] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CENTER — Logo */}
        <div className="flex-1 flex justify-center md:flex-none">
          <Link href="/" className="group relative block" style={{ width: 160, height: 70 }}>
            <Image
              src="/images/noBack.png"
              alt="La Catena"
              fill
              className="object-contain transition-all duration-300 group-hover:opacity-80"
              sizes="160px"
              style={{ filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(232,185,106,0.2))' }}
              priority
            />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
          {NAV_RIGHT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={linkStyle}
              className="hover:text-[#E8B96A] transition-colors"
            >
              {item.label}
            </Link>
          ))}

          <div style={{ width: '0.5px', height: 14, background: 'rgba(240,234,210,0.2)' }} />

          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Rechercher"
            className="transition-opacity hover:opacity-60 text-[rgba(245,237,216,0.8)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link href="/favoris" aria-label="Favoris" className="relative transition-opacity hover:opacity-60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={wishlistItems.length > 0 ? 'var(--gold)' : 'rgba(245,237,216,0.8)'} strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={wishlistItems.length > 0 ? 'var(--gold)' : 'none'} />
            </svg>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-medium"
                style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--gold)', color: '#2D3A0F' }}>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/panier" aria-label="Panier" className="relative transition-opacity hover:opacity-60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.8)" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-medium"
                style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--gold)', color: '#2D3A0F' }}>
                {totalItems}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link href={mounted && isAuthenticated ? '/mon-compte' : '/connexion'} aria-label="Compte" className="transition-opacity hover:opacity-60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.8)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>

        {/* Mobile icons */}
        <div className="flex md:hidden items-center gap-4 ml-auto">
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Rechercher"
            className="text-[rgba(245,237,216,0.85)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <Link href="/panier" className="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(245,237,216,0.85)" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center text-[8px]"
                style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--gold)', color: '#2D3A0F' }}>
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 5 }} aria-label="Menu" aria-expanded={menuOpen}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="block transition-all duration-200" style={{
                height: 1, background: 'rgba(245,237,216,0.85)', width: '100%',
                transform: menuOpen ? (i === 0 ? 'rotate(45deg) translateY(6px)' : i === 2 ? 'rotate(-45deg) translateY(-6px)' : 'none') : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </div>

      {/* ── Search Dropdown Bar ─────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="animate-fade-up border-t"
          style={{
            background: 'rgba(20,24,10,0.98)',
            borderTopColor: 'rgba(232,185,106,0.2)',
            borderBottom: '0.5px solid rgba(232,185,106,0.2)',
            padding: '16px 40px',
          }}
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 max-w-[700px] mx-auto">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une pièce, une marque, une couleur..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(240,234,210,0.4)]"
              style={{ color: 'var(--cream)', fontSize: 14 }}
            />
            <button
              type="submit"
              className="uppercase tracking-widest text-[10px] font-medium px-4 py-2 rounded transition-colors"
              style={{ background: 'var(--gold)', color: '#2D3A0F' }}
            >
              Rechercher
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-[var(--cream-muted)] hover:text-[var(--cream)] transition-colors text-lg px-2"
              aria-label="Fermer la recherche"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* ── Mobile menu ─────────────────────────────────────────────── */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? 460 : 0,
          background: 'rgba(26,31,14,0.98)',
          borderBottom: menuOpen ? '0.5px solid rgba(240,234,210,0.08)' : 'none',
        }}
      >
        <div style={{ padding: '28px 32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 pb-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--cream)', fontSize: 13 }}
            />
            <button type="submit" style={{ color: 'var(--gold)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {[...NAV_LEFT, ...NAV_RIGHT].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
              style={{ fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>
              {item.label}
            </Link>
          ))}
          <div style={{ height: '0.5px', background: 'var(--border)' }} />
          <Link href="/favoris" onClick={() => setMenuOpen(false)}
            style={{ fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>
            Favoris
          </Link>
          <Link href={mounted && isAuthenticated ? '/mon-compte' : '/connexion'} onClick={() => setMenuOpen(false)}
            style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>
            {mounted && isAuthenticated ? 'Mon compte' : 'Connexion'}
          </Link>
        </div>
      </div>
    </header>
  );
}
