'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { ProductResponse } from '@/types';

interface Props {
  product: ProductResponse;
  variantUuid?: string;
}

export default function ProductCard({ product, variantUuid }: Props) {
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const wished = isInWishlist(product.uuid);

  const displayPrice = product.is_promo && product.promo_price != null
    ? product.promo_price
    : product.price_ttc;

  const fmt = (n: number | string) =>
    Number(n).toLocaleString('fr-FR') + ' FCFA';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantUuid || adding) return;
    setAdding(true);
    try {
      await addItem(variantUuid, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image block ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: '3/4',
          background: 'rgba(255,255,255,0.025)',
          border: '0.5px solid rgba(240,234,210,0.07)',
        }}
      >
        {/* Photo */}
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          /* Placeholder élégant */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span style={{ fontSize: 28, color: 'rgba(232,185,106,0.2)', letterSpacing: 4 }}>⊙⊙⊙</span>
            <span style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.2)' }}>
              {product.brand || 'La Catena'}
            </span>
          </div>
        )}

        {/* Gradient overlay au hover (readabilité du CTA) */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(26,31,14,0.75) 0%, transparent 50%)',
            opacity: hovered ? 1 : 0,
            pointerEvents: 'none',
          }}
        />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new && (
            <span style={{
              background: 'var(--gold)', color: '#2D3A0F',
              fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 20, fontWeight: 600,
            }}>
              Nouveau
            </span>
          )}
          {product.is_promo && (
            <span style={{
              background: '#4A6020', color: 'var(--gold)',
              fontSize: 8, letterSpacing: '2px', textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 20,
              border: '0.5px solid rgba(232,185,106,0.3)',
            }}>
              Promo
            </span>
          )}
        </div>

        {/* Wishlist top-right */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 flex items-center justify-center transition-all duration-200"
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: wished ? 'var(--gold)' : 'rgba(26,31,14,0.65)',
            border: '0.5px solid ' + (wished ? 'var(--gold)' : 'rgba(240,234,210,0.2)'),
            color: wished ? '#2D3A0F' : 'var(--cream-muted)',
            fontSize: 13,
            backdropFilter: 'blur(4px)',
          }}
          aria-label={wished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {wished ? '♥' : '♡'}
        </button>

        {/* CTA slide-up depuis le bas — inspiré African Avenue */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-300"
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: hovered ? 1 : 0,
            padding: '0 12px 12px',
          }}
        >
          {variantUuid ? (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full transition-colors duration-200"
              style={{
                background: added ? '#4A6020' : 'var(--gold)',
                color: added ? 'var(--gold)' : '#2D3A0F',
                border: added ? '0.5px solid rgba(232,185,106,0.4)' : 'none',
                padding: '10px',
                fontSize: 9,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {added ? '✓ Ajouté' : adding ? '…' : 'Ajouter au panier'}
            </button>
          ) : (
            <div style={{
              background: 'rgba(26,31,14,0.85)',
              border: '0.5px solid rgba(232,185,106,0.3)',
              padding: '10px',
              textAlign: 'center',
              fontSize: 9, letterSpacing: '2.5px',
              textTransform: 'uppercase', color: 'var(--gold)',
              backdropFilter: 'blur(4px)',
            }}>
              Voir le produit →
            </div>
          )}
        </div>
      </div>

      {/* ── Info block ───────────────────────────────────────────────── */}
      <div style={{ marginTop: 12, paddingBottom: 4 }}>
        {/* Brand label — uppercase muted, très petit */}
        {product.brand && (
          <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 4 }}>
            {product.brand}
          </p>
        )}
        {/* Nom produit */}
        <p
          className="transition-colors duration-200 group-hover:text-[#E8B96A]"
          style={{ fontSize: 13, color: 'var(--cream)', lineHeight: 1.35, marginBottom: 6 }}
        >
          {product.name}
        </p>
        {/* Prix */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>
            {fmt(displayPrice)}
          </span>
          {product.is_promo && product.promo_price != null && (
            <span style={{ fontSize: 11, color: 'var(--cream-muted)', textDecoration: 'line-through' }}>
              {fmt(product.price_ttc)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
