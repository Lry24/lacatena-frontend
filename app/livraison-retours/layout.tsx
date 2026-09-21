import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Livraison & Retours — La Catena',
  description:
    'Délais et tarifs de livraison au Togo et en Afrique de l\'Ouest. Politique de retours et échanges sous 14 jours, sans frais.',
  openGraph: {
    title: 'Livraison & Retours — La Catena',
    description: 'Livraison rapide au Togo. Retours acceptés sous 14 jours.',
    url: 'https://lacatena.tg/livraison-retours',
    siteName: 'La Catena',
    locale: 'fr_TG',
    type: 'website',
  },
};

export default function LivraisonRetoursLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
