'use client';
import ShopShell from '@/components/layout/ShopShell';
import ProductCard from '@/components/shop/ProductCard';
import { Button, EmptyState, Loading, PageHeading, useMounted } from '@/components/ui';
import { useWishlist } from '@/store/wishlist';

export default function WishlistPage() {
  const mounted = useMounted();
  const items = useWishlist((s) => s.items);
  if (!mounted) return <ShopShell><Loading /></ShopShell>;
  return (
    <ShopShell>
      <PageHeading eyebrow="Vos coups de cœur" title="Favoris">
        {items.length ? `${items.length} pièce${items.length > 1 ? 's' : ''} gardée${items.length > 1 ? 's' : ''} pour plus tard.` : null}
      </PageHeading>
      {items.length === 0 ? (
        <EmptyState title="Aucun favori pour l'instant" text="Touchez le ♡ sur une pièce pour la retrouver ici."
          action={<Button href="/boutique">Explorer la boutique</Button>} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </ShopShell>
  );
}
