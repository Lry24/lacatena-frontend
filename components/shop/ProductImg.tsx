import Image from 'next/image';
import { imageUrl } from '@/lib/api';

/** Image produit : locale (/images), Unsplash ou envoyée depuis l'admin (servie par l'API, non optimisée). */
export default function ProductImg({ src, alt, sizes, className = 'object-cover object-top', priority }: {
  src: string | null | undefined; alt: string; sizes: string; className?: string; priority?: boolean;
}) {
  const url = imageUrl(src);
  return <Image src={url} alt={alt} fill sizes={sizes} className={className} priority={priority} unoptimized={url.includes('/api/v1/media/')} />;
}
