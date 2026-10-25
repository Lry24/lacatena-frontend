'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { A, AField, AInput, Alert, Btn } from '@/components/admin/kit';
import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types';
import { useAdmin } from '@/store/admin';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAdmin((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api<{ token: string; user: AdminUser }>('/api/v1/admin/auth/login', { method: 'POST', body: { username, password } });
      login(res.token, res.user);
      const next = params.get('suite');
      router.replace(next && next.startsWith('/admin') ? next : '/admin');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <AField label="Identifiant ou e-mail"><AInput value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required /></AField>
      <AField label="Mot de passe">
        <div className="relative">
          <AInput type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required style={{ paddingRight: 70 }} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ fontSize: 11, color: A.muted }}>{show ? 'Masquer' : 'Afficher'}</button>
        </div>
      </AField>
      {error && <Alert>{error}</Alert>}
      <Btn type="submit" disabled={loading} style={{ padding: '12px 16px', marginTop: 4 }}>{loading ? 'Connexion…' : 'Se connecter'}</Btn>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center p-4" style={{ minHeight: '100vh', background: `radial-gradient(ellipse at top, #2D3A0F 0%, ${A.bg} 60%)` }}>
      <div className="w-full" style={{ maxWidth: 400 }}>
        <div className="flex flex-col items-center mb-8">
          <Image src="/images/noBack.png" alt="La Catena" width={180} height={80} priority style={{ objectFit: 'contain' }} />
          <span className="chain-divider mt-3">⊙⊙⊙⊙⊙⊙⊙⊙</span>
        </div>
        <div style={{ background: A.surface, border: `1px solid ${A.border}`, borderRadius: 12, padding: 28 }}>
          <h1 className="font-serif" style={{ fontSize: 26, color: '#fff', marginBottom: 4 }}>Espace équipe</h1>
          <p style={{ fontSize: 13, color: A.muted, marginBottom: 24 }}>Commandes, catalogue et stock de la boutique.</p>
          <Suspense fallback={null}><LoginForm /></Suspense>
        </div>
        <p className="text-center mt-6"><Link href="/" style={{ fontSize: 12, color: A.faint }}>← Retour à la boutique</Link></p>
      </div>
    </div>
  );
}
