'use client';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductCard from '@/components/common/ProductCard';
import { useWishlistStore } from '@/store/wishlistStore';

export default function FavorisPage() {
  const { items } = useWishlistStore();

  return (
    <>
      <Header />
      <main style={{ paddingTop: 190 }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 1440, margin: '0 auto' }}>
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Favoris' }]} />
          <h1 className="font-serif mt-4 mb-2" style={{ fontSize: 40, color: 'var(--gold)' }}>Mes favoris</h1>
          <p style={{ color: 'var(--cream-muted)', fontSize: 13, marginBottom: 40 }}>
            {items.length} article{items.length !== 1 ? 's' : ''} enregistrÃ©{items.length !== 1 ? 's' : ''}
          </p>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 360, gap: 20 }}>
              <span style={{ fontSize: 56, color: 'rgba(232,185,106,0.2)', lineHeight: 1 }}>â™¡</span>
              <p className="font-serif text-2xl" style={{ color: 'var(--cream-muted)' }}>Aucun favori pour l&apos;instant</p>
              <p style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.7, maxWidth: 380 }}>
                Explorez notre boutique et ajoutez vos piÃ¨ces prÃ©fÃ©rÃ©es Ã  vos favoris pour les retrouver ici.
              </p>
              <Link
                href="/boutique"
                className="mt-2 uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                DÃ©couvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((p) => <ProductCard key={p.uuid} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

