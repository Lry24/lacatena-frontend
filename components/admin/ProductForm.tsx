'use client';
import React from 'react';

export interface ProductFormData {
  name: string;
  description: string;
  brand: string;
  supplier: string;
  origin: string;
  gender: string;
  tags: string;
  price_ttc: string;
  tva_rate: string;
  purchase_price_ht: string;
  is_promo: boolean;
  promo_price: string;
  promo_start: string;
  promo_end: string;
  category_uuid: string;
  is_active: boolean;
  is_new: boolean;
  is_featured: boolean;
  weight: string;
  material: string;
}

export const defaultProductForm = (): ProductFormData => ({
  name: '', description: '', brand: '', supplier: '', origin: '', gender: '', tags: '',
  price_ttc: '', tva_rate: '18', purchase_price_ht: '',
  is_promo: false, promo_price: '', promo_start: '', promo_end: '',
  category_uuid: '', is_active: true, is_new: false, is_featured: false,
  weight: '', material: '',
});

interface FieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export function Field({ label, children, required }: FieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.5)', marginBottom: 7 }}>
        {label}{required && <span style={{ color: '#c9634a', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,234,210,0.1)',
  borderRadius: 8, color: '#f0ead2', fontSize: 13, outline: 'none',
};

interface ProductFormProps {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: { uuid: string; name: string }[];
}

export default function ProductForm({ form, setForm, categories }: ProductFormProps) {
  const set = (k: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const setCheck = (k: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.checked }));

  const section = (title: string) => (
    <div style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.4)', marginBottom: 16, marginTop: 4, paddingBottom: 8, borderBottom: '1px solid rgba(240,234,210,0.06)' }}>
      {title}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Informations */}
      <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
        {section('Informations')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Nom" required>
            <input value={form.name} onChange={set('name')} required style={inputStyle} placeholder="Nom du produit" />
          </Field>
          <Field label="Marque">
            <input value={form.brand} onChange={set('brand')} style={inputStyle} placeholder="Marque" />
          </Field>
          <Field label="Genre">
            <select value={form.gender} onChange={set('gender')} style={inputStyle}>
              <option value="">Sélectionner…</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="unisex">Unisexe</option>
              <option value="enfant">Enfant</option>
            </select>
          </Field>
          <Field label="Fournisseur">
            <input value={form.supplier} onChange={set('supplier')} style={inputStyle} placeholder="Fournisseur" />
          </Field>
          <Field label="Origine">
            <input value={form.origin} onChange={set('origin')} style={inputStyle} placeholder="Pays d'origine" />
          </Field>
          <Field label="Tags (séparés par virgule)">
            <input value={form.tags} onChange={set('tags')} style={inputStyle} placeholder="ex: cuir, casual, été" />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Description">
              <textarea value={form.description} onChange={set('description')} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Description détaillée…" />
            </Field>
          </div>
        </div>
      </div>

      {/* Tarification */}
      <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
        {section('Tarification')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Prix TTC" required>
            <input type="number" value={form.price_ttc} onChange={set('price_ttc')} required style={inputStyle} placeholder="0" min="0" step="0.01" />
          </Field>
          <Field label="Taux TVA (%)">
            <input type="number" value={form.tva_rate} onChange={set('tva_rate')} style={inputStyle} placeholder="18" />
          </Field>
          <Field label="Prix achat HT">
            <input type="number" value={form.purchase_price_ht} onChange={set('purchase_price_ht')} style={inputStyle} placeholder="0" />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
            <input type="checkbox" id="is_promo" checked={form.is_promo} onChange={setCheck('is_promo')} style={{ accentColor: '#E8B96A' }} />
            <label htmlFor="is_promo" style={{ fontSize: 13, color: '#f0ead2', cursor: 'pointer' }}>En promotion</label>
          </div>
          {form.is_promo && <>
            <Field label="Prix promo TTC">
              <input type="number" value={form.promo_price} onChange={set('promo_price')} style={inputStyle} placeholder="0" />
            </Field>
            <div />
            <Field label="Début promo">
              <input type="date" value={form.promo_start} onChange={set('promo_start')} style={inputStyle} />
            </Field>
            <Field label="Fin promo">
              <input type="date" value={form.promo_end} onChange={set('promo_end')} style={inputStyle} />
            </Field>
          </>}
        </div>
      </div>

      {/* Options */}
      <div style={{ background: '#1e2411', border: '1px solid rgba(240,234,210,0.08)', borderRadius: 10, padding: 20 }}>
        {section('Options & Classification')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Catégorie">
            <select value={form.category_uuid} onChange={set('category_uuid')} style={inputStyle}>
              <option value="">Aucune catégorie</option>
              {categories.map((c) => <option key={c.uuid} value={c.uuid}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Matière">
            <input value={form.material} onChange={set('material')} style={inputStyle} placeholder="Coton, cuir…" />
          </Field>
          <Field label="Poids (g)">
            <input type="number" value={form.weight} onChange={set('weight')} style={inputStyle} placeholder="0" />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { id: 'is_active', label: 'Actif', key: 'is_active' },
            { id: 'is_new', label: 'Nouveau', key: 'is_new' },
            { id: 'is_featured', label: 'Vedette', key: 'is_featured' },
          ].map(({ id, label, key }) => (
            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#f0ead2' }}>
              <input type="checkbox" id={id} checked={form[key as keyof ProductFormData] as boolean} onChange={setCheck(key as keyof ProductFormData)} style={{ accentColor: '#E8B96A' }} />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
