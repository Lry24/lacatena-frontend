'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm, { ProductFormData, defaultProductForm } from '@/components/admin/ProductForm';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

export default function NouveauProduitPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [form, setForm] = useState<ProductFormData>(defaultProductForm());
  const [categories, setCategories] = useState<{ uuid: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price_ttc) { showToast('Nom et prix TTC sont requis.', 'warning'); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        brand: form.brand,
        supplier: form.supplier,
        origin: form.origin,
        gender: form.gender,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        price_ttc: parseFloat(form.price_ttc),
        tva_rate: parseFloat(form.tva_rate) || 18,
        purchase_price_ht: form.purchase_price_ht ? parseFloat(form.purchase_price_ht) : undefined,
        is_promo: form.is_promo,
        promo_price: form.promo_price ? parseFloat(form.promo_price) : undefined,
        promo_start: form.promo_start || undefined,
        promo_end: form.promo_end || undefined,
        category_uuid: form.category_uuid || undefined,
        is_active: form.is_active,
        is_new: form.is_new,
        is_featured: form.is_featured,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        material: form.material || undefined,
      };
      const product = await adminApi.createProduct(payload);
      showToast('Produit créé avec succès.', 'success');
      setTimeout(() => router.push(`/admin/produits/${product.uuid}`), 800);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      showToast(e?.response?.data?.detail || 'Erreur lors de la création.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => router.push('/admin/produits')}
            style={{ background: 'none', border: '1px solid rgba(240,234,210,0.1)', borderRadius: 6, padding: '6px 12px', color: 'rgba(240,234,210,0.5)', cursor: 'pointer', fontSize: 12 }}>
            ← Retour
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0ead2', margin: 0 }}>Nouveau produit</h1>
        </div>
        <button type="submit" disabled={saving}
          style={{ padding: '10px 24px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1a1f0e', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {saving ? 'Création…' : 'Créer le produit'}
        </button>
      </div>

      <ProductForm form={form} setForm={setForm} categories={categories} />
    </form>
  );
}
