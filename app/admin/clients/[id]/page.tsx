'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { A, Alert, Badge, Btn, Card, PageTitle, Spin, Stat, Table, td, useFetch } from '@/components/admin/kit';
import { ORDER_STATUS, fcfa, formatDate } from '@/lib/format';
import type { OrderRow } from '@/lib/types';
import type { CustomerRow } from '../page';

export default function CustomerPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error } = useFetch<{ customer: CustomerRow; orders: OrderRow[] }>(`/api/v1/admin/customers/${id}`);
  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spin />;
  const c = data.customer;
  return (
    <>
      <Link href="/admin/clients" style={{ fontSize: 12, color: A.muted }}>← Clients</Link>
      <div className="mt-3">
        <PageTitle title={`${c.first_name} ${c.last_name}`} subtitle={`Cliente depuis le ${formatDate(c.created_at)}`}
          actions={<><Btn variant="subtle" href={`tel:${c.phone}`}>Appeler</Btn>{c.email && <Btn variant="ghost" href={`mailto:${c.email}`}>E-mail</Btn>}</>} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Stat label="Téléphone" value={<span style={{ fontSize: 18 }}>{c.phone}</span>} hint={c.email || undefined} />
        <Stat label="Commandes" value={c.order_count} />
        <Stat label="Total dépensé" value={fcfa(c.total_spent)} tone="gold" />
        <Stat label="Panier moyen" value={fcfa(c.order_count ? Math.round(c.total_spent / c.order_count) : 0)} />
      </div>
      <Card title="Historique des commandes" pad={12}>
        <Table head={['Commande', 'Date', 'Articles', 'Total', 'Statut']} empty={!data.orders.length && 'Aucune commande.'}>
          {data.orders.map((o) => (
            <tr key={o.id}>
              <td style={td}><Link href={`/admin/commandes/${o.id}`} style={{ color: A.gold }}>{o.number}</Link></td>
              <td style={{ ...td, color: A.muted }}>{formatDate(o.created_at, true)}</td>
              <td style={td}>{o.item_count}</td>
              <td style={td}>{fcfa(o.total)}</td>
              <td style={td}><Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
