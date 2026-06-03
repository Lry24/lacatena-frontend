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
        background: '#1e2614',
        border: '1px solid rgba(255,255,255,0.11)',
        borderRadius: 12, padding: '40px 36px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/images/noBack.png" alt="La Catena" style={{ width: 90, height: 90, objectFit: 'contain', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 10, color: 'rgba(240,234,210,0.45)', letterSpacing: '3px', textTransform: 'uppercase' }}>
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
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>
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
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>
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
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, color: 'rgba(255,255,255,0.92)', fontSize: 14,
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
              color: '#1c2310', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginBottom: 16,
            }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '1px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E8B96A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              &larr; Retour au site
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
