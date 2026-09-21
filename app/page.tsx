'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/common/ProductCard';
import { getProducts } from '@/lib/api';
import type { ProductResponse } from '@/types';

const CATEGORIES = [
  { label: 'Femme', img: '/images/products/1762425403346.jpg', href: '/boutique?gender=femme' },
  { label: 'Homme', img: '/images/products/IMG-20250909-WA0104.jpg', href: '/boutique?gender=homme' },
  { label: 'Accessoires', img: '/images/products/IMG_20260202_130207.png', href: '/boutique?category=accessoires' },
  { label: 'Enfant', img: '/images/categories/categories-04.png', href: '/boutique?gender=enfant' },
  { label: 'Nouveautés', img: '/images/products/1773304035061.png', href: '/boutique?is_new=true' },
  { label: 'Promos', img: '/images/categories/categories-06.png', href: '/boutique?is_promo=true' },
];

const TESTIMONIALS = [
  {
    name: 'Ama K.',
    text: 'La qualité est exceptionnelle. Chaque pièce est exactement comme décrite, et la livraison était rapide. Je reviendrai.',
    rating: 5,
  },
  {
    name: 'Kwame D.',
    text: "Une sélection vraiment pointue. On sent que chaque marque a été choisie avec soin. C'est rare.",
    rating: 5,
  },
  {
    name: 'Fatou M.',
    text: "Service client impeccable. J'avais une question sur la taille, réponse en moins d'une heure. Bravo.",
    rating: 5,
  },
];

/* Skeleton card affiché pendant le chargement */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="shimmer" style={{ aspectRatio: '3/4', borderRadius: 2 }} />
      <div className="shimmer" style={{ height: 10, width: '40%', borderRadius: 2 }} />
      <div className="shimmer" style={{ height: 13, width: '80%', borderRadius: 2 }} />
      <div className="shimmer" style={{ height: 13, width: '30%', borderRadius: 2 }} />
    </div>
  );
}

export default function HomePage() {
  const [newsEmail, setNewsEmail] = useState('');
  const [newsDone, setNewsDone] = useState(false);

  const [arrivals, setArrivals] = useState<ProductResponse[]>([]);
  const [bestsellers, setBestsellers] = useState<ProductResponse[]>([]);
  const [loadingArrivals, setLoadingArrivals] = useState(true);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);

  useEffect(() => {
    getProducts({ is_new: true, size: 4, sort: 'newest' })
      .then((d) => setArrivals(d.items))
      .catch(() => {})
      .finally(() => setLoadingArrivals(false));

    getProducts({ is_featured: true, size: 4 })
      .then((d) => setBestsellers(d.items))
      .catch(() => {})
      .finally(() => setLoadingBestsellers(false));
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* ── Hero split ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ height: '100vh', display: 'flex' }}>
          {/* Panneau gauche */}
          <div className="relative overflow-hidden" style={{ flex: 1 }}>
            <Image
              src="/images/hero/hero-split-01.jpg"
              alt="La Catena — Collection"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,31,14,0.15) 0%, rgba(26,31,14,0.45) 100%)' }} />
          </div>

          {/* Séparateur central + texte superposé */}
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-end"
            style={{ pointerEvents: 'none', paddingBottom: 64 }}
          >
            <div className="hidden md:block" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '0.5px', height: '100%', background: 'linear-gradient(to bottom, transparent 0%, rgba(232,185,106,0.25) 20%, rgba(232,185,106,0.25) 80%, transparent 100%)' }} />

            <div className="flex flex-col items-center text-center" style={{ pointerEvents: 'auto', maxWidth: 420, padding: '0 24px' }}>
              <span style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.35)', padding: '5px 16px', borderRadius: 20, marginBottom: 20, display: 'inline-block' }}>
                Boutique Multibrand
              </span>
              <h1 className="font-serif" style={{ fontSize: 'clamp(32px, 4.5vw, 60px)', lineHeight: 1.1, color: 'var(--cream)', letterSpacing: '-0.5px', marginBottom: 24, textShadow: '0 2px 20px rgba(26,31,14,0.8)' }}>
                Chaque pièce,<br />
                <em style={{ color: 'var(--gold)' }}>choisie pour vous.</em>
              </h1>
              <div className="flex gap-3" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/boutique" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '13px 28px', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Découvrir
                </Link>
                <Link href="/boutique?sort=brand" style={{ border: '0.5px solid rgba(240,234,210,0.4)', color: 'var(--cream)', padding: '13px 28px', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                  Nos marques
                </Link>
              </div>
            </div>
          </div>

          {/* Panneau droit — caché sur mobile */}
          <div className="hidden md:block relative overflow-hidden" style={{ flex: 1 }}>
            <Image
              src="/images/hero/hero-split-02.jpg"
              alt="La Catena — Nouvelle collection"
              fill
              className="object-cover object-top"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,31,14,0.15) 0%, rgba(26,31,14,0.45) 100%)' }} />
          </div>
        </section>

        {/* ── Labels ───────────────────────────────────────────────────── */}
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

        {/* ── Catégories ───────────────────────────────────────────────── */}
        <section style={{ padding: '72px 40px 64px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex items-center gap-4 mb-12">
            <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', whiteSpace: 'nowrap' }}>Explorer par univers</p>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col items-center gap-3"
              >
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

        {/* ── Section éditoriale 2 colonnes ───────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
          <div className="grid md:grid-cols-2" style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div className="flex flex-col justify-center" style={{ padding: '80px 64px 80px 40px' }}>
              <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20, opacity: 0.8 }}>
                Notre identité
              </p>
              <h2 className="font-serif mb-5" style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--cream)', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
                Une boutique pensée<br />
                <em style={{ color: 'var(--gold)' }}>pour l&apos;Afrique d&apos;aujourd&apos;hui.</em>
              </h2>
              <p style={{ color: 'rgba(240,234,210,0.6)', fontSize: 14, lineHeight: 1.8, marginBottom: 40, maxWidth: 400 }}>
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
            <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
              <Image
                src="/images/products/1773303836013.png"
                alt="La Catena — Sélection boutique"
                fill
                className="object-cover"
                style={{ objectPosition: 'center top' }}
                sizes="50vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, transparent 60%, rgba(26,31,14,0.3) 100%)' }} />
            </div>
          </div>
        </section>

        {/* ── Nouvelles arrivées ───────────────────────────────────────── */}
        <section style={{ padding: '80px 40px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Nouvelles arrivées</p>
              <div style={{ width: 80, height: '0.5px', background: 'var(--border)' }} />
            </div>
            <Link href="/boutique?is_new=true" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>Tout voir →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingArrivals
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : arrivals.length > 0
              ? arrivals.map((p) => <ProductCard key={p.uuid} product={p} />)
              : (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--cream-muted)', fontSize: 13, padding: '40px 0' }}>
                  Aucune nouveauté pour le moment.{' '}
                  <Link href="/boutique" style={{ color: 'var(--gold)' }}>Voir toute la boutique →</Link>
                </p>
              )
            }
          </div>
        </section>

        {/* ── Bannière promo ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden flex items-center" style={{ background: '#4A6020', minHeight: 280, padding: '0 40px' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', opacity: 0.15 }}>
            <Image src="/images/hero/hero-bg.png" alt="" fill className="object-cover" sizes="45vw" />
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

        {/* ── Bestsellers ──────────────────────────────────────────────── */}
        <section style={{ padding: '80px 40px', maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Meilleures ventes</p>
              <div style={{ width: 80, height: '0.5px', background: 'var(--border)' }} />
            </div>
            <Link href="/boutique?is_featured=true" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>Tout voir →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingBestsellers
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.length > 0
              ? bestsellers.map((p) => <ProductCard key={p.uuid} product={p} />)
              : (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--cream-muted)', fontSize: 13, padding: '40px 0' }}>
                  Aucune sélection pour le moment.{' '}
                  <Link href="/boutique" style={{ color: 'var(--gold)' }}>Voir toute la boutique →</Link>
                </p>
              )
            }
          </div>
        </section>

        {/* ── Témoignages ──────────────────────────────────────────────── */}
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

        {/* ── Newsletter ───────────────────────────────────────────────── */}
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsEmail) setNewsDone(true);
              }}
              className="flex gap-3"
            >
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
