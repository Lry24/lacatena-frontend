import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Boutique — La Catena',
  description: 'Découvrez notre sélection de pièces et marques choisies.',
};

export default function BoutiqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
