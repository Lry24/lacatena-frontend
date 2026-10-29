'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ProductCard as Card } from '@/lib/types';
import ProductCard from './ProductCard';
import ProductImg from './ProductImg';

// ── Diaporama d'accueil ───────────────────────────────────

export interface Slide {
  eyebrow: string;
  title: string;
  accent: string;
  text: string;
  cta: string;
  href: string;
  image: string;
  position?: string;
}

const DURATION = 6500;

/** Plein écran, effet Ken Burns, barres de progression cliquables ; pause au survol. */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, go]);

  const slide = slides[index];
  return (
    <section className="shop-dark relative overflow-hidden" style={{ height: '100svh', minHeight: 600, background: '#1A1F0E' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carrousel" aria-label="Collections à la une">
      {/* Mobile : photo plein écran sous un voile. Ordinateur : photo verticale à droite, entière, le texte sur le vert à gauche */}
      <span className="hidden lg:block absolute font-serif pointer-events-none select-none" style={{ left: 40, top: 96, fontSize: 18, letterSpacing: 6, color: '#E8B96A', opacity: 0.35 }}>⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙</span>
      {slides.map((s, i) => (
        <div key={s.image} className="absolute inset-0 lg:left-[44%] overflow-hidden transition-opacity duration-1000" style={{ opacity: i === index ? 1 : 0 }} aria-hidden={i !== index}>
          <div className={`absolute inset-0 ${i === index ? 'kenburns' : ''}`}>
            <ProductImg src={s.image} alt="" sizes="(max-width: 1024px) 100vw, 56vw" priority={i === 0} className={`object-cover ${s.position || 'object-[center_20%]'}`} />
          </div>
        </div>
      ))}
      {/* Voile : le texte reste lisible, la photo garde son relief */}
      <div className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(90deg, rgba(26,31,14,0.85) 0%, rgba(26,31,14,0.45) 60%, rgba(26,31,14,0.15) 100%), linear-gradient(0deg, rgba(26,31,14,0.75) 0%, transparent 40%)' }} />
      <div className="absolute inset-y-0 hidden lg:block" style={{ left: '44%', width: '18%', background: 'linear-gradient(90deg, #1A1F0E 0%, rgba(26,31,14,0) 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 hidden lg:block" style={{ height: 160, background: 'linear-gradient(0deg, rgba(26,31,14,0.75) 0%, transparent 100%)' }} />
      {/* Le menu transparent reste lisible au-dessus des photos claires */}
      <div className="absolute inset-x-0 top-0" style={{ height: 150, background: 'linear-gradient(180deg, rgba(26,31,14,0.7) 0%, transparent 100%)' }} />

      <div className="relative z-10 h-full flex flex-col justify-end px-4 md:px-10" style={{ maxWidth: 1440, margin: '0 auto', paddingBottom: 128 }}>
        <div key={index} className="animate-fade-up" style={{ maxWidth: 640 }}>
          <p style={{ fontSize: 10, letterSpacing: '5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>
            <span className="font-serif" style={{ fontSize: 14, letterSpacing: 0, marginRight: 12 }}>{String(index + 1).padStart(2, '0')}</span>{slide.eyebrow}
          </p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(44px, 5.6vw, 92px)', lineHeight: 0.95, color: '#F5EDD8', letterSpacing: '-2px' }}>
            {slide.title}<br /><em style={{ color: 'var(--gold)' }}>{slide.accent}</em>
          </h1>
          <p style={{ color: 'rgba(245,237,216,0.78)', fontSize: 15, lineHeight: 1.7, margin: '24px 0 32px', maxWidth: 440 }}>{slide.text}</p>
          <div className="flex gap-3 flex-wrap">
            <Link href={slide.href} className="btn-gold hover:brightness-110" style={{ background: '#E8B96A', color: '#2D3A0F', padding: '15px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>
              {slide.cta}
            </Link>
            <Link href="/boutique?nouveau=1" className="btn-outline hover:border-[#E8B96A] hover:text-[#E8B96A]" style={{ border: '0.5px solid rgba(245,237,216,0.5)', color: '#F5EDD8', padding: '15px 32px', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Nouveautés
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation : barres de progression avec libellé + flèches */}
      <div className="absolute bottom-0 inset-x-0 z-10 px-4 md:px-10" style={{ paddingBottom: 32 }}>
        <div className="flex items-end gap-4 md:gap-6" style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="flex-1 grid gap-3 md:gap-6" style={{ gridTemplateColumns: `repeat(${slides.length}, 1fr)` }}>
            {slides.map((s, i) => (
              <button key={s.image} onClick={() => go(i)} className="text-left" aria-label={`Diapositive ${i + 1} : ${s.eyebrow}`} aria-current={i === index}>
                <span className="hidden md:block mb-2 transition-colors" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: i === index ? '#F5EDD8' : 'rgba(245,237,216,0.45)' }}>{s.eyebrow}</span>
                <span className="block relative overflow-hidden" style={{ height: 2, background: 'rgba(245,237,216,0.2)' }}>
                  <span key={`${index}-${paused}`} className="absolute inset-0 origin-left" style={{
                    background: '#E8B96A',
                    transform: i < index ? 'scaleX(1)' : 'scaleX(0)',
                    animation: i === index && !paused ? `slideProgress ${DURATION}ms linear forwards` : undefined,
                  }} />
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[-1, 1].map((d) => (
              <button key={d} onClick={() => go(index + d)} aria-label={d < 0 ? 'Précédente' : 'Suivante'}
                className="flex items-center justify-center transition-colors hover:bg-[#E8B96A] hover:text-[#2D3A0F]"
                style={{ width: 44, height: 44, borderRadius: '50%', border: '0.5px solid rgba(245,237,216,0.4)', color: '#F5EDD8' }}>
                {d < 0 ? '←' : '→'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Rail de produits défilant ─────────────────────────────

/** Défilement horizontal aimanté, flèches et barre d'avancement ; glisser au doigt sur mobile. */
export function ProductRail({ title, eyebrow, products, href, badge, numbered }: {
  title: ReactNode; eyebrow: string; products: Card[] | null; href: string; badge?: 'new' | 'best'; numbered?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  };
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section style={{ paddingTop: 96, paddingBottom: 32 }}>
      <div className="px-4 md:px-10 flex items-end justify-between gap-6 mb-10" style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>{eyebrow}</p>
          <h2 className="font-serif" style={{ fontSize: 'clamp(34px, 4.5vw, 60px)', lineHeight: 1, color: 'var(--cream)', letterSpacing: '-1px' }}>{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link href={href} className="hidden sm:inline hover:text-[var(--gold)]" style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginRight: 8 }}>Tout voir</Link>
          {[-1, 1].map((d) => (
            <button key={d} onClick={() => scroll(d)} disabled={d < 0 ? edges.start : edges.end} aria-label={d < 0 ? 'Précédent' : 'Suivant'}
              className="flex items-center justify-center transition-all hover:bg-[var(--cream)] hover:text-[var(--bg)]"
              style={{ width: 46, height: 46, borderRadius: '50%', border: '0.5px solid var(--border)', color: 'var(--cream)', opacity: (d < 0 ? edges.start : edges.end) ? 0.3 : 1 }}>
              {d < 0 ? '←' : '→'}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} onScroll={update} className="rail flex gap-4 md:gap-6 overflow-x-auto px-4 md:px-10" style={{ scrollPaddingLeft: 40 }}>
        {(products || Array.from({ length: 6 }, () => null)).map((p, i) => (
          <div key={p?.id ?? i} className="flex-shrink-0 relative" style={{ width: 'clamp(220px, 23vw, 320px)' }}>
            {numbered && p && <span className="font-serif absolute z-10 pointer-events-none" style={{ top: 8, left: 12, fontSize: 64, lineHeight: 1, color: '#F5EDD8', textShadow: '0 2px 12px rgba(26,31,14,0.5)' }}>{i + 1}</span>}
            {p ? <ProductCard product={p} badge={numbered ? undefined : badge} /> : <div className="shimmer" style={{ aspectRatio: '3/4' }} />}
          </div>
        ))}
        <Link href={href} className="flex-shrink-0 flex flex-col items-center justify-center gap-3 group" style={{ width: 'clamp(180px, 16vw, 240px)', aspectRatio: '3/4', border: '0.5px solid var(--border)' }}>
          <span className="flex items-center justify-center transition-all group-hover:bg-[var(--gold)] group-hover:text-[var(--on-accent)]" style={{ width: 56, height: 56, borderRadius: '50%', border: '0.5px solid var(--gold)', color: 'var(--gold)', fontSize: 20 }}>→</span>
          <span style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Tout voir</span>
        </Link>
      </div>
      <div className="px-4 md:px-10" style={{ maxWidth: 1440, margin: '32px auto 0' }}>
        <div style={{ height: 1, background: 'var(--border)' }}>
          <div style={{ height: 1, width: `${12 + progress * 88}%`, background: 'var(--cream)', transition: 'width .2s' }} />
        </div>
      </div>
    </section>
  );
}

// ── Bandeau défilant ──────────────────────────────────────

export function Marquee({ items, className = '', style }: { items: ReactNode[]; className?: string; style?: React.CSSProperties }) {
  const row = (hidden: boolean) => (
    <div className="flex items-center flex-shrink-0" aria-hidden={hidden}>
      {items.map((it, i) => <span key={i} className="flex items-center whitespace-nowrap">{it}<span className="mx-8" style={{ opacity: 0.6 }}>⊙</span></span>)}
    </div>
  );
  return (
    <div className={`marquee overflow-hidden ${className}`} style={style}>
      <div className="marquee-track">{row(false)}{row(true)}</div>
    </div>
  );
}

// ── Citations clientes ────────────────────────────────────

export function QuoteCarousel({ quotes }: { quotes: { name: string; text: string; city: string }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((i + 1) % quotes.length), 7000);
    return () => clearTimeout(t);
  }, [i, quotes.length]);
  const q = quotes[i];
  return (
    <div className="text-center" style={{ maxWidth: 880, margin: '0 auto' }}>
      <span className="font-serif block" style={{ fontSize: 96, lineHeight: 0.6, color: 'var(--gold)', opacity: 0.5 }}>&ldquo;</span>
      <blockquote key={i} className="font-serif animate-fade-up" style={{ fontSize: 'clamp(24px, 3vw, 38px)', lineHeight: 1.3, color: 'var(--cream)', letterSpacing: '-0.5px', margin: '16px 0 28px' }}>
        {q.text}
      </blockquote>
      <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>{q.name} · <span style={{ color: 'var(--cream-muted)' }}>{q.city}</span></p>
      <div className="flex justify-center gap-2 mt-8">
        {quotes.map((_, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Avis ${k + 1}`} aria-current={k === i}
            style={{ width: k === i ? 28 : 8, height: 8, borderRadius: 4, background: k === i ? 'var(--gold)' : 'var(--border)', transition: 'all .3s' }} />
        ))}
      </div>
    </div>
  );
}
