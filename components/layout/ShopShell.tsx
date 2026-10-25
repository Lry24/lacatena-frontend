import type { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';
import { Toaster } from '@/components/ui';

/** Gabarit des pages boutique : en-tête fixe, contenu aéré, pied de page. */
export default function ShopShell({ children, transparent = false, narrow = false }: { children: ReactNode; transparent?: boolean; narrow?: boolean }) {
  return (
    <>
      <Header transparent={transparent} />
      <main className="flex-1">
        {transparent ? children : (
          <div className="px-4 md:px-10" style={{ paddingTop: 148, paddingBottom: 80, maxWidth: narrow ? 1100 : 1440, margin: '0 auto' }}>
            {children}
          </div>
        )}
      </main>
      <Footer />
      <Toaster />
    </>
  );
}
