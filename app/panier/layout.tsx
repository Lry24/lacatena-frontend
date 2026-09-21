import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mon panier — La Catena',
  description: 'Votre panier d\'achats La Catena. Vérifiez vos articles et finalisez votre commande.',
  robots: { index: false, follow: false },
};

export default function PanierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
