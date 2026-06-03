'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductCard from '@/components/common/ProductCard';
import { getProduct, getProducts } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import type { ProductDetailResponse, ProductResponse, VariantResponse } from '@/types';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [similar, setSimilar] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<VariantResponse | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);

  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        setMainImage(p.primary_image_url || (p.images?.[0]?.url ?? null));
        const firstActive = p.variants?.find((v) => v.is_active);
        if (firstActive) setSelectedVariant(firstActive);
        getProducts({ size: 4 }).then((d) => setSimilar(d.items.filter((x) => x.uuid !== p.uuid).slice(0, 4))).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 166, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--cream-muted)', fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase' }}>Chargement...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: 166, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <p className="font-serif text-2xl" style={{ color: 'var(--gold)' }}>Produit introuvable</p>
            <Link href="/boutique" style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginTop: 16, display: 'block' }}>← Retour boutique</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayPrice = product.is_promo && product.promo_price != null
    ? (product.promo_price + (selectedVariant?.extra_price ?? 0))
    : (product.price_ttc + (selectedVariant?.extra_price ?? 0));

  const wished = isInWishlist(product.uuid);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await addItem(selectedVariant.uuid, 1);
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 2500);
    } finally {
      setAdding(false);
    }
  };

  // Group variants by size
  const activeSizes = product.variants?.filter((v) => v.is_active && v.stock > 0) ?? [];
  const activeColors = [...new Set(activeSizes.map((v) => v.color).filter(Boolean))];

  return (
    <>
      <Header />
      <main style={{ paddingTop: 166 }}>
        {/* Breadcrumb */}
        <div style={{ padding: '24px 40px', maxWidth: 1440, margin: '0 auto' }}>
          <Breadcrumb items={[
            { label: 'Accueil', href: '/' },
            { label: 'Boutique', href: '/boutique' },
            { label: product.category?.name ?? 'Produits', href: `/boutique?category=${product.category?.slug ?? ''}` },
            { label: product.name },
          ]} />
        </div>

        {/* Main product area */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
          style={{ padding: '0 40px 80px', maxWidth: 1440, margin: '0 auto' }}
        >
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden" style={{ aspectRatio: '4/5', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}>
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill className="object-cover" priority sizes="50vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--cream-muted)' }}>Aucune image</div>
              )}
              {product.is_new && (
                <span className="absolute top-4 left-4" style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '3px 12px', borderRadius: 20, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase' }}>Nouveau</span>
              )}
              {product.is_promo && (
                <span className="absolute top-4 left-4" style={{ background: '#4A6020', color: 'var(--gold)', padding: '3px 12px', borderRadius: 20, fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', border: '0.5px solid rgba(232,185,106,0.3)' }}>Promo</span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img) => (
                  <button
                    key={img.uuid}
                    onClick={() => setMainImage(img.url)}
                    className="flex-shrink-0 relative overflow-hidden transition-all duration-200"
                    style={{
                      width: 72, height: 72 * (5 / 4), borderRadius: 2,
                      border: mainImage === img.url ? '1.5px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.15)',
                    }}
                  >
                    <Image src={img.url} alt={img.alt ?? product.name} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-6">
            <div>
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{product.brand}</p>
              <h1 className="font-serif" style={{ fontSize: 'clamp(24px, 3vw, 40px)', color: 'var(--cream)', lineHeight: 1.2, letterSpacing: '-0.5px' }}>{product.name}</h1>
              <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 8, letterSpacing: '1px' }}>Réf. {product.reference}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl" style={{ color: 'var(--gold)' }}>
                {displayPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
              </span>
              {product.is_promo && product.promo_price != null && (
                <span className="text-base line-through" style={{ color: 'var(--cream-muted)' }}>
                  {product.price_ttc.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                </span>
              )}
              <span style={{ fontSize: 10, color: 'var(--cream-muted)', letterSpacing: '1px' }}>TTC</span>
            </div>

            <div style={{ height: '0.5px', background: 'var(--border)' }} />

            {/* Size selector */}
            {activeSizes.length > 0 && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>Taille</p>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(activeSizes.map((v) => v.size))].map((size) => {
                    const variantForSize = activeSizes.find((v) => v.size === size);
                    const isSelected = selectedVariant?.size === size;
                    return (
                      <button
                        key={size}
                        onClick={() => { if (variantForSize) setSelectedVariant(variantForSize); }}
                        style={{
                          minWidth: 44, padding: '8px 12px',
                          border: isSelected ? '1.5px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.2)',
                          borderRadius: 2,
                          color: isSelected ? 'var(--gold)' : 'var(--cream-muted)',
                          fontSize: 12,
                          background: isSelected ? 'rgba(232,185,106,0.08)' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {activeColors.length > 1 && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>Couleur</p>
                <div className="flex flex-wrap gap-2">
                  {activeColors.map((color) => {
                    const variantForColor = activeSizes.find((v) => v.color === color);
                    const isSelected = selectedVariant?.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => { if (variantForColor) setSelectedVariant(variantForColor); }}
                        style={{
                          padding: '6px 14px', borderRadius: 2,
                          border: isSelected ? '1.5px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.2)',
                          color: isSelected ? 'var(--gold)' : 'var(--cream-muted)',
                          fontSize: 12,
                          background: isSelected ? 'rgba(232,185,106,0.08)' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant || activeSizes.length === 0}
                className="w-full uppercase font-medium tracking-widest transition-all duration-200 hover:bg-[#f5cb85] disabled:opacity-40"
                style={{
                  background: addedMsg ? '#4A6020' : 'var(--gold)',
                  color: addedMsg ? 'var(--gold)' : '#2D3A0F',
                  padding: '16px',
                  borderRadius: 2,
                  fontSize: 11,
                  letterSpacing: '2px',
                  border: addedMsg ? '0.5px solid rgba(232,185,106,0.3)' : 'none',
                }}
              >
                {activeSizes.length === 0
                  ? 'Rupture de stock'
                  : addedMsg
                  ? '✓ Ajouté au panier'
                  : adding
                  ? '...'
                  : 'Ajouter au panier'}
              </button>

              <button
                onClick={() => toggle(product as ProductResponse)}
                className="w-full uppercase tracking-widest transition-colors duration-200"
                style={{
                  border: `1.5px solid ${wished ? 'var(--gold)' : 'rgba(240,234,210,0.2)'}`,
                  color: wished ? 'var(--gold)' : 'var(--cream-muted)',
                  padding: '14px',
                  borderRadius: 2,
                  fontSize: 11,
                  letterSpacing: '2px',
                  background: wished ? 'rgba(232,185,106,0.06)' : 'transparent',
                }}
              >
                {wished ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'}
              </button>
            </div>

            <div style={{ height: '0.5px', background: 'var(--border)' }} />

            {/* Description */}
            {product.description && (
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12 }}>Description</p>
                <p style={{ fontSize: 13, color: 'rgba(240,234,210,0.65)', lineHeight: 1.8 }}>{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 10, letterSpacing: '1px', padding: '3px 10px', border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 20, color: 'var(--cream-muted)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <section style={{ padding: '0 40px 80px', maxWidth: 1440, margin: '0 auto' }}>
            <div className="flex items-center gap-4 mb-12">
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Vous aimerez aussi</p>
              <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similar.map((p) => <ProductCard key={p.uuid} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
