import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Boutique — La Catena | Mode Multibrand',
  description:
    'Découvrez toute la sélection La Catena : vêtements femme, homme, enfant, accessoires, nouveautés et promotions. Livraison rapide au Togo.',
  openGraph: {
    title: 'Boutique — La Catena',
    description: 'Pièces sélectionnées, marques choisies. Mode multibrand au Togo.',
    url: 'https://lacatena.tg/boutique',
    siteName: 'La Catena',
    locale: 'fr_TG',
    type: 'website',
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
