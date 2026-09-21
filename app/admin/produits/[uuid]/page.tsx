'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm, { ProductFormData, defaultProductForm } from '@/components/admin/ProductForm';
import Modal from '@/components/admin/Modal';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface Variant {
  uuid: string;
  sku: string;
  size: string;
  color: string;
  extra_price: number;
  stock: number;
  stock_alert: number;
  is_active: boolean;
}

interface ProductImage {
  uuid: string;
  url: string;
  is_primary: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none',
};

export default function EditProduitPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [form, setForm] = useState<ProductFormData>(defaultProductForm());
  const [categories, setCategories] = useState<{ uuid: string; name: string }[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Variant modal
  const [varModal, setVarModal] = useState(false);
  const [editVar, setEditVar] = useState<Variant | null>(null);
  const [varForm, setVarForm] = useState({ size: '', color: '', extra_price: '0', stock: '0', stock_alert: '5' });

  // Confirm delete
  const [deleteImgId, setDeleteImgId] = useState<string | null>(null);
  const [deleteVarId, setDeleteVarId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [product, cats] = await Promise.all([adminApi.getProductByUuid(uuid), adminApi.listCategories()]);
      setCategories(cats);
      setImages(product.images ?? []);
      setVariants(product.variants ?? []);
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        brand: product.brand ?? '',
        supplier: product.supplier ?? '',
        origin: product.origin ?? '',
        gender: product.gender ?? '',
        tags: (product.tags ?? []).join(', '),
        price_ttc: String(product.price_ttc ?? ''),
        tva_rate: String(product.tva_rate ?? '18'),
        purchase_price_ht: String(product.purchase_price_ht ?? ''),
        is_promo: product.is_promo ?? false,
        promo_price: String(product.promo_price ?? ''),
        promo_start: product.promo_start ? product.promo_start.slice(0, 10) : '',
        promo_end: product.promo_end ? product.promo_end.slice(0, 10) : '',
        category_uuid: product.category?.uuid ?? '',
        is_active: product.is_active ?? true,
        is_new: product.is_new ?? false,
        is_featured: product.is_featured ?? false,
        weight: String(product.weight ?? ''),
        material: product.material ?? '',
      });
    } catch {
      showToast('Erreur chargement produit.', 'error');
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
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
      await adminApi.updateProduct(uuid, payload);
      showToast('Produit mis à jour.', 'success');
    } catch {
      showToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const img = await adminApi.uploadProductImage(uuid, file);
      setImages((prev) => [...prev, img]);
      showToast('Image ajoutée.', 'success');
    } catch {
      showToast('Erreur upload image.', 'error');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImgId) return;
    try {
      await adminApi.deleteProductImage(uuid, deleteImgId);
      setImages((prev) => prev.filter((i) => i.uuid !== deleteImgId));
      showToast('Image supprimée.', 'success');
    } catch {
      showToast('Erreur suppression image.', 'error');
    } finally {
      setDeleteImgId(null);
    }
  };

  const handleSetPrimary = async (imgId: string) => {
    try {
      await adminApi.setPrimaryImage(uuid, imgId);
      setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.uuid === imgId })));
      showToast('Image principale définie.', 'success');
    } catch {
      showToast('Erreur.', 'error');
    }
  };

  const openNewVariant = () => {
    setEditVar(null);
    setVarForm({ size: '', color: '', extra_price: '0', stock: '0', stock_alert: '5' });
    setVarModal(true);
  };

  const openEditVariant = (v: Variant) => {
    setEditVar(v);
    setVarForm({ size: v.size, color: v.color, extra_price: String(v.extra_price), stock: String(v.stock), stock_alert: String(v.stock_alert) });
    setVarModal(true);
  };

  const handleSaveVariant = async () => {
    const payload = {
      size: varForm.size,
      color: varForm.color,
      extra_price: parseFloat(varForm.extra_price) || 0,
      stock: parseInt(varForm.stock) || 0,
      stock_alert: parseInt(varForm.stock_alert) || 5,
    };
    try {
      if (editVar) {
        const updated = await adminApi.updateVariant(uuid, editVar.uuid, payload);
        setVariants((prev) => prev.map((v) => v.uuid === editVar.uuid ? { ...v, ...updated } : v));
        showToast('Variante mise à jour.', 'success');
      } else {
        const created = await adminApi.createVariant(uuid, payload);
        setVariants((prev) => [...prev, created]);
        showToast('Variante ajoutée.', 'success');
      }
      setVarModal(false);
    } catch {
      showToast('Erreur variante.', 'error');
    }
  };

  const handleDeleteVariant = async () => {
    if (!deleteVarId) return;
    try {
      await adminApi.deleteVariant(uuid, deleteVarId);
      setVariants((prev) => prev.filter((v) => v.uuid !== deleteVarId));
      showToast('Variante supprimée.', 'success');
    } catch {
      showToast('Erreur suppression variante.', 'error');
    } finally {
      setDeleteVarId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #E8B96A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => router.push('/admin/produits')}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 12px', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontSize: 12 }}>
            ← Retour
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Éditer le produit</h1>
        </div>
        <button type="submit" disabled={saving}
          style={{ padding: '10px 24px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1c2310', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      <ProductForm form={form} setForm={setForm} categories={categories} />

      {/* Images */}
      <div style={{ background: '#1e2614', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, padding: 20, marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', margin: 0 }}>Images</h2>
          <label style={{ padding: '8px 14px', background: 'rgba(232,185,106,0.1)', border: '1px solid rgba(232,185,106,0.2)', borderRadius: 8, color: '#E8B96A', fontSize: 12, cursor: 'pointer' }}>
            {uploadingImg ? 'Upload…' : '+ Ajouter une image'}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {images.length === 0 && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Aucune image ajoutée.</div>}
          {images.map((img) => (
            <div key={img.uuid} style={{ position: 'relative', width: 100, height: 100 }}>
              <img src={img.url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: img.is_primary ? '2px solid #E8B96A' : '2px solid transparent' }} />
              {img.is_primary && (
                <div style={{ position: 'absolute', top: 4, left: 4, background: '#E8B96A', color: '#1c2310', fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>PRINCIPALE</div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 3, padding: 4 }}>
                {!img.is_primary && (
                  <button type="button" onClick={() => handleSetPrimary(img.uuid)} style={{ flex: 1, padding: '3px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 4, color: '#E8B96A', cursor: 'pointer', fontSize: 9 }}>★</button>
                )}
                <button type="button" onClick={() => setDeleteImgId(img.uuid)} style={{ flex: 1, padding: '3px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 4, color: '#c9634a', cursor: 'pointer', fontSize: 9 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div style={{ background: '#1e2614', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, padding: 20, marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', margin: 0 }}>Variantes</h2>
          <button type="button" onClick={openNewVariant}
            style={{ padding: '8px 14px', background: 'rgba(232,185,106,0.1)', border: '1px solid rgba(232,185,106,0.2)', borderRadius: 8, color: '#E8B96A', fontSize: 12, cursor: 'pointer' }}>
            + Ajouter une variante
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
              {['SKU', 'Taille', 'Couleur', 'Prix extra', 'Stock', 'Seuil alerte', 'Actif', ''].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'rgba(255,255,255,0.58)', fontWeight: 400, fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Aucune variante.</td></tr>
            )}
            {variants.map((v) => (
              <tr key={v.uuid} style={{ borderBottom: '1px solid rgba(240,234,210,0.04)' }}>
                <td style={{ padding: '10px 10px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{v.sku}</td>
                <td style={{ padding: '10px 10px', color: 'rgba(255,255,255,0.92)' }}>{v.size}</td>
                <td style={{ padding: '10px 10px', color: 'rgba(255,255,255,0.92)' }}>{v.color}</td>
                <td style={{ padding: '10px 10px', color: 'rgba(255,255,255,0.92)' }}>{fmt(v.extra_price)}</td>
                <td style={{ padding: '10px 10px', color: v.stock <= v.stock_alert ? '#c9634a' : '#6faa30', fontWeight: 500 }}>{v.stock}</td>
                <td style={{ padding: '10px 10px', color: 'rgba(255,255,255,0.65)' }}>{v.stock_alert}</td>
                <td style={{ padding: '10px 10px' }}>
                  <span style={{ fontSize: 11, color: v.is_active ? '#6faa30' : '#c9634a' }}>{v.is_active ? 'Oui' : 'Non'}</span>
                </td>
                <td style={{ padding: '10px 10px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => openEditVariant(v)} style={{ padding: '4px 9px', background: 'rgba(232,185,106,0.1)', border: '1px solid rgba(232,185,106,0.15)', borderRadius: 5, color: '#E8B96A', cursor: 'pointer', fontSize: 11 }}>Éditer</button>
                    <button type="button" onClick={() => setDeleteVarId(v.uuid)} style={{ padding: '4px 9px', background: 'rgba(201,99,74,0.1)', border: '1px solid rgba(201,99,74,0.15)', borderRadius: 5, color: '#c9634a', cursor: 'pointer', fontSize: 11 }}>Suppr.</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Variant modal */}
      <Modal open={varModal} onClose={() => setVarModal(false)} title={editVar ? 'Modifier la variante' : 'Nouvelle variante'} width={480}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Taille', key: 'size', type: 'text', placeholder: 'XS, S, M…' },
            { label: 'Couleur', key: 'color', type: 'text', placeholder: 'Noir, Blanc…' },
            { label: 'Prix extra', key: 'extra_price', type: 'number', placeholder: '0' },
            { label: 'Stock', key: 'stock', type: 'number', placeholder: '0' },
            { label: 'Seuil alerte stock', key: 'stock_alert', type: 'number', placeholder: '5' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>{label}</label>
              <input
                type={type}
                value={varForm[key as keyof typeof varForm]}
                onChange={(e) => setVarForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button type="button" onClick={() => setVarModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button type="button" onClick={handleSaveVariant} style={{ flex: 1, padding: '10px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1c2310', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {editVar ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </Modal>

      {/* Delete image confirm */}
      <Modal open={!!deleteImgId} onClose={() => setDeleteImgId(null)} title="Supprimer l'image" width={400}>
        <p style={{ color: 'rgba(240,234,210,0.7)', fontSize: 13, marginBottom: 20 }}>Êtes-vous sûr de vouloir supprimer cette image ?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => setDeleteImgId(null)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button type="button" onClick={handleDeleteImage} style={{ flex: 1, padding: '10px', background: '#c9634a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
        </div>
      </Modal>

      {/* Delete variant confirm */}
      <Modal open={!!deleteVarId} onClose={() => setDeleteVarId(null)} title="Supprimer la variante" width={400}>
        <p style={{ color: 'rgba(240,234,210,0.7)', fontSize: 13, marginBottom: 20 }}>Êtes-vous sûr de vouloir supprimer cette variante ?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => setDeleteVarId(null)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button type="button" onClick={handleDeleteVariant} style={{ flex: 1, padding: '10px', background: '#c9634a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
        </div>
      </Modal>
    </form>
  );
}
