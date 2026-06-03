'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
      router.push('/mon-compte');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#1A1F0E' }}>
      {/* Left decorative */}
      <div className="hidden lg:block flex-1 relative">
        <Image src="/images/hero/hero-02.png" alt="La Catena" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,31,14,0.1) 0%, rgba(26,31,14,0.6) 100%)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="chain-divider" style={{ fontSize: 24, letterSpacing: '6px', color: 'rgba(232,185,106,0.4)' }}>⊙⊙⊙⊙⊙⊙⊙⊙</span>
          <p className="font-serif mt-4 text-center" style={{ fontSize: 32, color: 'var(--gold)', letterSpacing: '-0.5px' }}>La Catena</p>
          <p style={{ fontSize: 10, letterSpacing: '3px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginTop: 8 }}>Boutique Multibrand</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '48px 40px', maxWidth: 480, margin: '0 auto' }}>
        <Link href="/" className="flex flex-col items-center mb-12">
          <span className="font-serif text-2xl" style={{ color: 'var(--gold)', letterSpacing: '-0.5px' }}>La Catena</span>
          <span style={{ fontSize: 9, letterSpacing: '3px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginTop: 4 }}>Boutique Multibrand</span>
        </Link>

        <h1 className="font-serif mb-2 text-center" style={{ fontSize: 32, color: 'var(--cream)' }}>Connexion</h1>
        <p className="mb-10 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
          Accédez à votre espace personnel
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input
            label="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com"
          />
          <Input
            label="Mot de passe" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
          />

          {error && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{error}</p>}

          <div className="flex justify-end">
            <Link href="/mot-de-passe-oublie" style={{ fontSize: 11, color: 'var(--cream-muted)', letterSpacing: '1px' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full uppercase font-medium tracking-widest mt-2 transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
            style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-8 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
          Pas encore de compte ?{' '}
          <Link href="/inscription" style={{ color: 'var(--gold)' }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
