'use client';
import { useEffect, useState } from 'react';
import { A, AField, AInput, Alert, Btn, Card, PageTitle } from '@/components/admin/kit';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { useAdmin } from '@/store/admin';

export default function SettingsPage() {
  const toast = useToast((s) => s.show);
  const login = useAdmin((s) => s.login);
  const [announcement, setAnnouncement] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api<{ announcement: string }>('/api/v1/admin/settings').then((s) => setAnnouncement(s.announcement)).catch(() => {}); }, []);

  const saveAnnouncement = async () => {
    try { await api('/api/v1/admin/settings', { method: 'PUT', body: { announcement } }); toast(announcement.trim() ? 'Bandeau publié sur la boutique' : 'Bandeau retiré'); }
    catch (e) { toast((e as Error).message, 'error'); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api<{ token: string; user: AdminUser }>('/api/v1/admin/auth/password', { method: 'POST', body: { current_password: current, new_password: next } });
      login(res.token, res.user);
      setCurrent(''); setNext('');
      toast('Mot de passe modifié. Les autres appareils sont déconnectés.');
    } catch (err) { setError((err as Error).message); }
  };

  return (
    <>
      <PageTitle title="Réglages" />
      <div className="grid xl:grid-cols-2 gap-4">
        <Card title="Bandeau d'annonce">
          <p style={{ fontSize: 13, color: A.muted, marginBottom: 12 }}>Affiché tout en haut de la boutique. Laissez vide pour le masquer.</p>
          <AInput value={announcement} onChange={(e) => setAnnouncement(e.target.value)} maxLength={160} placeholder="Livraison offerte à Lomé dès 50 000 FCFA" />
          {announcement && (
            <div className="mt-3 text-center" style={{ background: '#4A6020', color: A.gold, fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', padding: '8px 12px', borderRadius: 4 }}>{announcement}</div>
          )}
          <div className="flex justify-end mt-4"><Btn onClick={saveAnnouncement}>Publier</Btn></div>
        </Card>
        <Card title="Mon mot de passe">
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            <AField label="Mot de passe actuel"><AInput type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required /></AField>
            <AField label="Nouveau mot de passe" hint="8 caractères au moins, avec des lettres et des chiffres"><AInput type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required /></AField>
            {error && <Alert>{error}</Alert>}
            <div className="flex justify-end"><Btn type="submit">Changer le mot de passe</Btn></div>
          </form>
        </Card>
      </div>
    </>
  );
}
