import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produits — La Catena',
  description: 'Explorez toute la collection La Catena : vêtements, accessoires et pièces sélectionnées pour la mode africaine contemporaine.',
  openGraph: {
    title: 'Produits — La Catena',
    description: 'Mode multibrand au Togo. Pièces sélectionnées, marques choisies.',
    url: 'https://lacatena.tg/produits',
    siteName: 'La Catena',
    locale: 'fr_TG',
    type: 'website',
  },
};

export default function ProduitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
