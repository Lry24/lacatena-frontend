import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes favoris — La Catena',
  description: 'Retrouvez toutes les pièces que vous avez enregistrées dans vos favoris sur La Catena.',
  robots: { index: false, follow: false },
};

export default function FavorisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
