'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductCard, { ProductGridSkeleton } from '@/components/shop/ProductCard';
import ProductImg from '@/components/shop/ProductImg';
import { SectionTitle } from '@/components/ui';
import { api } from '@/lib/api';
import type { Category, Page, ProductCard as Card } from '@/lib/types';

const PROMISES = [
  { icon: '✦', label: 'Livraison offerte', sub: 'À Lomé dès 50 000 FCFA' },
  { icon: '◈', label: 'Paiement à la livraison', sub: 'Espèces ou Mobile Money' },
  { icon: '◎', label: 'Suivi de commande', sub: 'Chaque étape, en direct' },
  { icon: '↩', label: 'Retrait en boutique', sub: 'Gratuit, sous 24 h' },
];

const TESTIMONIALS = [
  { name: 'Ama K.', text: "La qualité est exceptionnelle. Chaque pièce est exactement comme sur les photos, et l'équipe m'a appelée dans l'heure pour confirmer." },
  { name: 'Kwame D.', text: "Une sélection vraiment pensée. On sent que chaque marque a été choisie avec soin. C'est rare à Lomé." },
  { name: 'Fatou M.', text: "J'ai suivi ma commande étape par étape et payé à la livraison. Simple, élégant, rassurant." },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [arrivals, setArrivals] = useState<Card[] | null>(null);
  const [best, setBest] = useState<Card[] | null>(null);

  useEffect(() => {
    api<Category[]>('/api/v1/categories').then(setCategories).catch(() => setCategories([]));
    api<Page<Card>>('/api/v1/products', { query: { sort: 'new', size: 8 } }).then((p) => setArrivals(p.items)).catch(() => setArrivals([]));
    api<Card[]>('/api/v1/products/bestsellers', { query: { limit: 8 } }).then(setBest).catch(() => setBest([]));
  }, []);

  return (
    <ShopShell transparent>
      {/* ── Hero partagé ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '100svh', minHeight: 560, display: 'flex' }}>
        <div className="relative overflow-hidden" style={{ flex: 1 }}>
          <Image src="/images/hero/hero-split-01.jpg" alt="La Catena — collection" fill className="object-cover object-top" priority sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,31,14,0.35) 0%, rgba(26,31,14,0.55) 100%)' }} />
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end" style={{ pointerEvents: 'none', paddingBottom: 64 }}>
          <div className="hidden md:block" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '0.5px', height: '100%', background: 'linear-gradient(to bottom, transparent 0%, rgba(232,185,106,0.25) 20%, rgba(232,185,106,0.25) 80%, transparent 100%)' }} />
          <div className="flex flex-col items-center text-center animate-fade-up" style={{ pointerEvents: 'auto', maxWidth: 460, padding: '0 24px' }}>
            <span style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.35)', padding: '5px 16px', borderRadius: 20, marginBottom: 20, background: 'rgba(26,31,14,0.35)' }}>
              Boutique Multibrand
            </span>
            <h1 className="font-serif" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', lineHeight: 1.08, color: 'var(--cream)', letterSpacing: '-0.5px', marginBottom: 28, textShadow: '0 2px 20px rgba(26,31,14,0.8)' }}>
              Chaque pièce,<br /><em style={{ color: 'var(--gold)' }}>choisie pour vous.</em>
            </h1>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/boutique" className="btn-gold hover:brightness-110" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                Découvrir la boutique
              </Link>
              <Link href="/boutique?nouveau=1" className="btn-outline hover:border-[#E8B96A] hover:text-[#E8B96A]" style={{ border: '0.5px solid rgba(240,234,210,0.5)', color: 'var(--cream)', padding: '14px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', background: 'rgba(26,31,14,0.3)' }}>
                Nouveautés
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden md:block relative overflow-hidden" style={{ flex: 1 }}>
          <Image src="/images/hero/hero-split-02.jpg" alt="La Catena — nouvelle collection" fill className="object-cover object-top" priority sizes="50vw" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,31,14,0.35) 0%, rgba(26,31,14,0.55) 100%)' }} />
        </div>
      </section>

      {/* ── Nos engagements ──────────────────────────────────── */}
      <section style={{ background: '#2D3A0F', borderTop: '0.5px solid rgba(232,185,106,0.15)', borderBottom: '0.5px solid rgba(232,185,106,0.15)' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ maxWidth: 1440, margin: '0 auto' }}>
          {PROMISES.map((item) => (
            <div key={item.label} className="flex items-center gap-4 px-4 md:px-8" style={{ paddingTop: 24, paddingBottom: 24, borderRight: '0.5px solid rgba(232,185,106,0.1)' }}>
              <span style={{ color: 'var(--gold)', fontSize: 18 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 12, letterSpacing: '1px', color: 'var(--cream)', fontWeight: 500 }}>{item.label}</p>
                <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 2 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Univers ──────────────────────────────────────────── */}
      <section className="px-4 md:px-10" style={{ paddingTop: 80, paddingBottom: 64, maxWidth: 1440, margin: '0 auto' }}>
        <SectionTitle>Explorer par univers</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/boutique?categorie=${cat.slug}`} className="group relative overflow-hidden" style={{ aspectRatio: '4/5', border: '0.5px solid rgba(240,234,210,0.08)' }}>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <ProductImg src={cat.image_url} alt={cat.name} sizes="(max-width: 1024px) 50vw, 25vw" />
              </div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,31,14,0.88) 0%, rgba(26,31,14,0.1) 55%)' }} />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="font-serif" style={{ fontSize: 'clamp(24px, 2.4vw, 34px)', color: 'var(--cream)', lineHeight: 1 }}>{cat.name}</p>
                <p className="transition-colors group-hover:text-[#E8B96A]" style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginTop: 10 }}>
                  {cat.product_count} pièces →
                </p>
              </div>
            </Link>
          ))}
          {categories.length === 0 && Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer" style={{ aspectRatio: '4/5' }} />)}
        </div>
      </section>

      {/* ── Nouvelles arrivées ───────────────────────────────── */}
      <section className="px-4 md:px-10" style={{ paddingBottom: 80, maxWidth: 1440, margin: '0 auto' }}>
        <SectionTitle action={<Link href="/boutique?nouveau=1" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', whiteSpace: 'nowrap' }}>Tout voir →</Link>}>
          Nouvelles arrivées
        </SectionTitle>
        {arrivals ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {arrivals.map((p) => <ProductCard key={p.id} product={p} badge="new" />)}
          </div>
        ) : <ProductGridSkeleton />}
      </section>

      {/* ── Éditorial ────────────────────────────────────────── */}
      <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
        <div className="grid md:grid-cols-2" style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex flex-col justify-center px-4 md:px-10 lg:pr-16" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>Notre identité</p>
            <h2 className="font-serif mb-5" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              Une boutique pensée<br /><em style={{ color: 'var(--gold)' }}>pour l&apos;Afrique d&apos;aujourd&apos;hui.</em>
            </h2>
            <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.8, marginBottom: 40, maxWidth: 440 }}>
              Créateurs togolais, maisons ouest-africaines et marques internationales : La Catena réunit des pièces qui racontent une histoire,
              du wax de cérémonie au sac en cuir pleine fleur.
            </p>
            <Link href="/boutique" className="btn-outline hover:text-[#f5cb85]" style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.35)', padding: '12px 24px', alignSelf: 'flex-start' }}>
              Découvrir nos marques
            </Link>
          </div>
          <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
            <Image src="/images/products/1773303836013.png" alt="La Catena — sélection en boutique" fill className="object-cover" style={{ objectPosition: 'center top' }} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* ── Meilleures ventes ────────────────────────────────── */}
      <section className="px-4 md:px-10" style={{ paddingTop: 80, paddingBottom: 80, maxWidth: 1440, margin: '0 auto' }}>
        <SectionTitle action={<Link href="/boutique?tri=popular" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', whiteSpace: 'nowrap' }}>Tout voir →</Link>}>
          Meilleures ventes
        </SectionTitle>
        {best ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {best.map((p) => <ProductCard key={p.id} product={p} badge="best" />)}
          </div>
        ) : <ProductGridSkeleton />}
      </section>

      {/* ── Bannière promo ───────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center px-4 md:px-10" style={{ background: '#4A6020', minHeight: 300 }}>
        <div className="hidden md:block" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%' }}>
          <Image src="/images/products/IMG_5394.JPG" alt="" fill className="object-cover object-top" sizes="45vw" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #4A6020 0%, rgba(74,96,32,0.2) 60%)' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: 560, padding: '56px 0' }}>
          <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(232,185,106,0.75)', marginBottom: 16 }}>Offres de saison</p>
          <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--gold)', lineHeight: 1.15 }}>Jusqu&apos;à −30 % sur<br />une sélection de pièces</h2>
          <p className="mb-8" style={{ color: 'rgba(240,234,210,0.75)', fontSize: 14, lineHeight: 1.6 }}>Des pièces d&apos;exception à prix doux, tant qu&apos;il en reste.</p>
          <Link href="/boutique?promo=1" className="btn-gold inline-flex hover:brightness-110" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '13px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
            Voir les promotions
          </Link>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────────── */}
      <section className="px-4 md:px-10" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <SectionTitle>Ce que disent nos clients</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 8, padding: 32 }}>
                <div className="flex gap-1 mb-4" aria-label="5 étoiles">{Array.from({ length: 5 }).map((_, s) => <span key={s} style={{ color: 'var(--gold)', fontSize: 12 }}>★</span>)}</div>
                <blockquote style={{ color: 'rgba(240,234,210,0.72)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Suivi ────────────────────────────────────────────── */}
      <section className="px-4" style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <span className="chain-divider block mb-8" style={{ fontSize: 14, letterSpacing: '4px', color: 'rgba(232,185,106,0.25)' }}>⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙</span>
        <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Déjà commandé ?</p>
        <h2 className="font-serif mb-4" style={{ fontSize: 32, color: 'var(--cream)', lineHeight: 1.2 }}>Où en est votre commande&nbsp;?</h2>
        <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Votre numéro de commande et votre téléphone suffisent : pas besoin de compte.
        </p>
        <Link href="/suivi" className="btn-outline hover:border-[#E8B96A]" style={{ display: 'inline-block', border: '0.5px solid rgba(232,185,106,0.45)', color: 'var(--gold)', padding: '13px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
          Suivre ma commande
        </Link>
      </section>
    </ShopShell>
  );
}
