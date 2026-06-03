'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminConnexionPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.replace('/admin');
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      if (!user || !['admin', 'staff'].includes(user.role)) {
        useAuthStore.getState().logout();
        setError('Accès non autorisé. Compte administrateur requis.');
        return;
      }
      router.replace('/admin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1209',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: 'var(--font-dm-sans)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#1e2411',
        border: '1px solid rgba(240,234,210,0.08)',
        borderRadius: 12, padding: '40px 36px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 24, color: '#E8B96A', fontFamily: 'var(--font-dm-serif)', letterSpacing: '-0.5px', marginBottom: 6 }}>
            La Catena
          </div>
          <div style={{ fontSize: 10, color: 'rgba(240,234,210,0.4)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Espace Administration
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(201,99,74,0.1)',
              border: '1px solid rgba(201,99,74,0.3)',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#c9634a', marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.5)', marginBottom: 8 }}>
              Adresse e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lacatena.com"
              required
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(240,234,210,0.1)',
                borderRadius: 8, color: '#f0ead2', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,210,0.5)', marginBottom: 8 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(240,234,210,0.1)',
                borderRadius: 8, color: '#f0ead2', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(232,185,106,0.4)' : '#E8B96A',
              border: 'none', borderRadius: 8,
              color: '#1a1f0e', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
