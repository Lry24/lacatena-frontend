'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Nouveautés', href: '/boutique?is_new=true' },
  { label: 'Promotions', href: '/boutique?is_promo=true' },
  { label: 'Contact', href: '/contact' },
];

const INFO_LINKS = [
  { label: 'Mon compte', href: '/mon-compte' },
  { label: 'Mes commandes', href: '/mon-compte' },
  { label: 'Mes favoris', href: '/favoris' },
  { label: 'Livraison & retours', href: '/contact' },
  { label: 'Mentions légales', href: '/contact' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer style={{ background: '#1A1F0E', borderTop: '0.5px solid rgba(240,234,210,0.1)' }}>
      {/* Chain divider */}
      <div className="flex items-center justify-center" style={{ padding: '20px 40px 0' }}>
        <span className="chain-divider" style={{ fontSize: 14, letterSpacing: '4px', color: 'rgba(232,185,106,0.25)' }}>
          ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙
        </span>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-4 gap-12"
        style={{ padding: '56px 40px', maxWidth: 1440, margin: '0 auto' }}
      >
        {/* Col 1: Logo + tagline */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
              <Image src="/images/logo1.jpg" alt="La Catena" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-serif text-xl" style={{ color: 'var(--gold)', letterSpacing: '-0.5px' }}>
              La Catena
            </span>
          </Link>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cream-muted)', maxWidth: 220, lineHeight: 1.7, fontSize: 13 }}>
            Pièces sélectionnées. Marques choisies. Une seule adresse pour tout ce qui compte.
          </p>
          <div className="flex gap-3 mt-2">
            {['Instagram', 'Facebook', 'TikTok'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs uppercase transition-colors hover:text-[#E8B96A]"
                style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--cream-muted)' }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="flex flex-col gap-5">
          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Navigation
          </p>
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors hover:text-[#F0EAD2]"
                style={{ color: 'var(--cream-muted)', fontSize: 13 }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3: Infos */}
        <div className="flex flex-col gap-5">
          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Informations
          </p>
          <div className="flex flex-col gap-3">
            {INFO_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm transition-colors hover:text-[#F0EAD2]"
                style={{ color: 'var(--cream-muted)', fontSize: 13 }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--cream-muted)', fontSize: 12 }}>
              📍 Lomé, Togo
            </span>
            <span className="text-xs" style={{ color: 'var(--cream-muted)', fontSize: 12 }}>
              ✉ contact@lacatena.tg
            </span>
          </div>
        </div>

        {/* Col 4: Newsletter (hooked-ux) */}
        <div className="flex flex-col gap-5">
          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Newsletter
          </p>
          <p className="text-sm" style={{ color: 'var(--cream-muted)', fontSize: 13, lineHeight: 1.6 }}>
            Recevez en avant-première nos nouvelles collections et offres exclusives.
          </p>
          {subscribed ? (
            <div
              className="animate-fade-up text-sm"
              style={{ color: 'var(--gold)', fontSize: 13 }}
            >
              Merci ! Vous êtes inscrit(e). ✓
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="w-full px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(240,234,210,0.05)',
                  border: '0.5px solid rgba(240,234,210,0.1)',
                  borderRadius: 2,
                  color: 'var(--cream)',
                  fontSize: 13,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
              />
              <button
                type="submit"
                className="w-full text-xs font-medium uppercase tracking-widest transition-colors hover:bg-[#f5cb85]"
                style={{
                  background: 'var(--gold)',
                  color: '#2D3A0F',
                  padding: '12px',
                  borderRadius: 2,
                  letterSpacing: '2px',
                  fontSize: 10,
                }}
              >
                S'inscrire
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-2"
        style={{
          padding: '20px 40px',
          borderTop: '0.5px solid rgba(240,234,210,0.08)',
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        <p style={{ fontSize: 11, color: 'var(--cream-muted)', letterSpacing: '1px' }}>
          © {new Date().getFullYear()} La Catena — Boutique Multibrand. Tous droits réservés.
        </p>
        <span className="chain-divider hidden md:block" style={{ letterSpacing: '3px', fontSize: 10 }}>
          ⊙⊙⊙⊙⊙⊙
        </span>
        <p style={{ fontSize: 11, color: 'var(--cream-muted)', letterSpacing: '1px' }}>
          Paiement sécurisé · Livraison rapide
        </p>
      </div>
    </footer>
  );
}
