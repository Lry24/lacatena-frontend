'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductCard, { ProductGridSkeleton } from '@/components/shop/ProductCard';
import Reveal from '@/components/shop/Reveal';
import { Button, EmptyState, ErrorNote, label } from '@/components/ui';
import { api } from '@/lib/api';
import type { Category, Page, ProductCard as Card } from '@/lib/types';

const SORTS = [
  { value: 'new', label: 'Nouveautés' },
  { value: 'popular', label: 'Meilleures ventes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom (A → Z)' },
];

const PRICES = [
  { value: '', label: 'Tous les prix' },
  { value: '0-30000', label: 'Moins de 30 000 FCFA' },
  { value: '30000-80000', label: '30 000 – 80 000 FCFA' },
  { value: '80000-200000', label: '80 000 – 200 000 FCFA' },
  { value: '200000-', label: 'Plus de 200 000 FCFA' },
];

function findPath(cats: Category[], slug: string, trail: Category[] = []): Category[] | null {
  for (const c of cats) {
    if (c.slug === slug) return [...trail, c];
    const found = findPath(c.children, slug, [...trail, c]);
    if (found) return found;
  }
  return null;
}

function Catalogue() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [facets, setFacets] = useState<{ brands: string[]; sizes: string[] }>({ brands: [], sizes: [] });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categorie = params.get('categorie') || '';
  const q = params.get('q') || '';
  const marque = params.get('marque') || '';
  const taille = params.get('taille') || '';
  const promo = params.get('promo') === '1';
  const nouveau = params.get('nouveau') === '1';
  const tri = params.get('tri') || 'new';
  const prix = params.get('prix') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  useEffect(() => {
    api<Category[]>('/api/v1/categories').then(setCategories).catch(() => {});
    api<{ brands: string[]; sizes: string[] }>('/api/v1/products/facets').then(setFacets).catch(() => {});
  }, []);

  // Le résultat garde la recherche qui l'a produit : tant qu'il ne correspond pas aux filtres affichés, on montre le chargement
  const queryKey = JSON.stringify([categorie, q, marque, taille, promo, nouveau, tri, prix, page]);
  const [result, setResult] = useState<{ key: string; data: Page<Card> | null; error: string } | null>(null);
  useEffect(() => {
    const [min, max] = prix.split('-');
    api<Page<Card>>('/api/v1/products', {
      query: { category: categorie, q, brand: marque, taille, promo, new: nouveau, sort: tri, page, size: 12,
        min_price: min || undefined, max_price: max || undefined },
    }).then((d) => setResult({ key: queryKey, data: d, error: '' }))
      .catch((e) => setResult({ key: queryKey, data: null, error: e.message }));
  }, [queryKey, categorie, q, marque, taille, promo, nouveau, tri, prix, page]);
  const data = result?.key === queryKey ? result.data : null;
  const error = result?.key === queryKey ? result.error : '';

  const set = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    const paging = 'page' in changes;
    if (!paging) next.delete('page');
    router.push(`${pathname}?${next.toString()}`, { scroll: paging });
  };

  const trail = useMemo(() => (categorie ? findPath(categories, categorie) || [] : []), [categories, categorie]);
  const current = trail[trail.length - 1];
  const root = trail[0];
  const title = q ? `« ${q} »` : current ? current.name : promo ? 'Promotions' : nouveau ? 'Nouveautés' : 'Toute la boutique';
  const activeCount = [marque, taille, prix, promo ? '1' : '', nouveau ? '1' : ''].filter(Boolean).length;

  const chip = (active: boolean): React.CSSProperties => ({
    fontSize: 11, letterSpacing: '1px', padding: '7px 12px', borderRadius: 2, cursor: 'pointer', transition: 'all .2s',
    border: active ? '0.5px solid var(--gold)' : '0.5px solid rgba(var(--fg-rgb),0.15)',
    color: active ? 'var(--gold)' : 'var(--cream-muted)', background: active ? 'rgba(var(--accent-rgb),0.08)' : 'transparent',
  });

  const filters = (
    <div className="flex flex-col gap-10">
      <div>
        <p style={{ ...label, marginBottom: 16 }}>Univers</p>
        <div className="flex flex-col gap-1">
          <button onClick={() => set({ categorie: null })} className="text-left hover:text-[var(--gold)] transition-colors" style={{ fontSize: 14, color: !categorie ? 'var(--gold)' : 'var(--cream)', padding: '4px 0' }}>Tout voir</button>
          {categories.map((c) => (
            <div key={c.id}>
              <button onClick={() => set({ categorie: c.slug })} className="text-left hover:text-[var(--gold)] transition-colors w-full flex justify-between"
                style={{ fontSize: 14, color: root?.id === c.id ? 'var(--gold)' : 'var(--cream)', padding: '4px 0' }}>
                <span>{c.name}</span><span style={{ fontSize: 11, color: 'rgba(var(--fg-rgb),0.4)' }}>{c.product_count}</span>
              </button>
              {root?.id === c.id && (
                <div className="flex flex-col gap-1 animate-fade-up" style={{ borderLeft: '0.5px solid var(--border)', paddingLeft: 14, margin: '4px 0 8px' }}>
                  {c.children.map((ch) => (
                    <button key={ch.id} onClick={() => set({ categorie: ch.slug })} className="text-left hover:text-[var(--gold)] transition-colors flex justify-between"
                      style={{ fontSize: 13, color: current?.id === ch.id ? 'var(--gold)' : 'var(--cream-muted)', padding: '3px 0' }}>
                      <span>{ch.name}</span><span style={{ fontSize: 11, color: 'rgba(var(--fg-rgb),0.4)' }}>{ch.product_count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ ...label, marginBottom: 16 }}>Sélection</p>
        <div className="flex flex-wrap gap-2">
          <button style={chip(nouveau)} onClick={() => set({ nouveau: nouveau ? null : '1' })}>Nouveautés</button>
          <button style={chip(promo)} onClick={() => set({ promo: promo ? null : '1' })}>Promotions</button>
        </div>
      </div>

      {facets.sizes.length > 0 && (
        <div>
          <p style={{ ...label, marginBottom: 16 }}>Taille</p>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => <button key={s} style={chip(taille === s)} onClick={() => set({ taille: taille === s ? null : s })}>{s}</button>)}
          </div>
        </div>
      )}

      <div>
        <p style={{ ...label, marginBottom: 16 }}>Prix</p>
        <div className="flex flex-col gap-2">
          {PRICES.map((p) => (
            <button key={p.value} onClick={() => set({ prix: p.value || null })} className="text-left flex items-center gap-3" style={{ fontSize: 13, color: prix === p.value ? 'var(--gold)' : 'var(--cream-muted)' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', border: `0.5px solid ${prix === p.value ? 'var(--gold)' : 'rgba(var(--fg-rgb),0.3)'}`, background: prix === p.value ? 'var(--gold)' : 'transparent' }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {facets.brands.length > 0 && (
        <div>
          <p style={{ ...label, marginBottom: 16 }}>Marques</p>
          <div className="flex flex-col gap-2">
            {facets.brands.map((b) => (
              <button key={b} onClick={() => set({ marque: marque === b ? null : b })} className="text-left font-serif transition-colors hover:text-[var(--gold)]"
                style={{ fontSize: 16, color: marque === b ? 'var(--gold)' : 'var(--cream-muted)' }}>{b}</button>
            ))}
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <button onClick={() => set({ marque: null, taille: null, prix: null, promo: null, nouveau: null })}
          style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'left' }}>
          Effacer les filtres ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 mb-6" style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(var(--fg-rgb),0.45)' }}>
        <Link href="/" className="hover:text-[var(--gold)]">Accueil</Link><span>/</span>
        <Link href="/boutique" className="hover:text-[var(--gold)]">Boutique</Link>
        {trail.map((c) => <span key={c.id} className="flex gap-2"><span>/</span><Link href={`/boutique?categorie=${c.slug}`} className="hover:text-[var(--gold)]" style={{ color: c === current ? 'var(--gold)' : undefined }}>{c.name}</Link></span>)}
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', color: 'var(--cream)', lineHeight: 1.05, letterSpacing: '-0.5px' }}>{title}</h1>
          <p style={{ color: 'var(--cream-muted)', fontSize: 14, marginTop: 10, maxWidth: 520, lineHeight: 1.7 }}>
            {(root && root.description) || 'Une sélection pensée, chaque pièce choisie avec intention.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setFiltersOpen(true)} style={{ ...chip(activeCount > 0), padding: '11px 16px' }}>
            Filtres{activeCount ? ` (${activeCount})` : ''}
          </button>
          <select value={tri} onChange={(e) => set({ tri: e.target.value })} aria-label="Trier"
            style={{ background: 'var(--bg)', border: '0.5px solid rgba(var(--fg-rgb),0.15)', color: 'var(--cream)', fontSize: 12, padding: '11px 14px', borderRadius: 2 }}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-12">
        <aside className="hidden lg:block" style={{ position: 'sticky', top: 128, alignSelf: 'start' }}>{filters}</aside>

        <section aria-live="polite">
          {error ? <ErrorNote>{error}</ErrorNote> : !data ? <ProductGridSkeleton count={12} /> : data.items.length === 0 ? (
            <EmptyState title="Aucune pièce ne correspond" text="Essayez d'élargir vos filtres ou explorez un autre univers."
              action={<Button variant="outline" onClick={() => router.push('/boutique')}>Voir toute la boutique</Button>} />
          ) : (
            <>
              <p style={{ ...label, marginBottom: 24 }}>{data.total} pièce{data.total > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-6">
                {data.items.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 90} y={32}><ProductCard product={p} /></Reveal>)}
              </div>
              {data.pages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-16">
                  <button disabled={page <= 1} onClick={() => set({ page: String(page - 1) })} style={{ ...chip(false), opacity: page <= 1 ? 0.3 : 1 }} aria-label="Page précédente">←</button>
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => set({ page: String(n) })} style={{ ...chip(n === page), minWidth: 40 }} aria-current={n === page ? 'page' : undefined}>{n}</button>
                  ))}
                  <button disabled={page >= data.pages} onClick={() => set({ page: String(page + 1) })} style={{ ...chip(false), opacity: page >= data.pages ? 0.3 : 1 }} aria-label="Page suivante">→</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 overflow-y-auto" style={{ width: 'min(360px, 88vw)', background: 'var(--bg)', borderLeft: '0.5px solid var(--border)', padding: '28px 24px 40px' }}>
            <div className="flex justify-between items-center mb-8">
              <p className="font-serif" style={{ fontSize: 24, color: 'var(--cream)' }}>Filtres</p>
              <button onClick={() => setFiltersOpen(false)} aria-label="Fermer" style={{ color: 'var(--cream-muted)', fontSize: 20 }}>✕</button>
            </div>
            {filters}
            <div className="mt-10"><Button full onClick={() => setFiltersOpen(false)}>Voir {data?.total ?? ''} pièces</Button></div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BoutiquePage() {
  return (
    <ShopShell>
      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <Catalogue />
      </Suspense>
    </ShopShell>
  );
}
