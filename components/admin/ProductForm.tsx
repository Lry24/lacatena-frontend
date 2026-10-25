'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ProductImg from '@/components/shop/ProductImg';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import type { Category, ProductDetail } from '@/lib/types';
import { A, AField, AInput, ASelect, ATextarea, Alert, Btn, Card } from './kit';

interface VariantRow { id?: number; label: string; stock: number; active: boolean }

const PRESETS: { name: string; sizes: string[] }[] = [
  { name: 'XS → XL', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { name: 'M → XXL', sizes: ['M', 'L', 'XL', 'XXL'] },
  { name: 'Enfant', sizes: ['2 ans', '4 ans', '6 ans', '8 ans', '10 ans'] },
  { name: 'Pointures femme', sizes: ['36', '37', '38', '39', '40', '41'] },
  { name: 'Pointures homme', sizes: ['40', '41', '42', '43', '44', '45'] },
  { name: 'Taille unique', sizes: ['Taille unique'] },
];

function flatten(cats: Category[], depth = 0): { id: number; label: string }[] {
  return cats.flatMap((c) => [{ id: c.id, label: `${'— '.repeat(depth)}${c.name}` }, ...flatten(c.children, depth + 1)]);
}

/** Compresse une photo dans le navigateur avant l'envoi (bords de 1600 px max, JPEG). */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b || file), 'image/jpeg', 0.85));
}

export default function ProductForm({ product }: { product?: ProductDetail }) {
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cats, setCats] = useState<{ id: number; label: string }[]>([]);
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || '');
  const [categoryId, setCategoryId] = useState<number | ''>(product?.category?.id || '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compare, setCompare] = useState(product?.compare_at_price ? String(product.compare_at_price) : '');
  const [description, setDescription] = useState(product?.description || '');
  const [details, setDetails] = useState(product?.details.join('\n') || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) || []);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.filter((v) => v.active).map((v) => ({ id: v.id, label: v.label, stock: v.stock, active: v.active })) || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api<Category[]>('/api/v1/admin/categories').then((c) => setCats(flatten(c))).catch(() => {}); }, []);

  const applyPreset = (sizes: string[]) => {
    setVariants((current) => {
      const kept = new Map(current.map((v) => [v.label.toLowerCase(), v]));
      return sizes.map((s) => kept.get(s.toLowerCase()) || { label: s, stock: 0, active: true });
    });
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 10 - images.length)) {
        const form = new FormData();
        form.append('file', await compress(file), file.name.replace(/\.\w+$/, '.jpg'));
        const res = await api<{ url: string }>('/api/v1/admin/media', { method: 'POST', form });
        setImages((imgs) => [...imgs, res.url]);
      }
    } catch (e) { setError((e as Error).message); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const move = (i: number, d: number) => setImages((imgs) => {
    const next = [...imgs];
    const j = i + d;
    if (j < 0 || j >= next.length) return imgs;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!variants.length) { setError('Ajoutez au moins une taille (ou « Taille unique »).'); return; }
    const p = Number(price);
    if (!p) { setError('Indiquez un prix.'); return; }
    if (compare && Number(compare) <= p) { setError('Le prix barré doit être supérieur au prix de vente.'); return; }
    setSaving(true);
    const body = {
      name, brand: brand || null, description: description || null, details: details || null, sku: sku || null,
      price: p, compare_at_price: compare ? Number(compare) : null, category_id: categoryId || null, active, featured, images,
      variants: variants.map((v) => ({ id: v.id, label: v.label, stock: Number(v.stock) || 0, active: v.active })),
    };
    try {
      const saved = await api<ProductDetail>(product ? `/api/v1/admin/products/${product.id}` : '/api/v1/admin/products', { method: product ? 'PUT' : 'POST', body });
      toast(product ? 'Pièce mise à jour' : 'Pièce ajoutée au catalogue');
      if (!product) router.replace(`/admin/produits/${saved.id}`);
      // Les nouvelles tailles reçoivent leur identifiant : un second enregistrement les met à jour au lieu de les recréer
      else setVariants(saved.variants.filter((v) => v.active).map((v) => ({ id: v.id, label: v.label, stock: v.stock, active: v.active })));
    } catch (err) { setError((err as Error).message); } finally { setSaving(false); }
  };

  const totalStock = variants.reduce((n, v) => n + (Number(v.stock) || 0), 0);

  return (
    <form onSubmit={save} className="grid xl:grid-cols-[1fr_380px] gap-4">
      <div className="flex flex-col gap-4">
        <Card title="Informations">
          <div className="grid sm:grid-cols-2 gap-4">
            <AField label="Nom de la pièce" full><AInput value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Robe Wax Soleil" /></AField>
            <AField label="Marque"><AInput value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="La Catena Atelier" /></AField>
            <AField label="Catégorie">
              <ASelect value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">— Aucune —</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </ASelect>
            </AField>
            <AField label="Description" full><ATextarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ce qui rend la pièce unique : coupe, matière, occasion…" /></AField>
            <AField label="Composition & entretien" full hint="Une information par ligne"><ATextarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder={'Pagne wax 100 % coton\nLavage à 30 °C'} /></AField>
          </div>
        </Card>

        <Card title={`Photos (${images.length}/10)`} action={<span style={{ fontSize: 12, color: A.faint }}>La première est la photo principale</span>}>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {images.map((url, i) => (
              <div key={url} className="relative group" style={{ aspectRatio: '3/4', borderRadius: 6, overflow: 'hidden', border: `1px solid ${i === 0 ? A.gold : A.border}`, background: A.bg }}>
                <ProductImg src={url} alt="" sizes="120px" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.65)', padding: 4 }}>
                  <button type="button" onClick={() => move(i, -1)} aria-label="Avant" style={{ color: '#fff', padding: '0 6px' }}>←</button>
                  <button type="button" onClick={() => setImages(images.filter((u) => u !== url))} aria-label="Retirer" style={{ color: A.red, padding: '0 6px' }}>✕</button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Après" style={{ color: '#fff', padding: '0 6px' }}>→</button>
                </div>
              </div>
            ))}
            {images.length < 10 && (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex flex-col items-center justify-center gap-1" style={{ aspectRatio: '3/4', borderRadius: 6, border: `1px dashed ${A.border}`, color: A.muted, fontSize: 12 }}>
                <span style={{ fontSize: 22, color: A.gold }}>+</span>{uploading ? 'Envoi…' : 'Ajouter'}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
          <div className="flex gap-2">
            <AInput value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="… ou coller une adresse d'image (https://…)" />
            <Btn variant="subtle" onClick={() => { if (imageUrl.trim()) { setImages([...images, imageUrl.trim()]); setImageUrl(''); } }}>Ajouter</Btn>
          </div>
        </Card>

        <Card title={`Tailles & stock · ${totalStock} pièce${totalStock > 1 ? 's' : ''}`}>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => <Btn key={p.name} small variant="ghost" onClick={() => applyPreset(p.sizes)}>{p.name}</Btn>)}
          </div>
          {variants.length === 0 && <p style={{ fontSize: 13, color: A.faint, marginBottom: 12 }}>Choisissez une grille ci-dessus ou ajoutez les tailles une à une.</p>}
          <div className="flex flex-col gap-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <AInput value={v.label} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} style={{ maxWidth: 160 }} aria-label="Taille" />
                <AInput type="number" min={0} value={v.stock} onChange={(e) => setVariants(variants.map((x, j) => j === i ? { ...x, stock: Number(e.target.value) } : x))} style={{ maxWidth: 110 }} aria-label="Stock" />
                <span style={{ fontSize: 12, color: v.stock > 0 ? A.muted : A.red, flex: 1 }}>{v.stock > 0 ? 'en stock' : 'épuisé'}</span>
                <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))} aria-label="Retirer la taille" style={{ color: A.red, padding: '0 8px' }}>✕</button>
              </div>
            ))}
          </div>
          <div className="mt-3"><Btn small variant="subtle" onClick={() => setVariants([...variants, { label: '', stock: 0, active: true }])}>+ Ajouter une taille</Btn></div>
          {product && <p style={{ fontSize: 11, color: A.faint, marginTop: 12 }}>Chaque modification de stock est tracée dans « Stock ». Pour une réception de marchandise, préférez l&apos;entrée de stock avec motif.</p>}
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card title="Prix">
          <div className="flex flex-col gap-4">
            <AField label="Prix de vente (FCFA)"><AInput type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required /></AField>
            <AField label="Prix barré (facultatif)" hint="Renseigné et supérieur au prix : la pièce apparaît dans « Promos »"><AInput type="number" min={0} value={compare} onChange={(e) => setCompare(e.target.value)} /></AField>
            <AField label="Référence (SKU)"><AInput value={sku} onChange={(e) => setSku(e.target.value)} placeholder="LC-ROB-001" /></AField>
          </div>
        </Card>
        <Card title="Visibilité">
          <label className="flex items-center gap-3 mb-3 cursor-pointer" style={{ fontSize: 13 }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: A.gold, width: 16, height: 16 }} />
            En vente sur la boutique
          </label>
          <label className="flex items-center gap-3 cursor-pointer" style={{ fontSize: 13 }}>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ accentColor: A.gold, width: 16, height: 16 }} />
            Mise en avant (meilleures ventes, suggestions)
          </label>
        </Card>
        {error && <Alert>{error}</Alert>}
        <Btn type="submit" disabled={saving || uploading} style={{ padding: '12px 16px' }}>{saving ? 'Enregistrement…' : product ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}</Btn>
        {product && product.active && <Btn variant="ghost" href={`/produits/${product.slug}`}>Voir sur la boutique ↗</Btn>}
      </div>
    </form>
  );
}
