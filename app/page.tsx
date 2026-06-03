'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/common/ProductCard';
import { getProducts } from '@/lib/api';
import type { ProductResponse } from '@/types';

const CATEGORIES = [
  { label: 'Femme', img: '/images/categories/categories-01.png', href: '/boutique?gender=femme' },
  { label: 'Homme', img: '/images/categories/categories-02.png', href: '/boutique?gender=homme' },
  { label: 'Accessoires', img: '/images/categories/categories-03.png', href: '/boutique?category=accessoires' },
  { label: 'Enfant', img: '/images/categories/categories-04.png', href: '/boutique?gender=enfant' },
  { label: 'Nouveautés', img: '/images/categories/categories-05.png', href: '/boutique?is_new=true' },
  { label: 'Promos', img: '/images/categories/categories-06.png', href: '/boutique?is_promo=true' },
];

const ARRIVALS_IMGS = [
  '/images/arrivals/arrivals-01.png',
  '/images/arrivals/arrivals-02.png',
  '/images/arrivals/arrivals-03.png',
  '/images/arrivals/arrivals-04.png',
];

const TESTIMONIALS = [
  {
    name: 'Ama K.',
    text: 'La qualité est exceptionnelle. Chaque pièce est exactement comme décrite, et la livraison était rapide. Je reviendrai.',
    rating: 5,
  },
  {
    name: 'Kwame D.',
    text: "Une sélection vraiment curative. On sent que chaque marque a été choisie avec soin. C'est rare.",
    rating: 5,
  },
  {
    name: 'Fatou M.',
    text: "Service client impeccable. J'avais une question sur la taille, réponse en moins d'une heure. Bravo.",
    rating: 5,
  },
];

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<ProductResponse[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductResponse[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [newsEmail, setNewsEmail] = useState('');
  const [newsDone, setNewsDone] = useState(false);

  const heroImages = ['/images/hero/hero-01.png', '/images/hero/hero-02.png', '/images/hero/hero-03.png'];

  useEffect(() => {
    getProducts({ is_new: true, size: 4 }).then((d) => setNewArrivals(d.items)).catch(() => {});
    getProducts({ is_featured: true, size: 4 }).then((d) => setBestsellers(d.items)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  return (
    <>
      <Header />
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative flex items-end overflow-hidden" style={{ minHeight: '100vh' }}>
          {heroImages.map((src, i) => (
            <div key={src} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === heroIndex ? 1 : 0 }}>
              <Image src={src} alt="Hero" fill className="object-cover" priority={i === 0} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,31,14,0.85) 0%, rgba(26,31,14,0.3) 60%, transparent 100%)' }} />
            </div>
          ))}
          <div className="relative z-10 animate-fade-up" style={{ padding: '0 40px 80px', maxWidth: 680 }}>
            <span className="inline-block mb-6" style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.35)', padding: '5px 16px', borderRadius: 20 }}>
              Boutique Multibrand
            </span>
            <h1 className="font-serif mb-6" style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.1, color: 'var(--cream)', letterSpacing: '-1px' }}>
              Chaque pièce,<br /><span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>choisie pour vous.</span>
            </h1>
            <p className="mb-10" style={{ color: 'var(--cream-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 460 }}>
              Une sélection de marques premium, pensée pour celles et ceux qui savent ce qu&apos;ils veulent.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/boutique" className="inline-flex items-center gap-2 font-medium uppercase tracking-widest transition-colors hover:bg-[#f5cb85]" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
                Découvrir la collection
              </Link>
              <Link href="/boutique?sort=brand" className="inline-flex items-center gap-2 uppercase tracking-widest transition-colors" style={{ border: '0.5px solid rgba(240,234,210,0.3)', color: 'var(--cream)', padding: '14px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
                Nos marques
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 right-10 flex gap-2 z-10">
            {heroImages.map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? 24 : 6, height: 6, borderRadius: 3, background: i === heroIndex ? 'var(--gold)' : 'rgba(240,234,210,0.3)', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </section>

        {/* ── Labels ───────────────────────────────────────────────────────── */}
        <section style={{ background: '#2D3A0F', borderTop: '0.5px solid rgba(232,185,106,0.15)', borderBottom: '0.5px solid rgba(232,185,106,0.15)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ maxWidth: 1440, margin: '0 auto' }}>
            {[
              { icon: '✦', label: 'Livraison gratuite', sub: 'Dès 50 000 FCFA' },
              { icon: '↩', label: 'Retours 14 jours', sub: 'Sans frais' },
              { icon: '◎', label: 'Service client', sub: 'Lun–Sam, 9h–18h' },
              { icon: '◈', label: 'Paiement sécurisé', sub: 'Mobile money & carte' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4" style={{ padding: '24px 32px', borderRight: i < 3 ? '0.5px solid rgba(232,185,106,0.1)' : 'none' }}>
                <span style={{ color: 'var(--gold)', fontSize: 18 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '1px', color: 'var(--cream)', fontWeight: 500 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 2 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Categories — swatches circulaires (inspiré African Avenue) ─── */}
        <section style={{ padding: '72px 40px 64px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex items-center gap-4 mb-12">
            <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', whiteSpace: 'nowrap' }}>Explorer par univers</p>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          </div>
          {/* Cercles — 6 swatches alignés */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col items-center gap-3"
              >
                {/* Cercle image */}
                <div
                  className="relative overflow-hidden transition-all duration-400"
                  style={{
                    width: 120, height: 120, borderRadius: '50%',
                    border: '1.5px solid rgba(232,185,106,0.15)',
                    boxShadow: '0 0 0 0 rgba(232,185,106,0)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232,185,106,0.6)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 4px rgba(232,185,106,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232,185,106,0.15)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 0 rgba(232,185,106,0)';
                  }}
                >
                  <Image
                    src={cat.img}
                    alt={cat.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="120px"
                  />
                </div>
                {/* Label */}
                <span
                  className="transition-colors duration-200 group-hover:text-[#E8B96A]"
                  style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', textAlign: 'center' }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Section éditoriale split (inspiré African Avenue "since 2014") ── */}
        <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
          {/* Image pleine largeur */}
          <Image
            src="/images/hero/hero-02.png"
            alt="La Catena — Boutique Multibrand"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Voile gauche → droite */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,31,14,0.92) 0%, rgba(26,31,14,0.6) 50%, transparent 100%)' }} />
          {/* Contenu texte */}
          <div
            className="relative z-10 flex flex-col justify-center"
            style={{ maxWidth: 520, padding: '80px 40px 80px 72px' }}
          >
            <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20, opacity: 0.8 }}>
              Notre identité
            </p>
            <h2 className="font-serif mb-5" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              Une boutique pensée<br />
              <em style={{ color: 'var(--gold)' }}>pour l&apos;Afrique d&apos;aujourd&apos;hui.</em>
            </h2>
            <p style={{ color: 'rgba(240,234,210,0.6)', fontSize: 14, lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}>
              La Catena réunit des marques contemporaines soigneusement sélectionnées — des pièces qui racontent une histoire et s&apos;inscrivent dans un style de vie singulier.
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-3 uppercase tracking-widest transition-colors hover:text-[#f5cb85]"
              style={{ fontSize: 10, letterSpacing: '2.5px', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.35)', padding: '11px 24px', alignSelf: 'flex-start' }}
            >
              Découvrir la boutique
            </Link>
          </div>
        </section>

        {/* ── Nouvelles arrivées ───────────────────────────────────────────── */}
        <section style={{ padding: '0 40px 80px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Nouvelles arrivées</p>
              <div style={{ width: 80, height: '0.5px', background: 'var(--border)' }} />
            </div>
            <Link href="/boutique?is_new=true" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>Tout voir →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.length > 0
              ? newArrivals.map((p) => <ProductCard key={p.uuid} product={p} />)
              : ARRIVALS_IMGS.map((img, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}>
                    <Image src={img} alt={`Arrivée ${i + 1}`} fill className="object-cover" sizes="25vw" />
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--cream-muted)', textTransform: 'uppercase' }}>Marque</p>
                    <p className="text-sm" style={{ color: 'var(--cream)' }}>Nouvelle pièce</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--gold)' }}>— FCFA</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ── Bannière promo ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden flex items-center" style={{ background: '#4A6020', minHeight: 280, padding: '0 40px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', opacity: 0.15 }}>
            <Image src="/images/hero/hero-bg.png" alt="" fill className="object-cover" />
          </div>
          <div className="relative z-10" style={{ maxWidth: 560, padding: '56px 0' }}>
            <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(232,185,106,0.7)', marginBottom: 16 }}>Offre limitée</p>
            <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--gold)', lineHeight: 1.15 }}>
              Jusqu&apos;à −30% sur<br />une sélection de pièces
            </h2>
            <p className="mb-8" style={{ color: 'rgba(240,234,210,0.65)', fontSize: 14, lineHeight: 1.6 }}>
              Des pièces d&apos;exception à des prix accessibles — pour une durée limitée.
            </p>
            <Link href="/boutique?is_promo=true" className="inline-flex items-center uppercase font-medium tracking-widest transition-opacity hover:opacity-80" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
              Profiter de l&apos;offre
            </Link>
          </div>
        </section>

        {/* ── Bestsellers ─────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 40px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Meilleures ventes</p>
              <div style={{ width: 80, height: '0.5px', background: 'var(--border)' }} />
            </div>
            <Link href="/boutique?is_featured=true" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>Tout voir →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestsellers.length > 0
              ? bestsellers.map((p) => <ProductCard key={p.uuid} product={p} />)
              : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div style={{ aspectRatio: '3/4', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(240,234,210,0.07)' }} />
                  <div className="space-y-1">
                    <div style={{ height: 8, width: '40%', background: 'rgba(240,234,210,0.08)', borderRadius: 4 }} />
                    <div style={{ height: 12, width: '70%', background: 'rgba(240,234,210,0.05)', borderRadius: 4 }} />
                    <div style={{ height: 12, width: '30%', background: 'rgba(232,185,106,0.15)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ── Témoignages ─────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.015)', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div className="flex items-center gap-4 mb-12">
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', whiteSpace: 'nowrap' }}>Ce qu&apos;ils disent</p>
              <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 8, padding: '32px' }}>
                  <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_, s) => <span key={s} style={{ color: 'var(--gold)', fontSize: 12 }}>★</span>)}</div>
                  <p style={{ color: 'rgba(240,234,210,0.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>&ldquo;{t.text}&rdquo;</p>
                  <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter ───────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 40px', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <span className="chain-divider block mb-8" style={{ fontSize: 14, letterSpacing: '4px', color: 'rgba(232,185,106,0.25)' }}>⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙</span>
          <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Restez dans la boucle</p>
          <h2 className="font-serif mb-4" style={{ fontSize: 32, color: 'var(--cream)', lineHeight: 1.2 }}>L&apos;exclusivité commence ici.</h2>
          <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            Inscrivez-vous et soyez les premiers informés des nouvelles collections, ventes privées et offres réservées aux membres.
          </p>
          {newsDone ? (
            <div className="animate-fade-up" style={{ color: 'var(--gold)', fontSize: 14 }}>Bienvenue dans la famille La Catena. ✓</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (newsEmail) setNewsDone(true); }} className="flex gap-3">
              <input
                type="email" value={newsEmail} onChange={(e) => setNewsEmail(e.target.value)}
                placeholder="Votre adresse email" required
                className="flex-1 px-4 py-3 text-sm outline-none transition-all"
                style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 2, color: 'var(--cream)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
              />
              <button type="submit" className="flex-shrink-0 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px 24px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
                S&apos;inscrire
              </button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
