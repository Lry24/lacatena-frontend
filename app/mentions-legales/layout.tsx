import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — La Catena',
  description: 'Informations légales, éditeur du site, hébergement et protection des données personnelles de La Catena Multibrand.',
  robots: { index: true, follow: false },
};

export default function MentionsLegalesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
