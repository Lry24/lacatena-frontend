'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import { Button, EmptyState, Loading, PageHeading, label, useMounted } from '@/components/ui';
import { api } from '@/lib/api';
import { ORDER_STATUS, fcfa, formatDate } from '@/lib/format';
import type { TrackedOrder } from '@/lib/types';
import { useOrders } from '@/store/orders';

/** Sans compte client : les commandes passées depuis cet appareil, avec leur statut à jour. */
export default function MyOrdersPage() {
  const mounted = useMounted();
  const { orders, forget } = useOrders();
  const [status, setStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!mounted) return;
    orders.forEach((o) => {
      api<TrackedOrder>(`/api/v1/orders/${o.number}/track`, { query: { phone: o.phone } })
        .then((t) => setStatus((s) => ({ ...s, [o.number]: t.status })))
        .catch(() => setStatus((s) => ({ ...s, [o.number]: 'UNKNOWN' })));
    });
  }, [mounted, orders]);

  if (!mounted) return <ShopShell><Loading /></ShopShell>;

  return (
    <ShopShell narrow>
      <PageHeading eyebrow="Historique" title="Mes commandes">
        Les commandes passées depuis cet appareil. Sur un autre téléphone, utilisez le <Link href="/suivi" style={{ color: 'var(--gold)' }}>suivi par numéro</Link>.
      </PageHeading>
      {orders.length === 0 ? (
        <EmptyState title="Aucune commande pour l'instant" text="Vos prochaines commandes apparaîtront ici pour un suivi en un geste."
          action={<Button href="/boutique">Découvrir la boutique</Button>} />
      ) : (
        <ul className="flex flex-col" style={{ borderTop: '0.5px solid var(--border)' }}>
          {orders.map((o) => {
            const st = status[o.number];
            const info = st ? ORDER_STATUS[st] : null;
            return (
              <li key={o.number} className="flex flex-wrap items-center gap-4 justify-between py-6" style={{ borderBottom: '0.5px solid var(--border)' }}>
                <div>
                  <p className="font-serif" style={{ fontSize: 22, color: 'var(--gold)' }}>{o.number}</p>
                  <p style={{ fontSize: 12, color: 'var(--cream-muted)', marginTop: 4 }}>{formatDate(o.createdAt, true)} · {fcfa(o.total)}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span style={{ ...label, color: info ? (info.tone === 'red' ? '#E8A08A' : 'var(--gold)') : 'var(--cream-muted)' }}>
                    {!st ? '…' : info ? info.label : 'Introuvable'}
                  </span>
                  <Button variant="outline" href={`/suivi?commande=${encodeURIComponent(o.number)}&tel=${encodeURIComponent(o.phone)}`} style={{ padding: '11px 20px' }}>Suivre</Button>
                  <button onClick={() => forget(o.number)} aria-label={`Oublier ${o.number}`} title="Retirer de cet appareil" style={{ color: 'var(--cream-muted)', fontSize: 14 }}>✕</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ShopShell>
  );
}
