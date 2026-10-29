'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import ProductImg from '@/components/shop/ProductImg';
import { Button, EmptyState, Loading, PageHeading, Price, label, useMounted } from '@/components/ui';
import { api } from '@/lib/api';
import { fcfa } from '@/lib/format';
import type { ShippingRate } from '@/lib/types';
import { cartCount, cartSubtotal, useCart } from '@/store/cart';

export default function CartPage() {
  const mounted = useMounted();
  const { lines, setQty, remove } = useCart();
  const [freeFrom, setFreeFrom] = useState<number | null>(null);

  useEffect(() => {
    api<ShippingRate[]>('/api/v1/shipping/rates').then((rates) => {
      const thresholds = rates.map((r) => r.free_from).filter((v): v is number => v != null);
      setFreeFrom(thresholds.length ? Math.min(...thresholds) : null);
    }).catch(() => {});
  }, []);

  if (!mounted) return <ShopShell><Loading /></ShopShell>;

  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);

  return (
    <ShopShell narrow>
      <PageHeading eyebrow="Votre sélection" title="Panier">
        {count > 0 ? `${count} pièce${count > 1 ? 's' : ''} mise${count > 1 ? 's' : ''} de côté pour vous.` : null}
      </PageHeading>

      {lines.length === 0 ? (
        <EmptyState title="Votre panier est vide" text="Laissez-vous inspirer par nos nouveautés et nos pièces signatures."
          action={<Button href="/boutique">Découvrir la boutique</Button>} />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-12">
          <ul className="flex flex-col" style={{ borderTop: '0.5px solid var(--border)' }}>
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-4 md:gap-6 py-6" style={{ borderBottom: '0.5px solid var(--border)' }}>
                <Link href={`/produits/${l.slug}`} className="relative overflow-hidden flex-shrink-0" style={{ width: 96, height: 128, background: 'rgba(var(--fg-rgb),0.03)' }}>
                  <ProductImg src={l.image} alt={l.name} sizes="96px" />
                </Link>
                <div className="flex-1 flex flex-col min-w-0">
                  {l.brand && <p style={{ fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 4 }}>{l.brand}</p>}
                  <Link href={`/produits/${l.slug}`} className="hover:text-[var(--gold)]" style={{ fontSize: 15, color: 'var(--cream)', lineHeight: 1.3 }}>{l.name}</Link>
                  {l.size !== 'Taille unique' && <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>Taille {l.size}</p>}
                  <div className="mt-2"><Price price={l.price} /></div>
                  <div className="flex items-center justify-between mt-auto pt-4 gap-4">
                    <div className="flex items-center" style={{ border: '0.5px solid rgba(var(--fg-rgb),0.18)', borderRadius: 2 }}>
                      <button onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="Moins" style={{ width: 36, height: 36, color: 'var(--cream-muted)' }}>−</button>
                      <span style={{ width: 28, textAlign: 'center', fontSize: 13 }}>{l.qty}</span>
                      <button onClick={() => setQty(l.variantId, l.qty + 1)} disabled={l.qty >= l.maxStock} aria-label="Plus" style={{ width: 36, height: 36, color: 'var(--cream-muted)', opacity: l.qty >= l.maxStock ? 0.3 : 1 }}>+</button>
                    </div>
                    <button onClick={() => remove(l.variantId)} style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }} className="hover:text-[#E8A08A]">Retirer</button>
                  </div>
                </div>
                <p className="hidden md:block" style={{ fontSize: 14, color: 'var(--cream)', whiteSpace: 'nowrap' }}>{fcfa(l.price * l.qty)}</p>
              </li>
            ))}
          </ul>

          <aside style={{ position: 'sticky', top: 128, alignSelf: 'start', background: 'rgba(var(--fg-rgb),0.025)', border: '0.5px solid rgba(var(--fg-rgb),0.07)', borderRadius: 8, padding: 28 }}>
            <p style={{ ...label, marginBottom: 20 }}>Récapitulatif</p>
            <div className="flex justify-between mb-3" style={{ fontSize: 14 }}>
              <span style={{ color: 'var(--cream-muted)' }}>Sous-total</span><span>{fcfa(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-6" style={{ fontSize: 14 }}>
              <span style={{ color: 'var(--cream-muted)' }}>Livraison</span><span style={{ color: 'var(--cream-muted)' }}>À l&apos;étape suivante</span>
            </div>
            {freeFrom != null && (
              <div className="mb-6" style={{ fontSize: 12, color: 'var(--cream-muted)' }}>
                {subtotal >= freeFrom ? (
                  <p style={{ color: 'var(--gold)' }}>✦ La livraison standard à Lomé vous est offerte.</p>
                ) : (
                  <>
                    <p className="mb-2">Plus que <span style={{ color: 'var(--gold)' }}>{fcfa(freeFrom - subtotal)}</span> pour la livraison offerte à Lomé.</p>
                    <div style={{ height: 2, background: 'var(--border)' }}><div style={{ height: 2, width: `${Math.min(100, (subtotal / freeFrom) * 100)}%`, background: 'var(--gold)', transition: 'width .4s' }} /></div>
                  </>
                )}
              </div>
            )}
            <div style={{ height: '0.5px', background: 'var(--border)', margin: '0 0 20px' }} />
            <div className="flex justify-between items-baseline mb-6">
              <span style={{ fontSize: 13, color: 'var(--cream)' }}>Total articles</span>
              <span className="font-serif" style={{ fontSize: 26, color: 'var(--gold)' }}>{fcfa(subtotal)}</span>
            </div>
            <Button href="/commande" full>Passer commande</Button>
            <p style={{ fontSize: 11, color: 'rgba(var(--fg-rgb),0.45)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
              Sans compte · Paiement à la livraison ou Mobile Money
            </p>
            <Link href="/boutique" className="block text-center mt-4 hover:text-[var(--gold)]" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>← Continuer mes achats</Link>
          </aside>
        </div>
      )}
    </ShopShell>
  );
}
