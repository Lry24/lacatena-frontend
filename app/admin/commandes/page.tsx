'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { A, AInput, Alert, Badge, Card, PageTitle, Pager, Spin, Table, td, useFetch } from '@/components/admin/kit';
import { ORDER_STATUS, PAYMENT_STATUS, fcfa, formatDate } from '@/lib/format';
import type { OrderRow, Page } from '@/lib/types';

const TABS = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function Orders() {
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get('statut') || '';
  const page = Number(params.get('page')) || 1;
  const [q, setQ] = useState(params.get('q') || '');
  const [debounced, setDebounced] = useState(q);
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 300); return () => clearTimeout(t); }, [q]);

  const { data, error } = useFetch<Page<OrderRow>>('/api/v1/admin/orders', { status, q: debounced, page, size: 20 });
  const { data: counts } = useFetch<Record<string, number>>('/api/v1/admin/orders/counts');

  const go = (next: Record<string, string | number>) => {
    const s = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) { if (v) s.set(k, String(v)); else s.delete(k); }
    router.push(`/admin/commandes?${s.toString()}`);
  };

  return (
    <>
      <PageTitle title="Commandes" subtitle="Confirmez par téléphone, préparez, remettez : chaque étape est visible par la cliente dans son suivi." />
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((t) => {
          const on = t === status;
          const n = t ? counts?.[t] : counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined;
          return (
            <button key={t || 'all'} onClick={() => go({ statut: t, page: '' })}
              style={{ fontSize: 12, padding: '7px 12px', borderRadius: 20, border: `1px solid ${on ? A.gold : A.border}`, background: on ? A.goldBg : 'transparent', color: on ? A.gold : A.muted }}>
              {t ? ORDER_STATUS[t].label : 'Toutes'}{n != null ? ` · ${n}` : ''}
            </button>
          );
        })}
      </div>
      <Card pad={12}>
        <div className="mb-3" style={{ maxWidth: 380 }}>
          <AInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher : n° de commande, nom, téléphone, ville…" aria-label="Rechercher une commande" />
        </div>
        {error && <Alert>{error}</Alert>}
        {!data ? <Spin /> : (
          <>
            <Table head={['Commande', 'Client', 'Téléphone', 'Articles', 'Total', 'Paiement', 'Statut', 'Date']} empty={!data.items.length && 'Aucune commande ne correspond.'}>
              {data.items.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.03] cursor-pointer" onClick={() => router.push(`/admin/commandes/${o.id}`)}>
                  <td style={td}><Link href={`/admin/commandes/${o.id}`} style={{ color: A.gold, fontWeight: 500 }} onClick={(e) => e.stopPropagation()}>{o.number}</Link></td>
                  <td style={td}>{o.customer_name}<div style={{ fontSize: 11, color: A.faint }}>{o.city}</div></td>
                  <td style={{ ...td, color: A.muted }}>{o.customer_phone}</td>
                  <td style={{ ...td, color: A.muted }}>{o.item_count}</td>
                  <td style={td}>{fcfa(o.total)}</td>
                  <td style={td}><Badge tone={PAYMENT_STATUS[o.payment_status]?.tone}>{PAYMENT_STATUS[o.payment_status]?.label}</Badge></td>
                  <td style={td}><Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge></td>
                  <td style={{ ...td, color: A.muted, whiteSpace: 'nowrap' }}>{formatDate(o.created_at, true)}</td>
                </tr>
              ))}
            </Table>
            <Pager page={data.page} pages={data.pages} total={data.total} onPage={(p) => go({ page: p })} />
          </>
        )}
      </Card>
    </>
  );
}

export default function OrdersPage() {
  return <Suspense fallback={<Spin />}><Orders /></Suspense>;
}
