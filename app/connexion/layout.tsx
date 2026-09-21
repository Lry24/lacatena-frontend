import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — La Catena',
  description: 'Connectez-vous à votre espace membre La Catena pour accéder à vos commandes et favoris.',
  robots: { index: false, follow: false },
};

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
