'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const SHOP = [
  { label: 'Femme', href: '/boutique?categorie=femme' },
  { label: 'Homme', href: '/boutique?categorie=homme' },
  { label: 'Enfant', href: '/boutique?categorie=enfant' },
  { label: 'Accessoires', href: '/boutique?categorie=accessoires' },
  { label: 'Nouveautés', href: '/boutique?nouveau=1' },
  { label: 'Promotions', href: '/boutique?promo=1' },
];

const HELP = [
  { label: 'Suivre ma commande', href: '/suivi' },
  { label: 'Mes commandes', href: '/mes-commandes' },
  { label: 'Mes favoris', href: '/favoris' },
  { label: 'Livraison & retours', href: '/contact#livraison' },
  { label: 'Nous contacter', href: '/contact' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ background: '#1A1F0E', borderTop: '0.5px solid rgba(240,234,210,0.1)' }}>
      <div className="flex items-center justify-center" style={{ padding: '20px 16px 0' }}>
        <span className="chain-divider" style={{ fontSize: 14, letterSpacing: '4px', color: 'rgba(232,185,106,0.25)' }}>⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-4 md:px-10" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 1440, margin: '0 auto' }}>
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label="La Catena">
            <Image src="/images/noBack.png" alt="La Catena" width={180} height={180} className="object-contain logo-levitate" />
          </Link>
          <p style={{ color: 'var(--cream-muted)', maxWidth: 240, lineHeight: 1.7, fontSize: 13 }}>
            Pièces sélectionnées. Marques choisies. Une seule adresse pour tout ce qui compte.
          </p>
        </div>

        {[{ title: 'La boutique', links: SHOP }, { title: 'Vos commandes', links: HELP }].map((col) => (
          <div key={col.title} className="flex flex-col gap-5">
            <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>{col.title}</p>
            <div className="flex flex-col gap-3">
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="transition-colors hover:text-[#F0EAD2]" style={{ color: 'var(--cream-muted)', fontSize: 13 }}>{l.label}</Link>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-5">
          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Le cercle La Catena</p>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13, lineHeight: 1.6 }}>
            Nouvelles collections et ventes privées, en avant-première.
          </p>
          {subscribed ? (
            <p className="animate-fade-up" style={{ color: 'var(--gold)', fontSize: 13 }}>Bienvenue dans le cercle. ✓</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }} className="flex flex-col gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre adresse e-mail" required aria-label="Adresse e-mail"
                className="lc-input w-full outline-none" style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.12)', borderRadius: 2, color: 'var(--cream)', fontSize: 13, padding: '12px 16px' }} />
              <button type="submit" className="btn-gold w-full hover:brightness-110" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: 12, borderRadius: 2, letterSpacing: '2px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>
                Rejoindre
              </button>
            </form>
          )}
          <div className="flex flex-col gap-2" style={{ color: 'var(--cream-muted)', fontSize: 12 }}>
            <span>Lomé, Togo · Lun–Sam, 9h–19h</span>
            <span>contact@lacatena.tg</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-4 md:px-10" style={{ paddingTop: 20, paddingBottom: 20, borderTop: '0.5px solid rgba(240,234,210,0.08)', maxWidth: 1440, margin: '0 auto' }}>
        <p style={{ fontSize: 11, color: 'var(--cream-muted)', letterSpacing: '1px' }}>© {new Date().getFullYear()} La Catena — Boutique Multibrand</p>
        <span className="chain-divider hidden md:block" style={{ letterSpacing: '3px', fontSize: 10 }}>⊙⊙⊙⊙⊙⊙</span>
        <p style={{ fontSize: 11, color: 'var(--cream-muted)', letterSpacing: '1px' }}>Paiement à la livraison · Mobile Money</p>
      </div>
    </footer>
  );
}
