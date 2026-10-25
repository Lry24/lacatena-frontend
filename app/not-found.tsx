import ShopShell from '@/components/layout/ShopShell';
import { Button, EmptyState } from '@/components/ui';

export default function NotFound() {
  return (
    <ShopShell narrow>
      <EmptyState title="Cette page s'est égarée" text="Le lien est peut-être ancien. Nos collections, elles, vous attendent."
        action={<Button href="/boutique">Retour à la boutique</Button>} />
    </ShopShell>
  );
}
