import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer un compte — La Catena',
  description: 'Rejoignez la communauté La Catena. Créez votre compte pour profiter d\'offres exclusives et suivre vos commandes.',
  robots: { index: false, follow: false },
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
