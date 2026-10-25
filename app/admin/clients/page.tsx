'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { A, AInput, Alert, Card, PageTitle, Pager, Spin, Table, td, useFetch } from '@/components/admin/kit';
import { fcfa, formatDate } from '@/lib/format';
import type { Page } from '@/lib/types';

export interface CustomerRow { id: number; first_name: string; last_name: string; phone: string; email: string | null; created_at: string; order_count: number; total_spent: number; last_order_at: string | null }

export default function CustomersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => { setDebounced(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const { data, error } = useFetch<Page<CustomerRow>>('/api/v1/admin/customers', { q: debounced, page, size: 25 });

  return (
    <>
      <PageTitle title="Clients" subtitle="Chaque cliente est retrouvée par son numéro de téléphone, sans compte à créer." />
      <Card pad={12}>
        <div className="mb-3" style={{ maxWidth: 340 }}><AInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, téléphone, e-mail…" aria-label="Rechercher un client" /></div>
        {error && <Alert>{error}</Alert>}
        {!data ? <Spin /> : (
          <>
            <Table head={['Client', 'Téléphone', 'E-mail', 'Commandes', 'Total dépensé', 'Dernière commande']} empty={!data.items.length && 'Aucun client.'}>
              {data.items.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03] cursor-pointer" onClick={() => router.push(`/admin/clients/${c.id}`)}>
                  <td style={td}><Link href={`/admin/clients/${c.id}`} style={{ color: A.gold }} onClick={(e) => e.stopPropagation()}>{c.first_name} {c.last_name}</Link></td>
                  <td style={{ ...td, color: A.muted }}>{c.phone}</td>
                  <td style={{ ...td, color: A.muted }}>{c.email || '—'}</td>
                  <td style={td}>{c.order_count}</td>
                  <td style={td}>{fcfa(c.total_spent)}</td>
                  <td style={{ ...td, color: A.muted }}>{c.last_order_at ? formatDate(c.last_order_at) : '—'}</td>
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
