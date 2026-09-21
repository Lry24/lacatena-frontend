import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — La Catena',
  description:
    "Contactez l'équipe La Catena pour toute question sur vos commandes, nos produits ou un partenariat. Réponse garantie en moins de 24h.",
  openGraph: {
    title: 'Contact — La Catena',
    description: 'Notre équipe vous répond du lundi au samedi, de 9h à 18h.',
    url: 'https://lacatena.tg/contact',
    siteName: 'La Catena',
    locale: 'fr_TG',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
