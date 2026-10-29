'use client';
import Link from 'next/link';
import type { ProductCard as Card } from '@/lib/types';
import { useWishlist } from '@/store/wishlist';
import { Price, useMounted, useToast } from '@/components/ui';
import ProductImg from './ProductImg';

export default function ProductCard({ product, badge }: { product: Card; badge?: 'new' | 'best' }) {
  const mounted = useMounted();
  const wished = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useToast((s) => s.show);
  const soldOut = product.stock <= 0;
  const tag = soldOut ? 'Épuisé' : product.is_promo ? `−${Math.round((1 - product.price / (product.compare_at_price || product.price)) * 100)} %`
    : badge === 'best' ? 'Best-seller' : product.is_new || badge === 'new' ? 'Nouveau' : null;

  return (
    <Link href={`/produits/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'rgba(var(--fg-rgb),0.05)' }}>
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" style={{ opacity: soldOut ? 0.55 : 1 }}>
          <ProductImg src={product.image} alt={product.name} sizes="(max-width: 768px) 50vw, 25vw" />
        </div>
        {product.hover_image && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <ProductImg src={product.hover_image} alt="" sizes="(max-width: 768px) 50vw, 25vw" />
          </div>
        )}
        {tag && (
          <span className="absolute top-3 left-3 z-10" style={{
            // Pastilles posées sur la photo : couleurs fixes, lisibles quel que soit le thème de la page
            background: soldOut ? 'rgba(26,31,14,0.85)' : badge === 'best' && !product.is_promo ? '#4A6020' : '#E8B96A',
            color: soldOut ? '#F5EDD8' : badge === 'best' && !product.is_promo ? '#E8B96A' : '#2D3A0F',
            fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20, fontWeight: 600,
          }}>{tag}</span>
        )}
        <button
          aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={(e) => { e.preventDefault(); toggle(product); toast(wished ? 'Retiré de vos favoris' : 'Ajouté à vos favoris'); }}
          className="absolute top-3 right-3 z-10 flex items-center justify-center transition-all hover:scale-110"
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(26,31,14,0.65)', backdropFilter: 'blur(6px)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={mounted && wished ? '#E8B96A' : 'none'} stroke="#E8B96A" strokeWidth="1.6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {!soldOut && product.sizes.length > 0 && product.sizes[0] !== 'Taille unique' && (
          <div className="absolute inset-x-0 bottom-0 z-10 hidden md:flex flex-wrap justify-center gap-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{ padding: '24px 8px 12px', background: 'linear-gradient(to top, rgba(26,31,14,0.88), transparent)' }}>
            {product.sizes.slice(0, 6).map((s) => (
              <span key={s} style={{ fontSize: 9, letterSpacing: '1px', color: '#F5EDD8', border: '0.5px solid rgba(245,237,216,0.4)', padding: '3px 7px' }}>{s}</span>
            ))}
          </div>
        )}
      </div>
      <div>
        {product.brand && <p style={{ fontSize: 9, letterSpacing: '2px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{product.brand}</p>}
        <p className="transition-colors group-hover:text-[var(--gold)]" style={{ fontSize: 14, color: 'var(--cream)', marginBottom: 6, lineHeight: 1.3 }}>{product.name}</p>
        <Price price={product.price} compare={product.compare_at_price} />
      </div>
    </Link>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="shimmer" style={{ aspectRatio: '3/4' }} />
          <div className="shimmer" style={{ height: 10, width: '40%' }} />
          <div className="shimmer" style={{ height: 12, width: '80%' }} />
        </div>
      ))}
    </div>
  );
}
