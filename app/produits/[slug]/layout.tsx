import type { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, {
      next: { revalidate: 3600 }, // revalidation ISR toutes les heures
    });

    if (!res.ok) throw new Error('Not found');

    const product = await res.json();

    const title = `${product.name} — La Catena`;
    const description =
      product.description
        ? product.description.slice(0, 155)
        : `Découvrez ${product.name} par ${product.brand} sur La Catena. Livraison rapide au Togo.`;
    const image = product.primary_image_url || '/images/noBack.png';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://lacatena.tg/produits/${slug}`,
        siteName: 'La Catena',
        images: [{ url: image, width: 800, height: 1000, alt: product.name }],
        locale: 'fr_TG',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: 'Produit — La Catena',
      description: 'Découvrez notre sélection de pièces sur La Catena, boutique multibrand au Togo.',
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
