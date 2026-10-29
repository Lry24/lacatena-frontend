'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import { HeroCarousel, Marquee, ProductRail, QuoteCarousel, type Slide } from '@/components/shop/Carousels';
import ProductImg from '@/components/shop/ProductImg';
import Reveal from '@/components/shop/Reveal';
import { api } from '@/lib/api';
import type { Category, Page, ProductCard as Card } from '@/lib/types';

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=1800&q=80&fit=crop`;

const SLIDES: Slide[] = [
  { eyebrow: 'Femme', title: "L'élégance", accent: 'a un accent.', text: 'Wax de cérémonie, lin d’été et pièces signatures, choisies une à une pour celles qui font tourner les têtes.', cta: 'Découvrir Femme', href: '/boutique?categorie=femme', image: '/images/hero/hero-split-02.jpg' },
  { eyebrow: 'Soirée', title: 'Les grands soirs,', accent: 'signés.', text: 'Tulle brodé, satin et sequins : nos robes de créateurs en séries très limitées.', cta: 'Voir les robes du soir', href: '/boutique?categorie=soiree', image: U('1568252542512-9fe8fe9c87bb') },
  { eyebrow: 'Homme', title: 'Le batik,', accent: 'version ville.', text: 'Chemises teintes à la main, t-shirts graphiques et costumes taillés pour durer.', cta: 'Découvrir Homme', href: '/boutique?categorie=homme', image: '/images/products/IMG_20260125_125420.png' },
  { eyebrow: 'Accessoires', title: 'La touche', accent: 'finale.', text: 'Cuir pleine fleur, or 18 carats, escarpins italiens : les détails qui changent tout.', cta: 'Voir les accessoires', href: '/boutique?categorie=accessoires', image: U('1758171692659-024183c2c272'), position: 'object-center' },
  { eyebrow: 'Enfant', title: 'Petits,', accent: 'mais pointus.', text: 'Robes de fête, ensembles en wax et premiers pas : de 2 à 10 ans.', cta: 'Découvrir Enfant', href: '/boutique?categorie=enfant', image: U('1759313560250-3bb4bc1d10bc'), position: 'object-center' },
];

const QUOTES = [
  { name: 'Ama K.', city: 'Lomé', text: "La qualité est exceptionnelle. Chaque pièce est exactement comme sur les photos, et l'équipe m'a appelée dans l'heure pour confirmer." },
  { name: 'Kwame D.', city: 'Kpalimé', text: "Une sélection vraiment pensée. On sent que chaque marque a été choisie avec soin. C'est rare." },
  { name: 'Fatou M.', city: 'Lomé', text: "J'ai suivi ma commande étape par étape et payé à la livraison. Simple, élégant, rassurant." },
];

const PROMISES = [
  { n: '01', title: 'Livraison offerte', text: 'À Lomé dès 50 000 FCFA, en 24 à 48 h.' },
  { n: '02', title: 'Paiement à la livraison', text: 'En espèces ou par Mobile Money, après notre appel.' },
  { n: '03', title: 'Suivi en direct', text: 'Votre numéro de commande et votre téléphone suffisent.' },
  { n: '04', title: 'Retrait en boutique', text: 'Gratuit, et l’essayage en prime.' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [arrivals, setArrivals] = useState<Card[] | null>(null);
  const [best, setBest] = useState<Card[] | null>(null);
  const [promos, setPromos] = useState<Card[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    api<Category[]>('/api/v1/categories').then(setCategories).catch(() => setCategories([]));
    api<Page<Card>>('/api/v1/products', { query: { sort: 'new', size: 10 } }).then((p) => setArrivals(p.items)).catch(() => setArrivals([]));
    api<Card[]>('/api/v1/products/bestsellers', { query: { limit: 10 } }).then(setBest).catch(() => setBest([]));
    api<Page<Card>>('/api/v1/products', { query: { promo: true, size: 3, sort: 'price_desc' } }).then((p) => setPromos(p.items)).catch(() => {});
    api<{ brands: string[] }>('/api/v1/products/facets').then((f) => setBrands(f.brands)).catch(() => {});
  }, []);

  const [femme, homme, enfant, accessoires] = ['femme', 'homme', 'enfant', 'accessoires'].map((s) => categories.find((c) => c.slug === s));
  const tile = (c: Category | undefined, n: string, className: string, sizes: string) => c && (
    <Reveal className={className} delay={(Number(n) - 1) * 110} y={40}>
    <Link href={`/boutique?categorie=${c.slug}`} className="group relative overflow-hidden block h-full w-full">
      <div className="absolute inset-0 transition-transform duration-[1200ms] group-hover:scale-[1.06]"><ProductImg src={c.image_url} alt={c.name} sizes={sizes} className="object-cover object-[center_25%]" /></div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,31,14,0.82) 0%, rgba(26,31,14,0) 55%)' }} />
      <span className="absolute top-5 left-6 font-serif" style={{ fontSize: 15, color: '#F5EDD8', opacity: 0.85 }}>{n}</span>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-serif" style={{ fontSize: 'clamp(28px, 2.8vw, 48px)', color: '#F5EDD8', lineHeight: 0.95, letterSpacing: '-1px' }}>{c.name}</p>
          <p style={{ fontSize: 12, color: 'rgba(245,237,216,0.75)', marginTop: 10, maxWidth: 300 }}>{c.description}</p>
        </div>
        <span className="flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:bg-[#E8B96A] group-hover:text-[#2D3A0F] group-hover:rotate-[-45deg]"
          style={{ width: 52, height: 52, borderRadius: '50%', border: '0.5px solid rgba(245,237,216,0.55)', color: '#F5EDD8' }}>→</span>
      </div>
    </Link>
    </Reveal>
  );

  return (
    <ShopShell transparent>
      <HeroCarousel slides={SLIDES} />

      {/* ── Bandeau défilant ─────────────────────────────────── */}
      <Marquee className="shop-dark" style={{ background: '#4A6020', color: '#E8B96A', padding: '18px 0' }}
        items={['Nouvelle collection', 'Wax de cérémonie', 'Lin d’été', 'Robes du soir', 'Maroquinerie', 'Paiement à la livraison', 'Retrait en boutique'].map((t) => (
          <span key={t} className="font-serif italic" style={{ fontSize: 22 }}>{t}</span>
        ))} />

      {/* ── Nouveautés ───────────────────────────────────────── */}
      <ProductRail eyebrow="Fraîchement arrivées" title={<>Les <em style={{ color: 'var(--gold)' }}>nouveautés</em></>} products={arrivals} href="/boutique?nouveau=1" badge="new" />

      {/* ── Univers en mosaïque : tuiles hautes ou carrées sur ordinateur, adaptées aux photos de mode verticales ── */}
      <section className="px-4 md:px-10" style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 1440, margin: '0 auto' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Quatre univers</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, color: 'var(--cream)', letterSpacing: '-1px' }}>Un vestiaire, <em style={{ color: 'var(--gold)' }}>toute la famille.</em></h2>
          </div>
          <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 380 }}>
            Créateurs togolais, maisons ouest-africaines et marques internationales réunis à une seule adresse.
          </p>
        </div>
        {categories.length ? (
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-5 md:auto-rows-[minmax(280px,36vh)]">
            {tile(femme, '01', 'col-span-2 aspect-[4/5] md:aspect-auto md:col-span-6 md:row-span-2', '(max-width: 768px) 100vw, 50vw')}
            {tile(homme, '02', 'aspect-[3/4] md:aspect-auto md:col-span-3 md:row-span-2', '(max-width: 768px) 50vw, 25vw')}
            {tile(enfant, '03', 'aspect-[3/4] md:aspect-auto md:col-span-3', '(max-width: 768px) 50vw, 25vw')}
            {tile(accessoires, '04', 'col-span-2 aspect-[4/3] md:aspect-auto md:col-span-3', '(max-width: 768px) 100vw, 25vw')}
          </div>
        ) : <div className="shimmer" style={{ height: '68vh' }} />}
      </section>

      {/* ── Lookbook vert ────────────────────────────────────── */}
      <section className="shop-dark relative overflow-hidden" style={{ background: '#1A1F0E' }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center px-4 md:px-10" style={{ maxWidth: 1440, margin: '0 auto', paddingTop: 112, paddingBottom: 112 }}>
          <Reveal className="relative" y={48} style={{ height: 'clamp(460px, 62vw, 680px)' }}>
            <div className="absolute overflow-hidden" style={{ left: 0, top: 0, width: '64%', height: '82%' }}>
              <Image src="/images/products/1773304264476.png" alt="Ensemble gilet en lin ivoire" fill className="object-cover object-top" sizes="(max-width: 1024px) 64vw, 32vw" />
            </div>
            <div className="absolute overflow-hidden" style={{ right: 0, bottom: 0, width: '50%', height: '58%', border: '8px solid #1A1F0E' }}>
              <Image src="/images/products/IMG_5380.JPG" alt="Robe wax soleil" fill className="object-cover object-top" sizes="(max-width: 1024px) 50vw, 25vw" />
            </div>
            <span className="absolute font-serif italic hidden md:block" style={{ right: '6%', top: '8%', fontSize: 120, lineHeight: 1, color: '#E8B96A', opacity: 0.18 }}>Lookbook</span>
          </Reveal>
          <Reveal delay={150}>
            <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>Le lookbook de la saison</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)', lineHeight: 1, color: 'var(--cream)', letterSpacing: '-1px', marginBottom: 24 }}>
              Lin ivoire, wax soleil<br /><em style={{ color: 'var(--gold)' }}>et lumière de Lomé.</em>
            </h2>
            <p style={{ color: 'var(--cream-muted)', fontSize: 15, lineHeight: 1.8, maxWidth: 460, marginBottom: 40 }}>
              Des tailleurs déstructurés qui respirent, des imprimés qui racontent une histoire. Une garde-robe pensée pour la chaleur, la fête et tout ce qui se passe entre les deux.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/boutique?categorie=ensembles-femme" className="btn-gold hover:brightness-110" style={{ background: '#E8B96A', color: '#2D3A0F', padding: '15px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>Shopper le look</Link>
              <Link href="/boutique?categorie=robes" className="btn-outline hover:border-[#E8B96A] hover:text-[#E8B96A]" style={{ border: '0.5px solid rgba(245,237,216,0.4)', color: '#F5EDD8', padding: '15px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Toutes les robes</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Meilleures ventes ────────────────────────────────── */}
      <ProductRail eyebrow="Celles qu'on s'arrache" title={<>Meilleures <em style={{ color: 'var(--gold)' }}>ventes</em></>} products={best} href="/boutique?tri=popular" badge="best" numbered />

      {/* ── Promos sur fond olive ────────────────────────────── */}
      <section className="shop-dark px-4 md:px-10" style={{ background: '#4A6020', marginTop: 96 }}>
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-center" style={{ maxWidth: 1440, margin: '0 auto', paddingTop: 80, paddingBottom: 80 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(232,185,106,0.8)', marginBottom: 16 }}>Offres de saison</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(36px, 4.5vw, 60px)', color: '#E8B96A', lineHeight: 1, letterSpacing: '-1px', marginBottom: 20 }}>Jusqu&apos;à −30 %<br />sur une sélection.</h2>
            <p style={{ color: 'rgba(245,237,216,0.8)', fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>Des pièces d&apos;exception à prix doux, tant qu&apos;il en reste.</p>
            <Link href="/boutique?promo=1" className="btn-gold inline-flex hover:brightness-110" style={{ background: '#E8B96A', color: '#2D3A0F', padding: '15px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>Voir les promotions</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {promos.map((p, i) => (
              <Reveal key={p.id} delay={i * 120} y={40} style={{ marginTop: i === 1 ? 48 : 0 }}>
              <Link href={`/produits/${p.slug}`} className="group block">
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><ProductImg src={p.image} alt={p.name} sizes="20vw" /></div>
                  {p.compare_at_price && <span className="absolute top-3 left-3" style={{ background: '#E8B96A', color: '#2D3A0F', fontSize: 9, fontWeight: 600, letterSpacing: '1px', padding: '4px 9px', borderRadius: 20 }}>−{Math.round((1 - p.price / p.compare_at_price) * 100)} %</span>}
                </div>
                <p className="truncate mt-3" style={{ fontSize: 13, color: '#F5EDD8' }}>{p.name}</p>
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marques ──────────────────────────────────────────── */}
      {brands.length > 0 && (
        <section style={{ paddingTop: 96, paddingBottom: 24 }}>
          <p className="text-center" style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 28 }}>Les maisons de La Catena</p>
          <Marquee style={{ color: 'var(--cream)' }} items={brands.map((b) => (
            <Link key={b} href={`/boutique?marque=${encodeURIComponent(b)}`} className="font-serif transition-colors hover:text-[var(--gold)]" style={{ fontSize: 'clamp(32px, 4vw, 56px)', letterSpacing: '-1px' }}>{b}</Link>
          ))} />
        </section>
      )}

      {/* ── Avis ─────────────────────────────────────────────── */}
      <section className="px-4" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <QuoteCarousel quotes={QUOTES} />
      </section>

      {/* ── Engagements ──────────────────────────────────────── */}
      <section className="px-4 md:px-10" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ maxWidth: 1440, margin: '0 auto' }}>
          {PROMISES.map((p, i) => (
            <div key={p.n} style={{ padding: '40px 24px', borderLeft: i % 2 === 1 ? '0.5px solid var(--border)' : undefined }} className={i === 2 ? 'lg:border-l lg:border-[var(--border)]' : ''}>
              <Reveal delay={i * 90}>
                <p className="font-serif" style={{ fontSize: 28, color: 'var(--gold)', marginBottom: 12 }}>{p.n}</p>
                <p style={{ fontSize: 14, color: 'var(--cream)', fontWeight: 500, marginBottom: 6 }}>{p.title}</p>
                <p style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.6 }}>{p.text}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>
    </ShopShell>
  );
}
