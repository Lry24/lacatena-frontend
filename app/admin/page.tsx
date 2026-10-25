'use client';
import Link from 'next/link';
import { useState } from 'react';
import { A, Alert, Badge, Card, PageTitle, Spin, Stat, Table, td, useFetch } from '@/components/admin/kit';
import { ORDER_STATUS, fcfa, formatDate } from '@/lib/format';
import type { Dashboard, Sales } from '@/lib/types';

const compact = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace('.', ',')} M` : n >= 1000 ? `${Math.round(n / 1000)} k` : String(n);

function RevenueChart({ daily }: { daily: Sales['daily'] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...daily.map((d) => d.revenue), 1);
  const h = 180;
  const bw = 100 / daily.length;
  const point = hover != null ? daily[hover] : null;
  return (
    <div>
      <div style={{ height: 22, fontSize: 12, color: A.muted }}>
        {point ? <><span style={{ color: '#fff' }}>{formatDate(point.date)}</span> · {fcfa(point.revenue)} · {point.orders} commande{point.orders > 1 ? 's' : ''}</> : 'Survolez une barre pour le détail du jour'}
      </div>
      <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block' }} onMouseLeave={() => setHover(null)} role="img" aria-label="Chiffre d'affaires par jour">
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2="100" y1={h * f} y2={h * f} stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />)}
        {daily.map((d, i) => {
          const bh = Math.max((d.revenue / max) * (h - 8), d.revenue ? 2 : 0);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              <rect x={i * bw} y={0} width={bw} height={h} fill="transparent" />
              <rect x={i * bw + bw * 0.18} y={h - bh} width={bw * 0.64} height={bh} rx="0.4" fill={hover === i ? '#f5cb85' : A.gold} opacity={hover == null || hover === i ? 1 : 0.55} />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2" style={{ fontSize: 11, color: A.faint }}>
        <span>{formatDate(daily[0].date)}</span><span>max {compact(max)} FCFA / jour</span><span>{formatDate(daily[daily.length - 1].date)}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data, error } = useFetch<Dashboard>('/api/v1/admin/dashboard');
  const { data: sales } = useFetch<Sales>('/api/v1/admin/dashboard/sales', { days });

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spin />;

  const totalCat = sales ? Object.values(sales.by_category).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      <PageTitle title="Tableau de bord" subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat label="À confirmer" value={data.orders_pending} hint="Commandes en attente d'appel" tone={data.orders_pending ? 'gold' : undefined} href="/admin/commandes?statut=PENDING" />
        <Stat label="Aujourd'hui" value={fcfa(data.revenue_today)} hint={`${data.orders_today} commande${data.orders_today > 1 ? 's' : ''} reçue${data.orders_today > 1 ? 's' : ''}`} />
        <Stat label="Ce mois-ci" value={fcfa(data.revenue_month)} hint={`Panier moyen ${fcfa(data.average_basket)}`} />
        <Stat label="En cours" value={data.orders_in_progress} hint={`${data.orders_delivered} livrées au total`} href="/admin/commandes" />
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-4 mb-4">
        <Card title="Ventes" action={
          <div className="flex gap-1">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, color: days === d ? '#2D3A0F' : A.muted, background: days === d ? A.gold : 'transparent', border: `1px solid ${days === d ? A.gold : A.border}` }}>{d} j</button>
            ))}
          </div>
        }>
          {sales ? (
            <>
              <div className="flex gap-8 mb-4">
                <div><p style={{ fontSize: 11, color: A.faint, textTransform: 'uppercase', letterSpacing: '1px' }}>Chiffre d&apos;affaires</p><p className="font-serif" style={{ fontSize: 24, color: A.gold }}>{fcfa(sales.period_revenue)}</p></div>
                <div><p style={{ fontSize: 11, color: A.faint, textTransform: 'uppercase', letterSpacing: '1px' }}>Commandes</p><p className="font-serif" style={{ fontSize: 24, color: '#fff' }}>{sales.period_orders}</p></div>
              </div>
              <RevenueChart daily={sales.daily} />
            </>
          ) : <Spin />}
        </Card>

        <Card title="Par univers">
          {sales && totalCat > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(sales.by_category).map(([name, amount]) => (
                <div key={name}>
                  <div className="flex justify-between mb-1.5" style={{ fontSize: 13 }}><span>{name}</span><span style={{ color: A.muted }}>{Math.round((amount / totalCat) * 100)} %</span></div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}><div style={{ height: 6, borderRadius: 3, width: `${(amount / totalCat) * 100}%`, background: A.gold }} /></div>
                  <p style={{ fontSize: 11, color: A.faint, marginTop: 4 }}>{fcfa(amount)}</p>
                </div>
              ))}
            </div>
          ) : <p style={{ color: A.faint, fontSize: 13 }}>Pas encore de ventes sur la période.</p>}
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-4 mb-4">
        <Card title="Meilleures pièces">
          {sales?.top_products.length ? (
            <ol className="flex flex-col gap-3">
              {sales.top_products.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3" style={{ fontSize: 13 }}>
                  <span className="font-serif" style={{ color: A.gold, width: 18 }}>{i + 1}</span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span style={{ color: A.muted }}>{p.quantity} vendue{p.quantity > 1 ? 's' : ''}</span>
                </li>
              ))}
            </ol>
          ) : <p style={{ color: A.faint, fontSize: 13 }}>Aucune vente sur la période.</p>}
        </Card>

        <Card title="Statuts (période)">
          {sales && (
            <div className="flex flex-col gap-2">
              {Object.entries(sales.by_status).filter(([, n]) => n > 0).map(([s, n]) => (
                <Link key={s} href={`/admin/commandes?statut=${s}`} className="flex justify-between items-center hover:bg-white/5" style={{ padding: '6px 8px', borderRadius: 6 }}>
                  <Badge tone={ORDER_STATUS[s].tone}>{ORDER_STATUS[s].label}</Badge><span style={{ fontSize: 14 }}>{n}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="Alertes de stock" action={<Link href="/admin/produits?stock=out" style={{ fontSize: 12, color: A.gold }}>{data.products_out_of_stock} épuisée{data.products_out_of_stock > 1 ? 's' : ''} →</Link>}>
          {data.low_stock.length ? (
            <ul className="flex flex-col gap-2">
              {data.low_stock.map((l) => (
                <li key={`${l.product_id}-${l.label}`} className="flex justify-between gap-3" style={{ fontSize: 13 }}>
                  <Link href={`/admin/produits/${l.product_id}`} className="truncate hover:text-[#E8B96A]">{l.name} <span style={{ color: A.faint }}>· {l.label}</span></Link>
                  <span style={{ color: l.stock === 0 ? A.red : A.gold, whiteSpace: 'nowrap' }}>{l.stock === 0 ? 'Épuisé' : `${l.stock} restant${l.stock > 1 ? 's' : ''}`}</span>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: A.faint, fontSize: 13 }}>Tous les stocks sont confortables.</p>}
        </Card>
      </div>

      <Card title="Dernières commandes" action={<Link href="/admin/commandes" style={{ fontSize: 12, color: A.gold }}>Toutes les commandes →</Link>} pad={12}>
        <Table head={['Commande', 'Client', 'Ville', 'Total', 'Statut', 'Date']} empty={!data.recent_orders.length && 'Aucune commande pour le moment.'}>
          {data.recent_orders.map((o) => (
            <tr key={o.id} className="hover:bg-white/[0.03]">
              <td style={td}><Link href={`/admin/commandes/${o.id}`} style={{ color: A.gold }}>{o.number}</Link></td>
              <td style={td}>{o.customer_name}</td>
              <td style={{ ...td, color: A.muted }}>{o.city}</td>
              <td style={td}>{fcfa(o.total)}</td>
              <td style={td}><Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge></td>
              <td style={{ ...td, color: A.muted }}>{formatDate(o.created_at, true)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
