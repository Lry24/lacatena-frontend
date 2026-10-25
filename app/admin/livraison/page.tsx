'use client';
import { useState } from 'react';
import { A, AField, AInput, Alert, Badge, Btn, Card, Modal, PageTitle, Spin, useFetch } from '@/components/admin/kit';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { delay, fcfa } from '@/lib/format';

interface Rate { id: number; name: string; price: number; free_from: number | null; days_min: number | null; days_max: number | null; active: boolean }
interface Zone { id: number; name: string; position: number; active: boolean; rates: Rate[] }
type RateDraft = { id?: number; zoneId: number; name: string; price: string; free_from: string; days_min: string; days_max: string; active: boolean };

/** Frais de livraison proposés à la commande. La remise elle-même est gérée hors du site (pas de module livreur). */
export default function ShippingPage() {
  const { data, error, reload } = useFetch<Zone[]>('/api/v1/admin/shipping/zones');
  const toast = useToast((s) => s.show);
  const [rate, setRate] = useState<RateDraft | null>(null);
  const [zone, setZone] = useState<{ id?: number; name: string; position: number; active: boolean } | null>(null);
  const [formError, setFormError] = useState('');

  const num = (v: string) => (v.trim() === '' ? null : Number(v));

  const saveRate = async () => {
    if (!rate) return;
    setFormError('');
    const body = { name: rate.name, price: Number(rate.price) || 0, free_from: num(rate.free_from), days_min: num(rate.days_min), days_max: num(rate.days_max), active: rate.active };
    try {
      await api(rate.id ? `/api/v1/admin/shipping/rates/${rate.id}` : `/api/v1/admin/shipping/zones/${rate.zoneId}/rates`, { method: rate.id ? 'PUT' : 'POST', body });
      toast('Tarif enregistré'); setRate(null); reload();
    } catch (e) { setFormError((e as Error).message); }
  };

  const deleteRate = async () => {
    if (!rate?.id || !confirm(`Supprimer le tarif « ${rate.name} » ?`)) return;
    try { await api(`/api/v1/admin/shipping/rates/${rate.id}`, { method: 'DELETE' }); toast('Tarif supprimé'); setRate(null); reload(); }
    catch (e) { setFormError((e as Error).message); }
  };

  const saveZone = async () => {
    if (!zone) return;
    setFormError('');
    try {
      await api(zone.id ? `/api/v1/admin/shipping/zones/${zone.id}` : '/api/v1/admin/shipping/zones', { method: zone.id ? 'PUT' : 'POST', body: zone });
      toast('Zone enregistrée'); setZone(null); reload();
    } catch (e) { setFormError((e as Error).message); }
  };

  return (
    <>
      <PageTitle title="Frais de livraison" subtitle="Les zones et tarifs proposés à la cliente au moment de commander."
        actions={<Btn onClick={() => setZone({ name: '', position: (data?.length || 0), active: true })}>+ Nouvelle zone</Btn>} />
      {error && <Alert>{error}</Alert>}
      {!data ? <Spin /> : (
        <div className="grid lg:grid-cols-2 gap-4">
          {data.map((z) => (
            <Card key={z.id} title={z.name} action={
              <div className="flex gap-2 items-center">
                {!z.active && <Badge tone="red">Désactivée</Badge>}
                <Btn small variant="ghost" onClick={() => setZone({ id: z.id, name: z.name, position: z.position, active: z.active })}>Modifier</Btn>
              </div>
            }>
              <div className="flex flex-col gap-2">
                {z.rates.map((r) => (
                  <button key={r.id} onClick={() => setRate({ id: r.id, zoneId: z.id, name: r.name, price: String(r.price), free_from: r.free_from == null ? '' : String(r.free_from), days_min: r.days_min == null ? '' : String(r.days_min), days_max: r.days_max == null ? '' : String(r.days_max), active: r.active })}
                    className="flex justify-between items-center text-left hover:bg-white/5" style={{ padding: '10px 12px', borderRadius: 7, border: `1px solid ${A.border}`, opacity: r.active ? 1 : 0.5 }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 14 }}>{r.name}</span>
                      <span style={{ display: 'block', fontSize: 12, color: A.muted }}>{delay(r)}{r.free_from != null ? ` · offerte dès ${fcfa(r.free_from)}` : ''}{!r.active ? ' · désactivé' : ''}</span>
                    </span>
                    <span style={{ fontSize: 14, color: r.price ? A.text : A.gold }}>{r.price ? fcfa(r.price) : 'Gratuit'}</span>
                  </button>
                ))}
                <button onClick={() => setRate({ zoneId: z.id, name: '', price: '', free_from: '', days_min: '', days_max: '', active: true })} style={{ fontSize: 12, color: A.gold, textAlign: 'left', padding: '6px 0' }}>+ Ajouter un tarif</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {rate && (
        <Modal title={rate.id ? 'Modifier le tarif' : 'Nouveau tarif'} onClose={() => { setRate(null); setFormError(''); }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <AField label="Nom" full><AInput value={rate.name} onChange={(e) => setRate({ ...rate, name: e.target.value })} placeholder="Livraison standard" autoFocus /></AField>
            <AField label="Prix (FCFA)"><AInput type="number" min={0} value={rate.price} onChange={(e) => setRate({ ...rate, price: e.target.value })} /></AField>
            <AField label="Offert dès (FCFA)" hint="Vide : jamais offert"><AInput type="number" min={0} value={rate.free_from} onChange={(e) => setRate({ ...rate, free_from: e.target.value })} /></AField>
            <AField label="Délai min. (jours)"><AInput type="number" min={0} value={rate.days_min} onChange={(e) => setRate({ ...rate, days_min: e.target.value })} /></AField>
            <AField label="Délai max. (jours)"><AInput type="number" min={0} value={rate.days_max} onChange={(e) => setRate({ ...rate, days_max: e.target.value })} /></AField>
            <label className="flex items-center gap-3 sm:col-span-2" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={rate.active} onChange={(e) => setRate({ ...rate, active: e.target.checked })} style={{ accentColor: A.gold, width: 16, height: 16 }} /> Proposé à la commande
            </label>
          </div>
          {formError && <div className="mt-4"><Alert>{formError}</Alert></div>}
          <div className="flex justify-between mt-6">
            {rate.id ? <Btn variant="danger" onClick={deleteRate}>Supprimer</Btn> : <span />}
            <div className="flex gap-2"><Btn variant="ghost" onClick={() => setRate(null)}>Annuler</Btn><Btn onClick={saveRate} disabled={rate.name.trim().length < 2}>Enregistrer</Btn></div>
          </div>
        </Modal>
      )}

      {zone && (
        <Modal title={zone.id ? 'Modifier la zone' : 'Nouvelle zone'} onClose={() => { setZone(null); setFormError(''); }}>
          <div className="flex flex-col gap-4">
            <AField label="Nom de la zone"><AInput value={zone.name} onChange={(e) => setZone({ ...zone, name: e.target.value })} placeholder="Grand Lomé" autoFocus /></AField>
            <AField label="Ordre d'affichage"><AInput type="number" value={zone.position} onChange={(e) => setZone({ ...zone, position: Number(e.target.value) })} /></AField>
            <label className="flex items-center gap-3" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={zone.active} onChange={(e) => setZone({ ...zone, active: e.target.checked })} style={{ accentColor: A.gold, width: 16, height: 16 }} /> Zone active
            </label>
            {formError && <Alert>{formError}</Alert>}
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setZone(null)}>Annuler</Btn><Btn onClick={saveZone} disabled={zone.name.trim().length < 2}>Enregistrer</Btn></div>
          </div>
        </Modal>
      )}
    </>
  );
}
