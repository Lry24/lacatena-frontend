'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CATEGORIES = [
  { label: 'Femme', img: '/images/products/1762425403346.jpg', href: '/boutique?gender=femme' },
  { label: 'Homme', img: '/images/products/IMG-20250909-WA0104.jpg', href: '/boutique?gender=homme' },
  { label: 'Accessoires', img: '/images/products/IMG_20260202_130207.png', href: '/boutique?category=accessoires' },
  { label: 'Enfant', img: '/images/categories/categories-04.png', href: '/boutique?gender=enfant' },
  { label: 'Nouveautés', img: '/images/products/1773304035061.png', href: '/boutique?is_new=true' },
  { label: 'Promos', img: '/images/categories/categories-06.png', href: '/boutique?is_promo=true' },
];

type StaticProduct = {
  id: number;
  brand: string;
  name: string;
  price: string;
  main: string;
  gallery: string[];
};

const STATIC_ARRIVALS: StaticProduct[] = [
  {
    id: 1,
    brand: 'La Catena',
    name: 'Robe Wax Soleil',
    price: '45 000 FCFA',
    main: '/images/products/IMG_5380.JPG',
    gallery: ['/images/products/IMG_5380.JPG', '/images/products/IMG_5381.JPG', '/images/products/IMG_5385.JPG'],
  },
  {
    id: 2,
    brand: 'La Catena',
    name: 'Robe Imprimée Premium',
    price: '38 000 FCFA',
    main: '/images/products/IMG_5394.JPG',
    gallery: ['/images/products/IMG_5394.JPG', '/images/products/IMG_5399-1.JPG', '/images/products/IMG_5397.JPG'],
  },
  {
    id: 3,
    brand: 'La Catena',
    name: 'Robe Tie-Dye Violette',
    price: '52 000 FCFA',
    main: '/images/products/IMG_20251107_113241.png',
    gallery: ['/images/products/IMG_20251107_113241.png'],
  },
  {
    id: 4,
    brand: 'La Catena',
    name: 'Combinaison Wax Violet',
    price: '67 000 FCFA',
    main: '/images/products/IMG-20250819-WA0000(1).jpg',
    gallery: ['/images/products/IMG-20250819-WA0000(1).jpg'],
  },
];

const STATIC_BESTSELLERS: StaticProduct[] = [
  {
    id: 5,
    brand: 'La Catena',
    name: 'Ensemble Bogolan Doré',
    price: '58 000 FCFA',
    main: '/images/products/1773304264476.png',
    gallery: ['/images/products/1773304264476.png', '/images/products/1773304349484.png'],
  },
  {
    id: 6,
    brand: 'La Catena',
    name: 'Robe Ankara Asymétrique',
    price: '42 000 FCFA',
    main: '/images/products/IMG-20250909-WA0075.jpg',
    gallery: ['/images/products/IMG-20250909-WA0075.jpg', '/images/products/IMG-20250909-WA0074.jpg', '/images/products/IMG-20250909-WA0052.jpg'],
  },
  {
    id: 7,
    brand: 'La Catena',
    name: 'Tenue Wax Élite',
    price: '71 000 FCFA',
    main: '/images/products/IMG_5793.PNG',
    gallery: ['/images/products/IMG_5793.PNG', '/images/products/IMG_5794.PNG', '/images/products/IMG_5796.PNG'],
  },
  {
    id: 8,
    brand: 'La Catena',
    name: 'Veste Kente Premium',
    price: '63 000 FCFA',
    main: '/images/products/1773304536903.png',
    gallery: ['/images/products/1773304536903.png', '/images/products/1770889588417.png'],
  },
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
  const [newsEmail, setNewsEmail] = useState('');
  const [newsDone, setNewsDone] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StaticProduct | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [qty, setQty] = useState(1);

  const openProduct = (p: StaticProduct) => {
    setSelectedProduct(p);
    setActiveImg(0);
    setSelectedSize(null);
    setWished(false);
    setAddedToCart(false);
    setQty(1);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <Header />
      <main>
        {/* ── Hero split — style Ozma of California ────────────────────── */}
        <section className="relative overflow-hidden" style={{ height: '100vh', display: 'flex' }}>

          {/* Panneau gauche */}
          <div className="relative overflow-hidden" style={{ flex: 1 }}>
            <Image
              src="/images/hero/hero-split-01.jpg"
              alt="La Catena — Collection"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,31,14,0.15) 0%, rgba(26,31,14,0.45) 100%)' }} />
          </div>

          {/* Séparateur central + texte superposé */}
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-end"
            style={{ pointerEvents: 'none', paddingBottom: 64 }}
          >
            {/* Ligne verticale dorée */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '0.5px', height: '100%', background: 'linear-gradient(to bottom, transparent 0%, rgba(232,185,106,0.25) 20%, rgba(232,185,106,0.25) 80%, transparent 100%)' }} />

            {/* Contenu centré */}
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

          {/* Panneau droit */}
          <div className="relative overflow-hidden" style={{ flex: 1 }}>
            <Image
              src="/images/hero/hero-split-02.jpg"
              alt="La Catena — Nouvelle collection"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,31,14,0.15) 0%, rgba(26,31,14,0.45) 100%)' }} />
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

        {/* ── Section éditoriale 2 colonnes ────────────────────────────── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)' }}>
          <div className="grid md:grid-cols-2" style={{ maxWidth: 1440, margin: '0 auto' }}>

            {/* Colonne texte */}
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

            {/* Colonne image — portant boutique */}
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
            {STATIC_ARRIVALS.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col gap-3 cursor-pointer"
                  onClick={() => openProduct(p)}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(240,234,210,0.07)' }}>
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <Image src={p.main} alt={p.name} fill className="object-cover object-top" sizes="25vw" />
                    </div>
                    <span className="absolute top-3 left-3 z-10" style={{ background: 'var(--gold)', color: '#2D3A0F', fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>
                      Nouveau
                    </span>
                    <div className="absolute inset-0 z-10 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(26,31,14,0.75) 0%, transparent 60%)' }}>
                      <span style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.5)', padding: '8px 20px', backdropFilter: 'blur(4px)', background: 'rgba(26,31,14,0.7)' }}>
                        Voir le produit →
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{p.brand}</p>
                    <p style={{ fontSize: 13, color: 'var(--cream)', marginBottom: 6, lineHeight: 1.3 }}>{p.name}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>{p.price}</p>
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
            {STATIC_BESTSELLERS.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col gap-3 cursor-pointer"
                  onClick={() => openProduct(p)}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(240,234,210,0.07)' }}>
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                      <Image src={p.main} alt={p.name} fill className="object-cover object-top" sizes="25vw" />
                    </div>
                    <span className="absolute top-3 left-3 z-10" style={{ background: '#4A6020', color: 'var(--gold)', fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, border: '0.5px solid rgba(232,185,106,0.3)' }}>
                      Best-seller
                    </span>
                    <div className="absolute inset-0 z-10 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(26,31,14,0.75) 0%, transparent 60%)' }}>
                      <span style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.5)', padding: '8px 20px', backdropFilter: 'blur(4px)', background: 'rgba(26,31,14,0.7)' }}>
                        Voir le produit →
                      </span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{p.brand}</p>
                    <p style={{ fontSize: 13, color: 'var(--cream)', marginBottom: 6, lineHeight: 1.3 }}>{p.name}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>{p.price}</p>
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

      {/* ── Fiche produit plein écran ────────────────────────────────── */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{ background: '#1A1F0E' }}
        >
          {/* Header de la fiche */}
          <div className="flex items-center justify-between sticky top-0 z-10" style={{ padding: '0 40px', height: 60, background: 'rgba(26,31,14,0.97)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(240,234,210,0.08)' }}>
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}
            >
              ← Retour
            </button>
            <p style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>
              La Catena — {selectedProduct.brand}
            </p>
            {/* Wishlist dans le header */}
            <button
              onClick={() => setWished(w => !w)}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: wished ? 'var(--gold)' : 'var(--cream-muted)' }}
            >
              {wished ? '♥' : '♡'} Favoris
            </button>
          </div>

          {/* Corps — 2 colonnes */}
          <div className="grid md:grid-cols-2" style={{ maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 60px)' }}>

            {/* ── Colonne gauche : galerie ── */}
            <div style={{ padding: '32px 24px 32px 40px' }}>
              {/* Image principale */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
                <Image
                  src={selectedProduct.gallery[activeImg]}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              {/* Miniatures */}
              {selectedProduct.gallery.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {selectedProduct.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="relative overflow-hidden flex-shrink-0 transition-all duration-200"
                      style={{ width: 64, height: 80, borderRadius: 2, border: i === activeImg ? '1.5px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.12)', opacity: i === activeImg ? 1 : 0.5 }}
                    >
                      <Image src={img} alt="" fill className="object-cover object-top" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Colonne droite : infos ── */}
            <div className="flex flex-col" style={{ padding: '48px 40px 48px 24px' }}>
              {/* Marque */}
              <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
                {selectedProduct.brand}
              </p>

              {/* Nom */}
              <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--cream)', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.5px' }}>
                {selectedProduct.name}
              </h1>

              {/* Prix */}
              <p style={{ fontSize: 22, fontWeight: 500, color: 'var(--gold)', marginBottom: 8 }}>
                {selectedProduct.price}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(240,234,210,0.35)', letterSpacing: '1px', marginBottom: 32 }}>
                TTC · Livraison calculée à la commande
              </p>

              <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 28 }} />

              {/* Description */}
              <p style={{ fontSize: 13, color: 'rgba(240,234,210,0.6)', lineHeight: 1.8, marginBottom: 32 }}>
                Pièce sélectionnée avec soin par notre équipe de style. Confectionnée dans un tissu premium, cette création allie élégance contemporaine et savoir-faire artisanal. Coupe ajustée, finitions soignées — une pièce qui s&apos;inscrit dans la durée.
              </p>

              {/* Composition fictive */}
              <div className="flex flex-col gap-2 mb-32" style={{ fontSize: 11, color: 'rgba(240,234,210,0.4)', letterSpacing: '0.5px' }}>
                <span>🪡 Composition : 70% Coton, 30% Polyester</span>
                <span>🧺 Entretien : Lavage à 30°C, ne pas essorer</span>
                <span>📦 Référence : LC-{String(selectedProduct.id).padStart(4, '0')}</span>
              </div>

              {/* Tailles */}
              <p style={{ fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>
                Taille {selectedSize ? `— ${selectedSize} sélectionnée` : ''}
              </p>
              <div className="flex gap-2 flex-wrap mb-8">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                    className="transition-all duration-200"
                    style={{
                      width: 48, height: 48, fontSize: 11, letterSpacing: '1px',
                      border: s === selectedSize ? '1.5px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.15)',
                      color: s === selectedSize ? 'var(--gold)' : 'rgba(240,234,210,0.55)',
                      background: s === selectedSize ? 'rgba(232,185,106,0.08)' : 'transparent',
                      borderRadius: 2,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Quantité + Panier */}
              <div className="flex gap-3 mb-4">
                {/* Stepper */}
                <div className="flex items-center" style={{ border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2 }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="flex items-center justify-center transition-colors hover:text-[var(--gold)]"
                    style={{ width: 44, height: 52, color: 'rgba(240,234,210,0.5)', fontSize: 18 }}
                  >
                    −
                  </button>
                  <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 500, color: 'var(--cream)', borderLeft: '0.5px solid rgba(240,234,210,0.1)', borderRight: '0.5px solid rgba(240,234,210,0.1)' }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(10, q + 1))}
                    className="flex items-center justify-center transition-colors hover:text-[var(--gold)]"
                    style={{ width: 44, height: 52, color: 'rgba(240,234,210,0.5)', fontSize: 18 }}
                  >
                    +
                  </button>
                </div>

                {/* Bouton panier */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="flex-1 transition-all duration-200"
                  style={{
                    height: 52, fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600,
                    background: addedToCart ? '#4A6020' : selectedSize ? 'var(--gold)' : 'rgba(232,185,106,0.15)',
                    color: addedToCart ? 'var(--gold)' : selectedSize ? '#2D3A0F' : 'rgba(232,185,106,0.4)',
                    border: addedToCart ? '0.5px solid rgba(232,185,106,0.3)' : 'none',
                    borderRadius: 2,
                    cursor: selectedSize ? 'pointer' : 'not-allowed',
                  }}
                >
                  {addedToCart ? '✓ Ajouté au panier' : selectedSize ? 'Ajouter au panier' : 'Sélectionner une taille'}
                </button>
              </div>

              {/* Wishlist bouton */}
              <button
                onClick={() => setWished(w => !w)}
                className="flex items-center justify-center gap-2 transition-all duration-200 mb-8"
                style={{
                  height: 48, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase',
                  border: '0.5px solid ' + (wished ? 'rgba(232,185,106,0.5)' : 'rgba(240,234,210,0.12)'),
                  color: wished ? 'var(--gold)' : 'var(--cream-muted)',
                  background: wished ? 'rgba(232,185,106,0.05)' : 'transparent',
                  borderRadius: 2,
                }}
              >
                {wished ? '♥ Retiré des favoris' : '♡ Ajouter aux favoris'}
              </button>

              {/* Infos livraison */}
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(240,234,210,0.07)', borderRadius: 4, padding: '20px 24px' }}>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: '✦', text: 'Livraison gratuite dès 50 000 FCFA' },
                    { icon: '↩', text: 'Retours acceptés sous 14 jours' },
                    { icon: '◎', text: 'Service client Lun–Sam, 9h–18h' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span style={{ color: 'var(--gold)', fontSize: 12 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: 'rgba(240,234,210,0.5)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
