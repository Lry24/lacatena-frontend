'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function PanierPage() {
  const { items, total, totalItems, loading, fetchCart, updateItem, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const shipping = total >= 50000 ? 0 : 3500;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    router.push('/commande');
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: 190, minHeight: '80vh' }}>
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
                    {/* Image (non cliquable) */}
                    <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 80, height: 80 * (4 / 3), borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                      {item.product_image_url ? (
                        <Image src={item.product_image_url} alt={item.product_name || 'Produit'} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--cream-muted)', fontSize: 10 }}>img</div>
                      )}
                    </div>

                    {/* Info — nom cliquable uniquement */}
                    <div className="flex-1 min-w-0">
                      {(item as any).product_slug ? (
                        <Link
                          href={`/produits/${(item as any).product_slug}`}
                          className="inline-block transition-colors hover:text-[var(--gold)]"
                          style={{ color: 'var(--cream)', fontSize: 14, fontWeight: 500 }}
                        >
                          {item.product_name || 'Produit inconnu'}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{item.product_name || 'Produit inconnu'}</p>
                      )}
                      <p style={{ fontSize: 11, color: 'var(--cream-muted)', marginTop: 4 }}>
                        {item.variant_size && <span>Taille: {item.variant_size}</span>}
                        {item.variant_size && item.variant_color && <span style={{ margin: '0 6px' }}>·</span>}
                        {item.variant_color && <span>Couleur: {item.variant_color}</span>}
                      </p>
                      <p className="mt-2" style={{ fontSize: 13, color: 'var(--gold)' }}>
                        {(item.unit_price || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-0 flex-shrink-0" style={{ border: '0.5px solid rgba(240,234,210,0.15)', borderRadius: 2 }}>
                      <button
                        onClick={() => item.id && (item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id))}
                        className="flex items-center justify-center transition-colors hover:bg-[rgba(240,234,210,0.05)]"
                        style={{ width: 32, height: 32, color: 'var(--cream-muted)', fontSize: 16 }}
                      >
                        −
                      </button>
                      <span style={{ width: 32, textAlign: 'center', fontSize: 13, color: 'var(--cream)' }}>{item.quantity}</span>
                      <button
                        onClick={() => item.id && updateItem(item.id, item.quantity + 1)}
                        className="flex items-center justify-center transition-colors hover:bg-[rgba(240,234,210,0.05)]"
                        style={{ width: 32, height: 32, color: 'var(--cream-muted)', fontSize: 16 }}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0" style={{ minWidth: 80 }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>
                        {(item.subtotal || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </p>
                      <button
                        onClick={() => item.id && removeItem(item.id)}
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

                <button
                  onClick={handleCheckout}
                  className="text-center uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                  style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px', width: '100%' }}
                >
                  Passer la commande
                </button>

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

      {/* Popup authentification */}
      {showAuthPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(10,12,6,0.82)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowAuthPopup(false)}
        >
          <div
            className="relative flex flex-col items-center text-center"
            style={{
              background: 'linear-gradient(160deg, #1c1f0e 0%, #141608 100%)',
              border: '0.5px solid rgba(232,185,106,0.3)',
              borderRadius: 6,
              padding: '52px 44px 44px',
              maxWidth: 440,
              width: '90%',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,185,106,0.06), inset 0 1px 0 rgba(232,185,106,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setShowAuthPopup(false)}
              className="absolute top-4 right-4 flex items-center justify-center transition-all duration-200 hover:bg-[rgba(232,185,106,0.1)] hover:text-[var(--gold)]"
              style={{ width: 28, height: 28, borderRadius: '50%', fontSize: 14, color: 'rgba(240,234,210,0.4)', border: '0.5px solid rgba(240,234,210,0.1)' }}
            >
              ✕
            </button>

            {/* Logo */}
            <div className="relative mb-6" style={{ width: 220, height: 220, animation: 'logoPulse 2s ease-in-out infinite' }}>
              <Image
                src="/images/noBack.png"
                alt="La Catena"
                fill
                className="object-contain"
                style={{ filter: 'drop-shadow(0 0 18px rgba(232,185,106,0.35)) brightness(1.05)' }}
              />
            </div>

            {/* Séparateur doré */}
            <div className="flex items-center gap-3 w-full mb-6" style={{ maxWidth: 240 }}>
              <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(to right, transparent, rgba(232,185,106,0.4))' }} />
              <span style={{ fontSize: 8, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(232,185,106,0.5)' }}>exclusive</span>
              <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(to left, transparent, rgba(232,185,106,0.4))' }} />
            </div>

            <p className="font-serif mb-3" style={{ fontSize: 26, color: 'var(--cream)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              Connexion requise
            </p>
            <p style={{ fontSize: 13, color: 'rgba(240,234,210,0.55)', lineHeight: 1.75, marginBottom: 36, maxWidth: 300 }}>
              Accédez à votre espace membre pour finaliser votre commande en toute sécurité.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => router.push('/connexion')}
                className="uppercase font-medium tracking-widest transition-all duration-200 hover:bg-[#f5cb85] hover:shadow-lg w-full"
                style={{
                  background: 'var(--gold)',
                  color: '#1c1f0e',
                  padding: '15px',
                  borderRadius: 3,
                  fontSize: 10,
                  letterSpacing: '2.5px',
                  boxShadow: '0 4px 20px rgba(232,185,106,0.25)',
                }}
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/inscription')}
                className="uppercase tracking-widest transition-all duration-200 w-full"
                style={{
                  border: '0.5px solid rgba(232,185,106,0.25)',
                  color: 'var(--gold)',
                  padding: '14px',
                  borderRadius: 3,
                  fontSize: 10,
                  letterSpacing: '2.5px',
                  background: 'rgba(232,185,106,0.04)',
                }}
              >
                Créer un compte
              </button>
              <button
                onClick={() => setShowAuthPopup(false)}
                className="uppercase tracking-widest transition-colors duration-200 hover:text-[var(--cream)] w-full"
                style={{ color: 'rgba(240,234,210,0.3)', fontSize: 9, letterSpacing: '2px', marginTop: 4 }}
              >
                Continuer sans compte
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes logoPulse {
          0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 10px rgba(232,185,106,0.25)) brightness(1); }
          50%       { opacity: 1;   filter: drop-shadow(0 0 30px rgba(232,185,106,0.65)) brightness(1.2); }
        }
      `}</style>
    </>
  );
}
