'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/common/ProductCard';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getProducts, getCategories } from '@/lib/api';
import type { ProductResponse, CategoryResponse } from '@/types';

/* Swatches circulaires fixes pour accÃ¨s rapide â€” inspirÃ© African Avenue */
const QUICK_FILTERS: { label: string; img: string; gender: string; category: string; isNew?: boolean; isPromo?: boolean }[] = [
  { label: 'Tous', img: '/images/categories/categories-01.png', gender: '', category: '' },
  { label: 'Femme', img: '/images/categories/categories-01.png', gender: 'femme', category: '' },
  { label: 'Homme', img: '/images/categories/categories-02.png', gender: 'homme', category: '' },
  { label: 'Accessoires', img: '/images/categories/categories-03.png', gender: '', category: 'accessoires' },
  { label: 'Enfant', img: '/images/categories/categories-04.png', gender: 'enfant', category: '' },
  { label: 'NouveautÃ©s', img: '/images/categories/categories-05.png', gender: '', category: '', isNew: true },
  { label: 'Promos', img: '/images/categories/categories-06.png', gender: '', category: '', isPromo: true },
];

const SORT_OPTIONS = [
  { value: '', label: 'Trier par dÃ©faut' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix dÃ©croissant' },
  { value: 'newest', label: 'NouveautÃ©s' },
  { value: 'brand', label: 'Marque' },
];

const GENDERS = [
  { value: '', label: 'Tous' },
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'enfant', label: 'Enfant' },
];

function BoutiqueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // Filters state (initialised from URL)
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [isNew, setIsNew] = useState(searchParams.get('is_new') === 'true');
  const [isPromo, setIsPromo] = useState(searchParams.get('is_promo') === 'true');
  const [isFeatured] = useState(searchParams.get('is_featured') === 'true');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        page,
        size: PAGE_SIZE,
        gender: gender || undefined,
        category_slug: categorySlug || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        sort: sort || undefined,
        is_new: isNew || undefined,
        is_promo: isPromo || undefined,
        is_featured: isFeatured || undefined,
      });
      setProducts(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, gender, categorySlug, minPrice, maxPrice, sort, isNew, isPromo, isFeatured]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    router.replace(`/boutique?${sp.toString()}`, { scroll: false });
  };

  const applyFilters = () => {
    setPage(1);
    updateUrl({ gender, category: categorySlug, min_price: minPrice, max_price: maxPrice, sort, is_new: isNew ? 'true' : '', is_promo: isPromo ? 'true' : '' });
  };

  const resetFilters = () => {
    setGender(''); setCategorySlug(''); setMinPrice(''); setMaxPrice('');
    setSort(''); setIsNew(false); setIsPromo(false); setPage(1);
    router.replace('/boutique', { scroll: false });
  };

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Header />
      <main style={{ paddingTop: 166 }}>{/* 36px annonce + 64px nav */}
        {/* â”€â”€ Quick filter swatches circulaires â€” African Avenue style â”€â”€ */}
        <div style={{ borderBottom: '0.5px solid var(--border)', padding: '28px 40px' }}>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10" style={{ maxWidth: 1440, margin: '0 auto' }}>
            {QUICK_FILTERS.map((f) => {
              const active = gender === f.gender && categorySlug === (f.category || '') && isNew === (f.isNew || false) && isPromo === (f.isPromo || false);
              return (
                <button
                  key={f.label}
                  onClick={() => {
                    setGender(f.gender); setCategorySlug(f.category || '');
                    setIsNew(f.isNew || false); setIsPromo(f.isPromo || false);
                    setPage(1);
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                    border: active ? '2px solid var(--gold)' : '1px solid rgba(232,185,106,0.15)',
                    boxShadow: active ? '0 0 0 3px rgba(232,185,106,0.12)' : 'none',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}>
                    <Image src={f.img} alt={f.label} width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                  <span style={{
                    fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase',
                    color: active ? 'var(--gold)' : 'var(--cream-muted)',
                    transition: 'color 0.2s',
                  }}>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Page header */}
        <div style={{ padding: '40px 40px 32px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Boutique' }]} />
            <h1 className="font-serif mt-4" style={{ fontSize: 40, color: 'var(--gold)', letterSpacing: '-0.5px' }}>Boutique</h1>
            <p style={{ color: 'var(--cream-muted)', fontSize: 13, marginTop: 8 }}>
              {loading ? '...' : `${total} produit${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex" style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 40px' }}>
          {/* Sidebar */}
          <aside
            className="hidden md:flex flex-col gap-8 flex-shrink-0"
            style={{ width: 240, marginRight: 48 }}
          >
            {/* Sort */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Trier</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', color: 'var(--cream)', borderRadius: 2 }}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Gender */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Genre</p>
              <div className="flex flex-col gap-2">
                {GENDERS.map((g) => (
                  <label key={g.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="gender" value={g.value} checked={gender === g.value}
                      onChange={() => setGender(g.value)}
                      className="accent-[#E8B96A]"
                    />
                    <span style={{ fontSize: 13, color: gender === g.value ? 'var(--cream)' : 'var(--cream-muted)' }}>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>CatÃ©gories</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" value="" checked={categorySlug === ''} onChange={() => setCategorySlug('')} className="accent-[#E8B96A]" />
                    <span style={{ fontSize: 13, color: categorySlug === '' ? 'var(--cream)' : 'var(--cream-muted)' }}>Toutes</span>
                  </label>
                  {categories.map((c) => (
                    <label key={c.uuid} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="category" value={c.slug} checked={categorySlug === c.slug} onChange={() => setCategorySlug(c.slug)} className="accent-[#E8B96A]" />
                      <span style={{ fontSize: 13, color: categorySlug === c.slug ? 'var(--cream)' : 'var(--cream-muted)' }}>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Prix */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Prix (FCFA)</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2 py-2 text-sm outline-none"
                  style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', color: 'var(--cream)', borderRadius: 2 }}
                />
                <span style={{ color: 'var(--cream-muted)', fontSize: 12 }}>â€”</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2 py-2 text-sm outline-none"
                  style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', color: 'var(--cream)', borderRadius: 2 }}
                />
              </div>
            </div>

            {/* Specials */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="accent-[#E8B96A]" />
                <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>NouveautÃ©s seulement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPromo} onChange={(e) => setIsPromo(e.target.checked)} className="accent-[#E8B96A]" />
                <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>En promotion</span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={applyFilters} className="w-full uppercase text-xs font-medium tracking-widest py-3 transition-colors hover:bg-[#f5cb85]" style={{ background: 'var(--gold)', color: '#2D3A0F', borderRadius: 2, letterSpacing: '2px', fontSize: 10 }}>
                Appliquer
              </button>
              <button onClick={resetFilters} className="w-full uppercase text-xs tracking-widest py-2 transition-colors" style={{ border: '0.5px solid rgba(240,234,210,0.15)', color: 'var(--cream-muted)', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}>
                RÃ©initialiser
              </button>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile sort */}
            <div className="flex items-center justify-between mb-8 md:hidden">
              <select value={sort} onChange={(e) => { setSort(e.target.value); applyFilters(); }}
                className="px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(240,234,210,0.05)', border: '0.5px solid rgba(240,234,210,0.1)', color: 'var(--cream)', borderRadius: 2 }}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div style={{ aspectRatio: '3/4', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(240,234,210,0.07)' }} />
                    <div className="space-y-1">
                      <div style={{ height: 8, width: '40%', background: 'rgba(240,234,210,0.08)', borderRadius: 4 }} />
                      <div style={{ height: 12, width: '70%', background: 'rgba(240,234,210,0.05)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ minHeight: 400, gap: 16 }}>
                <p className="font-serif text-2xl" style={{ color: 'var(--cream-muted)' }}>Aucun produit trouvÃ©</p>
                <button onClick={resetFilters} style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
                  Voir tous les produits â†’
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p.uuid} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className="transition-all duration-200"
                    style={{
                      width: 36, height: 36, borderRadius: 2,
                      background: page === i + 1 ? 'var(--gold)' : 'transparent',
                      border: `0.5px solid ${page === i + 1 ? 'var(--gold)' : 'rgba(240,234,210,0.15)'}`,
                      color: page === i + 1 ? '#2D3A0F' : 'var(--cream-muted)',
                      fontSize: 13,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function BoutiquePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#1a1f0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--cream-muted)', letterSpacing: '3px', fontSize: 10, textTransform: 'uppercase' }}>Chargementâ€¦</span>
      </div>
    }>
      <BoutiqueContent />
    </Suspense>
  );
}

