'use client';
import { useState } from 'react';
import { A, AField, AInput, ASelect, Alert, Badge, Btn, Card, Modal, PageTitle, Spin, Table, td, useFetch } from '@/components/admin/kit';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { AdminUser } from '@/lib/types';
import { useAdmin } from '@/store/admin';

type Draft = { id?: number; username: string; full_name: string; email: string; role: 'ADMIN' | 'GESTIONNAIRE'; active: boolean; password: string };

export default function AccountsPage() {
  const me = useAdmin((s) => s.user);
  const { data, error, reload } = useFetch<AdminUser[]>(me?.role === 'ADMIN' ? '/api/v1/admin/users' : null);
  const toast = useToast((s) => s.show);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState('');

  if (me?.role !== 'ADMIN') return <Alert>Cette page est réservée aux administrateurs.</Alert>;

  const save = async () => {
    if (!draft) return;
    setFormError('');
    const body = { ...draft, full_name: draft.full_name || null, email: draft.email || null, password: draft.password || null };
    try {
      await api(draft.id ? `/api/v1/admin/users/${draft.id}` : '/api/v1/admin/users', { method: draft.id ? 'PUT' : 'POST', body });
      toast(draft.id ? 'Compte mis à jour' : 'Compte créé'); setDraft(null); reload();
    } catch (e) { setFormError((e as Error).message); }
  };

  return (
    <>
      <PageTitle title="Comptes équipe" subtitle="Les administrateurs gèrent tout ; les gestionnaires s'occupent des commandes, du catalogue et du stock."
        actions={<Btn onClick={() => setDraft({ username: '', full_name: '', email: '', role: 'GESTIONNAIRE', active: true, password: '' })}>+ Nouveau compte</Btn>} />
      {error && <Alert>{error}</Alert>}
      <Card pad={12}>
        {!data ? <Spin /> : (
          <Table head={['Identifiant', 'Nom', 'E-mail', 'Rôle', 'Statut', 'Dernière connexion', '']}>
            {data.map((u) => (
              <tr key={u.id}>
                <td style={{ ...td, fontWeight: 500 }}>{u.username}{u.id === me.id && <span style={{ color: A.faint, fontWeight: 400 }}> (vous)</span>}</td>
                <td style={td}>{u.full_name || '—'}</td>
                <td style={{ ...td, color: A.muted }}>{u.email || '—'}</td>
                <td style={td}><Badge tone={u.role === 'ADMIN' ? 'gold' : 'cream'}>{u.role === 'ADMIN' ? 'Administrateur' : 'Gestionnaire'}</Badge></td>
                <td style={td}><Badge tone={u.active ? 'green' : 'red'}>{u.active ? 'Actif' : 'Désactivé'}</Badge></td>
                <td style={{ ...td, color: A.muted }}>{u.last_login_at ? formatDate(u.last_login_at, true) : 'Jamais'}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <Btn small variant="ghost" onClick={() => setDraft({ id: u.id, username: u.username, full_name: u.full_name || '', email: u.email || '', role: u.role, active: u.active, password: '' })}>Modifier</Btn>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {draft && (
        <Modal title={draft.id ? 'Modifier le compte' : 'Nouveau compte'} onClose={() => { setDraft(null); setFormError(''); }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <AField label="Identifiant"><AInput value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} autoFocus /></AField>
            <AField label="Nom complet"><AInput value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} /></AField>
            <AField label="E-mail" full><AInput type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></AField>
            <AField label="Rôle">
              <ASelect value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Draft['role'] })}>
                <option value="GESTIONNAIRE">Gestionnaire</option>
                <option value="ADMIN">Administrateur</option>
              </ASelect>
            </AField>
            <AField label={draft.id ? 'Nouveau mot de passe' : 'Mot de passe'} hint={draft.id ? 'Laisser vide pour ne pas changer' : '8 caractères, lettres et chiffres'}>
              <AInput type="password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} autoComplete="new-password" />
            </AField>
            <label className="flex items-center gap-3 sm:col-span-2" style={{ fontSize: 13 }}>
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} style={{ accentColor: A.gold, width: 16, height: 16 }} /> Compte actif
            </label>
          </div>
          {formError && <div className="mt-4"><Alert>{formError}</Alert></div>}
          <div className="flex justify-end gap-2 mt-6"><Btn variant="ghost" onClick={() => setDraft(null)}>Annuler</Btn><Btn onClick={save}>Enregistrer</Btn></div>
        </Modal>
      )}
    </>
  );
}
