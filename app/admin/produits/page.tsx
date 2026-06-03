'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface Product {
  uuid: string;
  name: string;
  reference: string;
  brand: string;
  price_ttc: number;
  is_active: boolean;
  is_new: boolean;
  is_promo: boolean;
  is_featured: boolean;
  gender: string;
  primary_image_url?: string;
  category?: { name: string };
  total_stock?: number;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

export default function ProduitsPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [isNew, setIsNew] = useState('');
  const [isPromo, setIsPromo] = useState('');
  const [isFeatured, setIsFeatured] = useState('');
  const [categories, setCategories] = useState<{ uuid: string; name: string }[]>([]);
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    adminApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, size: 20, active_only: false };
    if (search) params.q = search;
    if (gender) params.gender = gender;
    if (isNew) params.is_new = isNew === 'true';
    if (isPromo) params.is_promo = isPromo === 'true';
    if (isFeatured) params.is_featured = isFeatured === 'true';
    if (catFilter) params.category_slug = catFilter;
    adminApi.listProducts(params)
      .then((r) => { setProducts(r.items ?? r); setTotal(r.total ?? r.length); })
      .catch(() => showToast('Erreur chargement produits.', 'error'))
      .finally(() => setLoading(false));
  }, [page, search, gender, isNew, isPromo, isFeatured, catFilter]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminApi.toggleProduct(uuid);
      setProducts((prev) => prev.map((p) => p.uuid === uuid ? { ...p, is_active: !p.is_active } : p));
    } catch {
      showToast('Erreur toggle produit.', 'error');
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'image', label: '', width: 48,
      render: (r) => r.primary_image_url
        ? <img src={r.primary_image_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
        : <div style={{ width: 36, height: 36, background: 'rgba(240,234,210,0.06)', borderRadius: 4 }} />,
    },
    { key: 'name', label: 'Nom', render: (r) => <span style={{ fontWeight: 500, color: '#f0ead2' }}>{r.name}</span> },
    { key: 'reference', label: 'Réf.', render: (r) => <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(240,234,210,0.5)' }}>{r.reference}</span> },
    { key: 'brand', label: 'Marque', render: (r) => <span style={{ color: 'rgba(240,234,210,0.6)' }}>{r.brand}</span> },
    { key: 'category', label: 'Catégorie', render: (r) => <span style={{ color: 'rgba(240,234,210,0.5)' }}>{(r.category as { name: string } | undefined)?.name ?? '—'}</span> },
    { key: 'price_ttc', label: 'Prix TTC', render: (r) => <span style={{ color: '#E8B96A', fontWeight: 500 }}>{fmt(r.price_ttc)}</span> },
    { key: 'total_stock', label: 'Stock', render: (r) => <span style={{ color: (r.total_stock ?? 0) <= 0 ? '#c9634a' : '#6faa30', fontWeight: 500 }}>{r.total_stock ?? 0}</span> },
    {
      key: 'badges', label: 'Badges',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {r.is_new && <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(74,143,201,0.15)', color: '#4a8fc9', borderRadius: 4 }}>Nouveau</span>}
          {r.is_promo && <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(201,99,74,0.15)', color: '#c9634a', borderRadius: 4 }}>Promo</span>}
          {r.is_featured && <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(232,185,106,0.15)', color: '#E8B96A', borderRadius: 4 }}>Vedette</span>}
        </div>
      ),
    },
    {
      key: 'is_active', label: 'Statut',
      render: (r) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/produits/${r.uuid}`); }}
            style={{ padding: '5px 10px', background: 'rgba(232,185,106,0.1)', border: '1px solid rgba(232,185,106,0.2)', borderRadius: 6, color: '#E8B96A', cursor: 'pointer', fontSize: 11 }}>
            Éditer
          </button>
          <button
            onClick={(e) => handleToggle(r.uuid, e)}
            style={{ padding: '5px 10px', background: r.is_active ? 'rgba(201,99,74,0.1)' : 'rgba(111,170,48,0.1)', border: `1px solid ${r.is_active ? 'rgba(201,99,74,0.2)' : 'rgba(111,170,48,0.2)'}`, borderRadius: 6, color: r.is_active ? '#c9634a' : '#6faa30', cursor: 'pointer', fontSize: 11 }}>
            {r.is_active ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      ),
    },
  ];

  const pages = Math.ceil(total / 20);

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0ead2', margin: 0 }}>Produits</h1>
        <button
          onClick={() => router.push('/admin/produits/nouveau')}
          style={{ padding: '9px 18px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1a1f0e', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          + Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(q); setPage(1); } }}
          placeholder="Rechercher…"
          style={{ padding: '8px 12px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none', width: 200 }}
        />
        <select value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none' }}>
          <option value="">Genre</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
          <option value="unisex">Unisexe</option>
        </select>
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none' }}>
          <option value="">Catégorie</option>
          {categories.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
        </select>
        {[{ label: 'Nouveau', val: isNew, set: setIsNew }, { label: 'Promo', val: isPromo, set: setIsPromo }, { label: 'Vedette', val: isFeatured, set: setIsFeatured }].map(({ label, val, set }) => (
          <select key={label} value={val} onChange={(e) => { set(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none' }}>
            <option value="">{label}</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        ))}
      </div>

      <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, overflow: 'hidden' }}>
        <AdminTable
          columns={columns}
          data={products}
          loading={loading}
          onRowClick={(r) => router.push(`/admin/produits/${r.uuid}`)}
          emptyMessage="Aucun produit trouvé."
        />
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '7px 14px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 6, color: '#f0ead2', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, fontSize: 13 }}>
            ← Précédent
          </button>
          <span style={{ padding: '7px 14px', color: 'rgba(240,234,210,0.5)', fontSize: 13 }}>Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '7px 14px', background: '#1e2411', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 6, color: '#f0ead2', cursor: page === pages ? 'not-allowed' : 'pointer', opacity: page === pages ? 0.4 : 1, fontSize: 13 }}>
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
