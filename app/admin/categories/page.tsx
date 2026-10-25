'use client';
import { useState } from 'react';
import { A, AField, AInput, ASelect, ATextarea, Alert, Badge, Btn, Card, Modal, PageTitle, Spin, useFetch } from '@/components/admin/kit';
import ProductImg from '@/components/shop/ProductImg';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

type Draft = { id?: number; name: string; description: string; image_url: string; parent_id: number | ''; position: number; active: boolean };
const EMPTY: Draft = { name: '', description: '', image_url: '', parent_id: '', position: 0, active: true };

export default function CategoriesPage() {
  const { data, error, reload } = useFetch<Category[]>('/api/v1/admin/categories');
  const toast = useToast((s) => s.show);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const edit = (c: Category) => setDraft({ id: c.id, name: c.name, description: c.description || '', image_url: c.image_url || '', parent_id: c.parent_id || '', position: c.position, active: c.active });

  const save = async () => {
    if (!draft) return;
    setSaving(true); setFormError('');
    const body = { ...draft, parent_id: draft.parent_id || null, description: draft.description || null, image_url: draft.image_url || null };
    try {
      await api(draft.id ? `/api/v1/admin/categories/${draft.id}` : '/api/v1/admin/categories', { method: draft.id ? 'PUT' : 'POST', body });
      toast(draft.id ? 'Catégorie mise à jour' : 'Catégorie créée');
      setDraft(null); reload();
    } catch (e) { setFormError((e as Error).message); } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!draft?.id || !confirm(`Supprimer « ${draft.name} » ?`)) return;
    try { await api(`/api/v1/admin/categories/${draft.id}`, { method: 'DELETE' }); toast('Catégorie supprimée'); setDraft(null); reload(); }
    catch (e) { setFormError((e as Error).message); }
  };

  const row = (c: Category, child = false) => (
    <div key={c.id} className="flex items-center gap-3 hover:bg-white/[0.03]" style={{ padding: '10px 12px', paddingLeft: child ? 44 : 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="relative overflow-hidden flex-shrink-0" style={{ width: child ? 32 : 44, height: child ? 32 : 44, borderRadius: child ? 6 : 8, background: A.bg }}>
        {c.image_url && <ProductImg src={c.image_url} alt="" sizes="44px" className="object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: child ? 13 : 15, fontWeight: child ? 400 : 500 }}>{c.name}</p>
        <p style={{ fontSize: 11, color: A.faint }}>/{c.slug} · {c.product_count} pièce{c.product_count > 1 ? 's' : ''}</p>
      </div>
      {!c.active && <Badge tone="red">Masquée</Badge>}
      <Btn small variant="ghost" onClick={() => edit(c)}>Modifier</Btn>
    </div>
  );

  return (
    <>
      <PageTitle title="Catégories" subtitle="Les univers (Femme, Homme…) et leurs rayons, tels qu'ils apparaissent dans la boutique."
        actions={<Btn onClick={() => setDraft({ ...EMPTY })}>+ Nouvelle catégorie</Btn>} />
      {error && <Alert>{error}</Alert>}
      {!data ? <Spin /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((root) => (
            <Card key={root.id} pad={0}>
              {row(root)}
              {root.children.map((c) => row(c, true))}
              <div style={{ padding: '8px 12px 12px 44px' }}>
                <button onClick={() => setDraft({ ...EMPTY, parent_id: root.id, position: root.children.length })} style={{ fontSize: 12, color: A.gold }}>+ Ajouter un rayon à {root.name}</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {draft && (
        <Modal title={draft.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'} onClose={() => setDraft(null)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <AField label="Nom" full><AInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus /></AField>
            <AField label="Rangée dans">
              <ASelect value={draft.parent_id} onChange={(e) => setDraft({ ...draft, parent_id: e.target.value ? Number(e.target.value) : '' })}>
                <option value="">— Univers principal —</option>
                {(data || []).filter((c) => c.id !== draft.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </ASelect>
            </AField>
            <AField label="Ordre d'affichage"><AInput type="number" value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })} /></AField>
            <AField label="Image (adresse)" full hint="Photo d'ambiance utilisée sur la page d'accueil"><AInput value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} placeholder="/images/… ou https://…" /></AField>
            <AField label="Description" full><ATextarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></AField>
            <label className="flex items-center gap-3 cursor-pointer sm:col-span-2" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} style={{ accentColor: A.gold, width: 16, height: 16 }} />
              Visible dans la boutique
            </label>
          </div>
          {formError && <div className="mt-4"><Alert>{formError}</Alert></div>}
          <div className="flex justify-between gap-2 mt-6">
            {draft.id ? <Btn variant="danger" onClick={remove}>Supprimer</Btn> : <span />}
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={() => setDraft(null)}>Annuler</Btn>
              <Btn onClick={save} disabled={saving || draft.name.trim().length < 2}>Enregistrer</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
