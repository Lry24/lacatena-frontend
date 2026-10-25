'use client';
import Link from 'next/link';
import { useState } from 'react';
import { A, Alert, Badge, Card, PageTitle, Pager, Spin, Stat, Table, td, useFetch } from '@/components/admin/kit';
import { PAYMENT_METHOD, PAYMENT_STATUS, fcfa, formatDate } from '@/lib/format';
import type { Page } from '@/lib/types';

interface PaymentRow { id: number; order_id: number; order_number: string; customer_name: string; method: string; amount: number; amount_received: number; status: string; reference: string | null; created_at: string; updated_at: string }

export default function PaymentsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, error } = useFetch<Page<PaymentRow>>('/api/v1/admin/payments', { status, page, size: 25 });
  const { data: summary } = useFetch<Record<string, { count: number; amount: number }>>('/api/v1/admin/payments/summary');

  return (
    <>
      <PageTitle title="Paiements" subtitle="Espèces à la livraison et Mobile Money : ce qui est encaissé et ce qui reste à percevoir." />
      {summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <Stat label="Encaissé" value={fcfa(summary.PAID.amount)} hint={`${summary.PAID.count} commande${summary.PAID.count > 1 ? 's' : ''} payée${summary.PAID.count > 1 ? 's' : ''}`} tone="gold" />
          <Stat label="À encaisser" value={fcfa(summary.PENDING.amount + summary.PARTIALLY_PAID.amount)} hint={`${summary.PENDING.count + summary.PARTIALLY_PAID.count} en attente`} />
          <Stat label="Annulés" value={summary.CANCELLED.count} hint={fcfa(summary.CANCELLED.amount)} />
          <Stat label="Remboursés" value={summary.REFUNDED.count} hint={fcfa(summary.REFUNDED.amount)} />
        </div>
      )}
      <Card pad={12}>
        <div className="flex gap-2 flex-wrap mb-3">
          {['', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED'].map((s) => (
            <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }}
              style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, border: `1px solid ${s === status ? A.gold : A.border}`, background: s === status ? A.goldBg : 'transparent', color: s === status ? A.gold : A.muted }}>
              {s ? PAYMENT_STATUS[s].label : 'Tous'}
            </button>
          ))}
        </div>
        {error && <Alert>{error}</Alert>}
        {!data ? <Spin /> : (
          <>
            <Table head={['Commande', 'Client', 'Mode', 'Montant', 'Reçu', 'Statut', 'Référence', 'Mis à jour']} empty={!data.items.length && 'Aucun paiement.'}>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td style={td}><Link href={`/admin/commandes/${p.order_id}`} style={{ color: A.gold }}>{p.order_number}</Link></td>
                  <td style={td}>{p.customer_name}</td>
                  <td style={{ ...td, color: A.muted }}>{PAYMENT_METHOD[p.method]?.split(' (')[0]}</td>
                  <td style={td}>{fcfa(p.amount)}</td>
                  <td style={{ ...td, color: p.amount_received ? A.green : A.faint }}>{fcfa(p.amount_received)}</td>
                  <td style={td}><Badge tone={PAYMENT_STATUS[p.status]?.tone}>{PAYMENT_STATUS[p.status]?.label}</Badge></td>
                  <td style={{ ...td, color: A.muted, fontSize: 12 }}>{p.reference || '—'}</td>
                  <td style={{ ...td, color: A.muted, whiteSpace: 'nowrap' }}>{formatDate(p.updated_at, true)}</td>
                </tr>
              ))}
            </Table>
            <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  );
}
