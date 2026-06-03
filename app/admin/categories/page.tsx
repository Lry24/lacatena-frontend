'use client';
import React, { useEffect, useState } from 'react';
import Modal from '@/components/admin/Modal';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import * as adminApi from '@/lib/adminApi';

interface Category {
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  gender?: string;
  parent_uuid?: string;
  is_active: boolean;
  sort_order?: number;
  image_url?: string;
  children_count?: number;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, outline: 'none',
};

const defaultCatForm = () => ({
  name: '', description: '', gender: '', parent_uuid: '', sort_order: '0', is_active: true,
});

export default function CategoriesPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(defaultCatForm());
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [uploadCat, setUploadCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.listCategories(false)
      .then(setCategories)
      .catch(() => showToast('Erreur chargement catégories.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultCatForm());
    setModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      gender: cat.gender ?? '',
      parent_uuid: cat.parent_uuid ?? '',
      sort_order: String(cat.sort_order ?? 0),
      is_active: cat.is_active,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { showToast('Le nom est requis.', 'warning'); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description || undefined,
      gender: form.gender || undefined,
      parent_uuid: form.parent_uuid || undefined,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await adminApi.updateCategory(editing.uuid, payload);
        showToast('Catégorie mise à jour.', 'success');
      } else {
        await adminApi.createCategory(payload);
        showToast('Catégorie créée.', 'success');
      }
      setModal(false);
      load();
    } catch {
      showToast('Erreur sauvegarde catégorie.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteCategory(deleting.uuid);
      showToast('Catégorie supprimée.', 'success');
      setDeleting(null);
      load();
    } catch {
      showToast('Erreur suppression.', 'error');
    }
  };

  const handleImageUpload = async (cat: Category, file: File) => {
    try {
      await adminApi.uploadCategoryImage(cat.uuid, file);
      showToast('Image mise à jour.', 'success');
      load();
    } catch {
      showToast('Erreur upload image.', 'error');
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.92)', margin: 0 }}>Catégories</h1>
        <button onClick={openCreate}
          style={{ padding: '9px 18px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1c2310', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          + Nouvelle catégorie
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 120, background: '#1e2614', borderRadius: 10, border: '1px solid rgba(255,255,255,0.11)', animation: 'adminPulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {categories.map((cat) => (
            <div key={cat.uuid} style={{ background: '#1e2614', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {cat.image_url ? (
                  <img src={cat.image_url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(232,185,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8B96A', fontSize: 18, fontWeight: 600 }}>
                    {cat.name[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)' }}>{cat.slug}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cat.gender && <span style={{ fontSize: 10, padding: '2px 7px', background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.65)', borderRadius: 4 }}>{cat.gender}</span>}
                <span style={{ fontSize: 10, padding: '2px 7px', background: cat.is_active ? 'rgba(111,170,48,0.1)' : 'rgba(201,99,74,0.1)', color: cat.is_active ? '#6faa30' : '#c9634a', borderRadius: 4 }}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(cat)} style={{ flex: 1, padding: '6px', background: 'rgba(232,185,106,0.08)', border: '1px solid rgba(232,185,106,0.15)', borderRadius: 6, color: '#E8B96A', cursor: 'pointer', fontSize: 11 }}>Éditer</button>
                <label style={{ flex: 1, padding: '6px', background: 'rgba(74,143,201,0.08)', border: '1px solid rgba(74,143,201,0.15)', borderRadius: 6, color: '#4a8fc9', cursor: 'pointer', fontSize: 11, textAlign: 'center' }}>
                  Image
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(cat, f); }} />
                </label>
                <button onClick={() => setDeleting(cat)} style={{ padding: '6px 10px', background: 'rgba(201,99,74,0.08)', border: '1px solid rgba(201,99,74,0.15)', borderRadius: 6, color: '#c9634a', cursor: 'pointer', fontSize: 11 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Nom *</label>
            <input value={form.name} onChange={set('name')} required style={inputStyle} placeholder="Nom de la catégorie" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Genre</label>
              <select value={form.gender} onChange={set('gender')} style={inputStyle}>
                <option value="">Tous</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="unisex">Unisexe</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Ordre de tri</label>
              <input type="number" value={form.sort_order} onChange={set('sort_order')} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Catégorie parente</label>
            <select value={form.parent_uuid} onChange={set('parent_uuid')} style={inputStyle}>
              <option value="">Aucune</option>
              {categories.filter(c => !editing || c.uuid !== editing.uuid).map(c => (
                <option key={c.uuid} value={c.uuid}>{c.name}</option>
              ))}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} style={{ accentColor: '#E8B96A' }} />
            Catégorie active
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={() => setModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', background: '#E8B96A', border: 'none', borderRadius: 8, color: '#1c2310', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Supprimer la catégorie" width={400}>
        <p style={{ color: 'rgba(240,234,210,0.7)', fontSize: 13, marginBottom: 20 }}>
          Êtes-vous sûr de vouloir supprimer la catégorie <strong style={{ color: 'rgba(255,255,255,0.92)' }}>{deleting?.name}</strong> ?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={handleDelete} style={{ flex: 1, padding: '10px', background: '#c9634a', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
        </div>
      </Modal>

      <style>{`@keyframes adminPulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }`}</style>
    </div>
  );
}
