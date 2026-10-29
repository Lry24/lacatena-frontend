'use client';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { imageUrl } from '@/lib/api';

/** Image produit : locale (/images), Unsplash ou envoyée depuis l'admin (servie par l'API, non optimisée). Apparaît en fondu. */
export default function ProductImg({ src, alt, sizes, className = 'object-cover object-top', priority }: {
  src: string | null | undefined; alt: string; sizes: string; className?: string; priority?: boolean;
}) {
  const url = imageUrl(src);
  const [loaded, setLoaded] = useState(false);
  // Une image déjà en cache peut finir de charger avant que React prenne la main : on vérifie à l'attache
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth) setLoaded(true);
  }, []);
  return (
    <Image ref={ref} src={url} alt={alt} fill sizes={sizes} priority={priority} onLoad={() => setLoaded(true)}
      className={`${className} img-fade ${loaded ? 'is-loaded' : ''}`} unoptimized={url.includes('/api/v1/media/')} />
  );
}
