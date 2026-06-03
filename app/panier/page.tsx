'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useCartStore } from '@/store/cartStore';

export default function PanierPage() {
  const { items, total, totalItems, loading, initSession, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    initSession();
  }, [initSession]);

  const shipping = total >= 50000 ? 0 : 3500;

  return (
    <>
      <Header />
      <main style={{ paddingTop: 100, minHeight: '80vh' }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1440, margin: '0 auto' }}>
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Panier' }]} />
          <h1 className="font-serif mt-4 mb-2" style={{ fontSize: 40, color: 'var(--gold)' }}>Mon panier</h1>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13, marginBottom: 40 }}>
            {loading ? '...' : `${totalItems} article${totalItems !== 1 ? 's' : ''}`}
          </p>

          {loading ? (
            <div style={{ color: 'var(--cream-muted)', fontSize: 13 }}>Chargement...</div>
          ) : items.length === 0 ? (
            /* Empty cart */
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 360, gap: 20 }}>
              <span style={{ fontSize: 48, color: 'rgba(232,185,106,0.3)' }}>⊙</span>
              <p className="font-serif text-2xl" style={{ color: 'var(--cream-muted)' }}>Votre panier est vide</p>
              <p style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.7 }}>
                Découvrez notre sélection et trouvez votre prochaine pièce.
              </p>
              <Link
                href="/boutique"
                className="mt-2 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                Voir la boutique
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Items list */}
              <div className="flex-1 flex flex-col gap-0">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-5 py-6"
                    style={{ borderTop: i === 0 ? '0.5px solid var(--border)' : 'none', borderBottom: '0.5px solid var(--border)' }}
                  >
                    {/* Image */}
                    <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 80, height: 80 * (4 / 3), borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                      {item.product_image_url ? (
                        <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--cream-muted)', fontSize: 10 }}>img</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{item.product_name}</p>
                      <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 4 }}>
                        {item.variant_size && <span>Taille: {item.variant_size}</span>}
                        {item.variant_size && item.variant_color && <span style={{ margin: '0 6px' }}>·</span>}
                        {item.variant_color && <span>Couleur: {item.variant_color}</span>}
                      </p>
                      <p className="mt-2" style={{ fontSize: 13, color: 'var(--gold)' }}>
                        {item.unit_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-0 flex-shrink-0" style={{ border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2 }}>
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="flex items-center justify-center transition-colors hover:bg-[rgba(240,234,210,0.05)]"
                        style={{ width: 32, height: 32, color: 'var(--cream-muted)', fontSize: 16 }}
                      >
                        −
                      </button>
                      <span style={{ width: 32, textAlign: 'center', fontSize: 13, color: 'var(--cream)' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="flex items-center justify-center transition-colors hover:bg-[rgba(240,234,210,0.05)]"
                        style={{ width: 32, height: 32, color: 'var(--cream-muted)', fontSize: 16 }}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0" style={{ minWidth: 80 }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>
                        {item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="mt-2 transition-colors hover:text-red-400"
                        style={{ fontSize: 10, letterSpacing: '1px', color: 'var(--cream-muted)', textTransform: 'uppercase' }}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div
                className="flex-shrink-0 flex flex-col gap-5"
                style={{ width: 'min(100%, 360px)', background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 4, padding: '32px', alignSelf: 'flex-start' }}
              >
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)' }}>Récapitulatif</p>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Sous-total</span>
                    <span style={{ fontSize: 13, color: 'var(--cream)' }}>{total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: 13, color: 'var(--cream-muted)' }}>Livraison</span>
                    <span style={{ fontSize: 13, color: shipping === 0 ? 'var(--gold)' : 'var(--cream)' }}>
                      {shipping === 0 ? 'Gratuite' : shipping.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div style={{ height: '0.5px', background: 'var(--border)' }} />
                  <div className="flex justify-between items-baseline">
                    <span style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Total TTC</span>
                    <span className="font-serif text-xl" style={{ color: 'var(--gold)' }}>
                      {(total + shipping).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {shipping > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--cream-muted)', lineHeight: 1.6 }}>
                    Livraison gratuite dès 50 000 FCFA d&apos;achat.
                  </p>
                )}

                <Link
                  href="/commande"
                  className="text-center uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                  style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                >
                  Passer la commande
                </Link>

                <Link
                  href="/boutique"
                  className="text-center uppercase transition-colors"
                  style={{ border: '0.5px solid rgba(240,234,210,0.15)', color: 'var(--cream-muted)', padding: '12px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
