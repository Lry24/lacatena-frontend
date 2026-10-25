'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { A, AInput, ASelect, Alert, Badge, Btn, Card, PageTitle, Pager, Spin, Table, td, useFetch } from '@/components/admin/kit';
import ProductImg from '@/components/shop/ProductImg';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { fcfa } from '@/lib/format';
import type { Category, Page, ProductAdminRow } from '@/lib/types';

function Products() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const page = Number(params.get('page')) || 1;
  const stock = params.get('stock') || '';
  const categoryId = params.get('categorie') || '';
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 300); return () => clearTimeout(t); }, [q]);
  const { data, error, reload } = useFetch<Page<ProductAdminRow>>('/api/v1/admin/products', { q: debounced, stock, category_id: categoryId, page, size: 25 });
  const { data: cats } = useFetch<Category[]>('/api/v1/admin/categories');

  const go = (next: Record<string, string | number>) => {
    const s = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) { if (v) s.set(k, String(v)); else s.delete(k); }
    if (!('page' in next)) s.delete('page');
    router.push(`/admin/produits?${s.toString()}`);
  };

  const toggle = async (p: ProductAdminRow) => {
    try {
      await api(`/api/v1/admin/products/${p.id}/active`, { method: 'PATCH', body: { active: !p.active } });
      toast(p.active ? `${p.name} retirée de la boutique` : `${p.name} remise en vente`);
      reload();
    } catch (e) { toast((e as Error).message, 'error'); }
  };

  const options = (cats || []).flatMap((c) => [{ id: c.id, label: c.name }, ...c.children.map((ch) => ({ id: ch.id, label: `— ${ch.name}` }))]);

  return (
    <>
      <PageTitle title="Produits" subtitle={data ? `${data.total} pièce${data.total > 1 ? 's' : ''} au catalogue` : undefined} actions={<Btn href="/admin/produits/nouveau">+ Nouvelle pièce</Btn>} />
      <Card pad={12}>
        <div className="flex flex-wrap gap-2 mb-3">
          <AInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, marque, référence…" style={{ maxWidth: 300 }} aria-label="Rechercher" />
          <ASelect value={categoryId} onChange={(e) => go({ categorie: e.target.value })} style={{ maxWidth: 220 }} aria-label="Catégorie">
            <option value="">Toutes les catégories</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </ASelect>
          <ASelect value={stock} onChange={(e) => go({ stock: e.target.value })} style={{ maxWidth: 200 }} aria-label="Stock">
            <option value="">Tous les stocks</option>
            <option value="low">Stock bas (1 à 5)</option>
            <option value="out">Épuisées</option>
          </ASelect>
        </div>
        {error && <Alert>{error}</Alert>}
        {!data ? <Spin /> : (
          <>
            <Table head={['', 'Pièce', 'Catégorie', 'Prix', 'Stock', 'Statut', '']} empty={!data.items.length && 'Aucune pièce ne correspond.'}>
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03]">
                  <td style={{ ...td, width: 56 }}>
                    <div className="relative overflow-hidden" style={{ width: 40, height: 52, borderRadius: 4, background: A.bg }}><ProductImg src={p.image} alt="" sizes="40px" /></div>
                  </td>
                  <td style={td}>
                    <Link href={`/admin/produits/${p.id}`} className="hover:text-[#E8B96A]" style={{ fontWeight: 500 }}>{p.name}</Link>
                    <div style={{ fontSize: 11, color: A.faint }}>{[p.brand, p.sku].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td style={{ ...td, color: A.muted }}>{p.category_name || '—'}</td>
                  <td style={td}>{fcfa(p.price)}{p.compare_at_price && p.compare_at_price > p.price ? <div style={{ fontSize: 11, color: A.faint, textDecoration: 'line-through' }}>{fcfa(p.compare_at_price)}</div> : null}</td>
                  <td style={td}><span style={{ color: p.stock === 0 ? A.red : p.stock <= 5 ? A.gold : A.text }}>{p.stock}</span> <span style={{ fontSize: 11, color: A.faint }}>· {p.variant_count} taille{p.variant_count > 1 ? 's' : ''}</span></td>
                  <td style={td}>
                    <div className="flex gap-1 flex-wrap">
                      <Badge tone={p.active ? 'green' : 'red'}>{p.active ? 'En vente' : 'Masquée'}</Badge>
                      {p.featured && <Badge tone="gold">Mise en avant</Badge>}
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Btn small variant="ghost" onClick={() => toggle(p)}>{p.active ? 'Masquer' : 'Remettre en vente'}</Btn>{' '}
                    <Btn small variant="subtle" href={`/admin/produits/${p.id}`}>Modifier</Btn>
                  </td>
                </tr>
              ))}
            </Table>
            <Pager page={data.page} pages={data.pages} total={data.total} onPage={(n) => go({ page: n })} />
          </>
        )}
      </Card>
    </>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<Spin />}><Products /></Suspense>;
}
