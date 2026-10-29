'use client';
import { useState } from 'react';
import { AField, AInput, Alert, Btn, Card, PageTitle } from '@/components/admin/kit';
import { useToast } from '@/components/ui';
import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { useAdmin } from '@/store/admin';

export default function SettingsPage() {
  const toast = useToast((s) => s.show);
  const login = useAdmin((s) => s.login);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');

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
      <div style={{ maxWidth: 560 }}>
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
