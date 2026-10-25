'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductCard from '@/components/shop/ProductCard';
import ProductImg from '@/components/shop/ProductImg';
import { Button, EmptyState, Loading, Price, SectionTitle, label, useMounted, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import type { ProductCard as Card, ProductDetail } from '@/lib/types';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<Card[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines.find((l) => l.variantId === variantId)?.qty ?? 0);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.items.some((i) => i.id === product?.id));
  const toast = useToast((s) => s.show);
  const mounted = useMounted();

  // Navigation vers une autre pièce : la fiche repart de zéro
  const [shown, setShown] = useState(slug);
  if (shown !== slug) {
    setShown(slug); setProduct(null); setNotFound(false); setActive(0); setQty(1); setVariantId(null);
  }

  useEffect(() => {
    api<ProductDetail>(`/api/v1/products/${slug}`).then((p) => {
      setProduct(p);
      document.title = `${p.name} · La Catena`;
      const actives = p.variants.filter((v) => v.active);
      if (actives.length === 1 && actives[0].stock > 0) setVariantId(actives[0].id);
    }).catch(() => setNotFound(true));
    api<Card[]>(`/api/v1/products/${slug}/related`).then(setRelated).catch(() => setRelated([]));
  }, [slug]);

  if (notFound) {
    return (
      <ShopShell narrow>
        <EmptyState title="Pièce introuvable" text="Elle n'existe pas ou n'est plus en vente. D'autres trésors vous attendent."
          action={<Button href="/boutique">Retour à la boutique</Button>} />
      </ShopShell>
    );
  }
  if (!product) return <ShopShell><Loading /></ShopShell>;

  const variants = product.variants.filter((v) => v.active);
  const variant = variants.find((v) => v.id === variantId) || null;
  const single = variants.length === 1;
  const remaining = variant ? variant.stock - (mounted ? inCart : 0) : 0;
  const soldOut = product.stock <= 0;
  const images = product.images.length ? product.images : [{ id: 0, url: product.image || '', alt: product.name }];

  const addToCart = () => {
    if (!variant) { setSizeError(true); return; }
    if (remaining <= 0) { toast('Vous avez déjà tout le stock disponible dans votre panier.', 'error'); return; }
    add({
      variantId: variant.id, productId: product.id, slug: product.slug, name: product.name, brand: product.brand,
      size: variant.label, price: product.price, image: product.image, maxStock: variant.stock,
    }, Math.min(qty, remaining));
    setAdded(true);
    toast(`${product.name}${single ? '' : ` (${variant.label})`} ajouté au panier`);
    setTimeout(() => setAdded(false), 2400);
  };

  return (
    <ShopShell>
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 mb-8" style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(248,242,228,0.45)' }}>
        <Link href="/boutique" className="hover:text-[#E8B96A]">Boutique</Link>
        {product.category?.parent && <><span>/</span><Link href={`/boutique?categorie=${product.category.parent.slug}`} className="hover:text-[#E8B96A]">{product.category.parent.name}</Link></>}
        {product.category && <><span>/</span><Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-[#E8B96A]">{product.category.name}</Link></>}
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Galerie */}
        <div className="flex flex-col-reverse lg:flex-row gap-3">
          {images.length > 1 && (
            <div className="flex lg:flex-col gap-2">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
                  className="relative overflow-hidden flex-shrink-0 transition-all duration-200"
                  style={{ width: 72, height: 92, borderRadius: 2, border: i === active ? '1px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.12)', opacity: i === active ? 1 : 0.55 }}>
                  <ProductImg src={img.url} alt="" sizes="72px" />
                </button>
              ))}
            </div>
          )}
          <div className="relative overflow-hidden flex-1" style={{ aspectRatio: '3/4', borderRadius: 4, background: 'rgba(255,255,255,0.02)' }}>
            <ProductImg key={images[active]?.url} src={images[active]?.url} alt={product.name} sizes="(max-width: 768px) 100vw, 50vw" priority />
            {product.is_promo && product.compare_at_price && (
              <span className="absolute top-4 left-4" style={{ background: 'var(--gold)', color: '#2D3A0F', fontSize: 9, letterSpacing: '2px', padding: '5px 12px', borderRadius: 20, fontWeight: 600 }}>
                −{Math.round((1 - product.price / product.compare_at_price) * 100)} %
              </span>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="flex flex-col md:py-4" style={{ maxWidth: 520 }}>
          {product.brand && (
            <Link href={`/boutique?marque=${encodeURIComponent(product.brand)}`} style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              {product.brand}
            </Link>
          )}
          <h1 className="font-serif" style={{ fontSize: 'clamp(30px, 3.2vw, 44px)', color: 'var(--cream)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.5px' }}>{product.name}</h1>
          <Price price={product.price} compare={product.compare_at_price} size={22} />
          <p style={{ fontSize: 11, color: 'rgba(248,242,228,0.45)', letterSpacing: '1px', margin: '8px 0 28px' }}>TTC · Livraison calculée à la commande</p>

          {product.description && <p style={{ fontSize: 14, color: 'rgba(240,234,210,0.72)', lineHeight: 1.8, marginBottom: 32 }}>{product.description}</p>}

          {!single && (
            <>
              <div className="flex justify-between items-baseline mb-3">
                <p style={{ ...label, color: sizeError ? '#E8A08A' : 'var(--cream-muted)' }}>
                  {variant ? `Taille ${variant.label}` : sizeError ? 'Choisissez une taille' : 'Taille'}
                </p>
                {variant && variant.stock <= 3 && variant.stock > 0 && <p style={{ fontSize: 12, color: 'var(--gold)' }}>Plus que {variant.stock} en stock</p>}
              </div>
              <div className="flex gap-2 flex-wrap mb-8" role="radiogroup" aria-label="Taille">
                {variants.map((v) => {
                  const out = v.stock <= 0;
                  const selected = v.id === variantId;
                  return (
                    <button key={v.id} role="radio" aria-checked={selected} disabled={out} onClick={() => { setVariantId(v.id); setSizeError(false); setQty(1); }}
                      title={out ? 'Épuisé dans cette taille' : undefined}
                      className="transition-all duration-200"
                      style={{
                        minWidth: 52, height: 48, padding: '0 12px', fontSize: 12, letterSpacing: '1px', borderRadius: 2,
                        border: selected ? '1px solid var(--gold)' : '0.5px solid rgba(240,234,210,0.18)',
                        color: out ? 'rgba(240,234,210,0.25)' : selected ? 'var(--gold)' : 'var(--cream)',
                        background: selected ? 'rgba(232,185,106,0.08)' : 'transparent',
                        textDecoration: out ? 'line-through' : 'none', cursor: out ? 'not-allowed' : 'pointer',
                      }}>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {single && variant && variant.stock <= 3 && <p style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 16 }}>Plus que {variant.stock} en stock</p>}

          <div className="flex gap-3 mb-4">
            <div className="flex items-center" style={{ border: '0.5px solid rgba(240,234,210,0.18)', borderRadius: 2 }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Moins" className="hover:text-[#E8B96A]" style={{ width: 44, height: 52, color: 'var(--cream-muted)', fontSize: 18 }}>−</button>
              <span aria-live="polite" style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 500, color: 'var(--cream)' }}>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(q + 1, variant ? Math.max(remaining, 1) : 10))} aria-label="Plus" className="hover:text-[#E8B96A]" style={{ width: 44, height: 52, color: 'var(--cream-muted)', fontSize: 18 }}>+</button>
            </div>
            <button onClick={addToCart} disabled={soldOut} className="btn-gold flex-1 transition-all duration-200"
              style={{
                height: 54, fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, borderRadius: 2,
                background: soldOut ? 'rgba(232,185,106,0.15)' : added ? '#4A6020' : 'var(--gold)',
                color: soldOut ? 'rgba(232,185,106,0.5)' : added ? 'var(--gold)' : '#2D3A0F',
                border: added ? '0.5px solid rgba(232,185,106,0.4)' : 'none', cursor: soldOut ? 'not-allowed' : 'pointer',
              }}>
              {soldOut ? 'Épuisé' : added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
            </button>
          </div>
          {added && <Link href="/panier" className="animate-fade-up text-center mb-4" style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>Voir mon panier →</Link>}

          <button onClick={() => { toggle(product); toast(wished ? 'Retiré de vos favoris' : 'Ajouté à vos favoris'); }}
            className="flex items-center justify-center gap-2 transition-all duration-200 mb-10"
            style={{ height: 48, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', borderRadius: 2,
              border: `0.5px solid ${mounted && wished ? 'rgba(232,185,106,0.5)' : 'rgba(240,234,210,0.14)'}`,
              color: mounted && wished ? 'var(--gold)' : 'var(--cream-muted)' }}>
            {mounted && wished ? '♥ Dans vos favoris' : '♡ Ajouter aux favoris'}
          </button>

          {product.details.length > 0 && (
            <div className="mb-8">
              <p style={{ ...label, marginBottom: 14 }}>Composition & entretien</p>
              <ul className="flex flex-col gap-2">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-3" style={{ fontSize: 13, color: 'var(--cream-muted)' }}><span style={{ color: 'var(--gold)' }}>—</span>{d}</li>
                ))}
              </ul>
              {product.sku && <p style={{ fontSize: 11, color: 'rgba(248,242,228,0.4)', marginTop: 12, letterSpacing: '1px' }}>Réf. {product.sku}</p>}
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(240,234,210,0.08)', borderRadius: 4, padding: '20px 24px' }}>
            {[
              { icon: '✦', text: 'Livraison offerte à Lomé dès 50 000 FCFA' },
              { icon: '◈', text: 'Paiement à la livraison ou par Mobile Money' },
              { icon: '↩', text: 'Échange sous 7 jours, retrait gratuit en boutique' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 py-1.5">
                <span style={{ color: 'var(--gold)', fontSize: 12 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 96 }}>
          <SectionTitle>Vous aimerez aussi</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </ShopShell>
  );
}
