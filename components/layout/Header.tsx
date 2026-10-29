'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cartCount, useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { useMounted } from '@/components/ui';

const NAV_LEFT = [
  { label: 'Femme', href: '/boutique?categorie=femme' },
  { label: 'Homme', href: '/boutique?categorie=homme' },
  { label: 'Enfant', href: '/boutique?categorie=enfant' },
  { label: 'Accessoires', href: '/boutique?categorie=accessoires' },
];

const NAV_RIGHT = [
  { label: 'Nouveautés', href: '/boutique?nouveau=1' },
  { label: 'Promos', href: '/boutique?promo=1' },
];

const icon = 'rgba(245,237,216,0.85)';

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const mounted = useMounted();
  const count = cartCount(useCart((s) => s.lines));
  const wished = useWishlist((s) => s.items.length);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  // En descendant, le header s'efface pour laisser place aux pièces ; il revient dès qu'on remonte
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) { setHidden(y > 320 && y > last); last = y; }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // La pastille du panier rebondit quand le nombre de pièces augmente
  const [bumpKey, setBumpKey] = useState(0);
  const [lastCount, setLastCount] = useState(count);
  if (count !== lastCount) { if (count > lastCount) setBumpKey((k) => k + 1); setLastCount(count); }

  // Changement de page : menus refermés
  const [path, setPath] = useState(pathname);
  if (path !== pathname) { setPath(pathname); setMenuOpen(false); setSearchOpen(false); }
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const solid = !transparent || scrolled || menuOpen || searchOpen;
  const linkStyle: React.CSSProperties = { fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(245,237,216,0.85)', whiteSpace: 'nowrap' };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  const badge = (n: number, key?: number) => mounted && n > 0 ? (
    <span key={key} className={`absolute -top-1.5 -right-2 flex items-center justify-center ${key ? 'bump' : ''}`} style={{ minWidth: 15, height: 15, padding: '0 3px', borderRadius: 8, background: 'var(--gold)', color: '#2D3A0F', fontSize: 9, fontWeight: 600 }}>{n}</span>
  ) : null;

  const retracted = hidden && !menuOpen && !searchOpen;

  return (
    <header className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: solid ? 'rgba(26,31,14,0.97)' : 'transparent', backdropFilter: solid ? 'blur(14px)' : 'none',
        borderBottom: solid ? '0.5px solid rgba(240,234,210,0.08)' : '0.5px solid transparent',
        transform: retracted ? 'translateY(-100%)' : 'none',
        transition: 'transform .45s cubic-bezier(.16,1,.3,1), background .5s ease, border-color .5s ease',
      }}>
      <div className="flex items-center px-4 md:px-10" style={{ height: 68, maxWidth: 1440, margin: '0 auto' }}>
        <nav className="hidden lg:flex items-center gap-8 flex-1" aria-label="Univers">
          {NAV_LEFT.map((item) => (
            <Link key={item.href} href={item.href} style={linkStyle} className="nav-link hover:!text-[#E8B96A] transition-colors">{item.label}</Link>
          ))}
        </nav>

        <div className="flex-1 lg:hidden">
          <button className="flex flex-col" onClick={() => setMenuOpen(!menuOpen)} style={{ width: 22, gap: 5 }} aria-label="Menu" aria-expanded={menuOpen}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="block transition-all duration-200" style={{
                height: 1, background: icon, width: '100%',
                transform: menuOpen ? (i === 0 ? 'rotate(45deg) translateY(6px)' : i === 2 ? 'rotate(-45deg) translateY(-6px)' : 'none') : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        <div className="flex justify-center">
          <Link href="/" className="group" aria-label="La Catena — accueil">
            <Image src="/images/noBack.png" alt="La Catena" width={160} height={70} priority
              className="object-contain transition-opacity duration-300 group-hover:opacity-80"
              style={{ filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(232,185,106,0.2))' }} />
          </Link>
        </div>

        <div className="flex items-center gap-5 md:gap-7 flex-1 justify-end">
          <nav className="hidden lg:flex items-center gap-8" aria-label="Sélections">
            {NAV_RIGHT.map((item) => (
              <Link key={item.href} href={item.href} style={linkStyle} className="nav-link hover:!text-[#E8B96A] transition-colors">{item.label}</Link>
            ))}
          </nav>
          <div className="hidden lg:block" style={{ width: '0.5px', height: 14, background: 'rgba(240,234,210,0.2)' }} />
          <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Rechercher" className="transition-opacity hover:opacity-60">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={icon} strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          </button>
          <Link href="/suivi" aria-label="Suivre une commande" title="Suivre une commande" className="hidden sm:block transition-opacity hover:opacity-60">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={icon} strokeWidth="1.5"><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></svg>
          </Link>
          <Link href="/favoris" aria-label="Favoris" className="relative transition-opacity hover:opacity-60">
            <svg width="17" height="17" viewBox="0 0 24 24" fill={mounted && wished ? 'var(--gold)' : 'none'} stroke={mounted && wished ? 'var(--gold)' : icon} strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {badge(wished)}
          </Link>
          <Link href="/panier" aria-label="Panier" className="relative transition-opacity hover:opacity-60">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={icon} strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            {badge(count, bumpKey)}
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: searchOpen ? 120 : 0 }} inert={!searchOpen}>
        <form onSubmit={submitSearch} className="flex items-center gap-4" style={{ maxWidth: 900, margin: '0 auto', padding: '8px 16px 24px' }}>
          <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Une robe, une marque, un sac…" aria-label="Recherche"
            className="flex-1 min-w-0 font-serif outline-none" style={{ background: 'transparent', borderBottom: '0.5px solid rgba(232,185,106,0.4)', color: 'var(--cream)', fontSize: 24, padding: '8px 0' }} />
          <button type="submit" style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)' }}>Rechercher →</button>
        </form>
      </div>

      {/* Menu mobile */}
      <div className="lg:hidden overflow-hidden transition-all duration-300" style={{ maxHeight: menuOpen ? 600 : 0 }} inert={!menuOpen}>
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[...NAV_LEFT, ...NAV_RIGHT, { label: 'Toute la boutique', href: '/boutique' }].map((item) => (
            <Link key={item.href} href={item.href} className="font-serif" style={{ fontSize: 22, color: 'var(--cream)' }}>{item.label}</Link>
          ))}
          <div style={{ height: '0.5px', background: 'var(--border)' }} />
          {[{ label: 'Suivre une commande', href: '/suivi' }, { label: 'Mes commandes', href: '/mes-commandes' }, { label: 'Contact', href: '/contact' }].map((item) => (
            <Link key={item.href} href={item.href} style={{ fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)' }}>{item.label}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
