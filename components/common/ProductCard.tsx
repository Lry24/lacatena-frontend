'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const router = useRouter();
  const wished = isInWishlist(product.uuid);

  const displayPrice = product.is_promo && product.promo_price != null
    ? (Number(product.promo_price) || 0)
    : (Number(product.price_ttc) || 0);

  const fmt = (n: number | string) =>
    Number(n).toLocaleString('fr-FR') + ' FCFA';

  const handleQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((q) => Math.max(1, Math.min(10, q + delta)));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantUuid || adding) return;
    setAdding(true);
    try {
      await addItem(variantUuid, qty, {
        product_name: product.name,
        product_slug: product.slug,
        unit_price: Number(displayPrice) || 0,
        product_image_url: product.primary_image_url ?? undefined,
      });
      setAdded(true);
      setQty(1);
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
      onMouseLeave={() => { setHovered(false); }}
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
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span style={{ fontSize: 28, color: 'rgba(232,185,106,0.2)', letterSpacing: 4 }}>⊙⊙⊙</span>
            <span style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.2)' }}>
              {product.brand || 'La Catena'}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(26,31,14,0.85) 0%, rgba(26,31,14,0.2) 45%, transparent 70%)',
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
          className="absolute top-3 right-3 z-10 flex items-center justify-center btn-outline"
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

        {/* CTA slide-up */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 transition-all duration-300"
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: hovered ? 1 : 0,
            padding: '0 10px 10px',
          }}
        >
          {variantUuid ? (
            <div className="flex flex-col gap-1.5">
              {/* Quantity row */}
              <div className="flex items-center gap-2">
                {/* Stepper */}
                <div
                  className="flex items-center"
                  style={{
                    background: 'rgba(26,31,14,0.85)',
                    border: '0.5px solid rgba(232,185,106,0.3)',
                    borderRadius: 2,
                    backdropFilter: 'blur(6px)',
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={(e) => handleQty(e, -1)}
                    className="flex items-center justify-center transition-colors hover:text-[var(--gold)]"
                    style={{ width: 28, height: 28, color: 'rgba(240,234,210,0.6)', fontSize: 14, lineHeight: 1 }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: 24, textAlign: 'center',
                      fontSize: 12, fontWeight: 600,
                      color: 'var(--gold)',
                      borderLeft: '0.5px solid rgba(232,185,106,0.2)',
                      borderRight: '0.5px solid rgba(232,185,106,0.2)',
                      lineHeight: '28px',
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={(e) => handleQty(e, 1)}
                    className="flex items-center justify-center transition-colors hover:text-[var(--gold)]"
                    style={{ width: 28, height: 28, color: 'rgba(240,234,210,0.6)', fontSize: 14, lineHeight: 1 }}
                  >
                    +
                  </button>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn-gold flex-1"
                  style={{
                    background: added ? '#4A6020' : 'var(--gold)',
                    color: added ? 'var(--gold)' : '#2D3A0F',
                    border: added ? '0.5px solid rgba(232,185,106,0.4)' : 'none',
                    padding: '7px 8px',
                    fontSize: 8,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: added ? 'none' : '0 2px 12px rgba(232,185,106,0.25)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {added ? '✓ Ajouté' : adding ? '…' : 'Ajouter au panier'}
                </button>
              </div>
            </div>
          ) : (
            /* Pas de variantUuid : CTA redirige vers la fiche produit */
            <button
              onClick={(e) => {
                e.preventDefault();
                router.push(`/produits/${product.slug}`);
              }}
              style={{
                width: '100%',
                background: 'var(--gold)',
                color: '#2D3A0F',
                border: 'none',
                padding: '10px',
                textAlign: 'center',
                fontSize: 9, letterSpacing: '2.5px',
                textTransform: 'uppercase', fontWeight: 700,
                borderRadius: 2,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(232,185,106,0.25)',
              }}
            >
              Voir &amp; choisir →
            </button>
          )}
        </div>
      </div>

      {/* ── Info block ───────────────────────────────────────────────── */}
      <div style={{ marginTop: 12, paddingBottom: 4 }}>
        {product.brand && (
          <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 4 }}>
            {product.brand}
          </p>
        )}
        <p
          className="transition-colors duration-200 group-hover:text-[#E8B96A]"
          style={{ fontSize: 13, color: 'var(--cream)', lineHeight: 1.35, marginBottom: 6 }}
        >
          {product.name}
        </p>
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
