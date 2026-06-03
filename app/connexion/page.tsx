'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
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
      const user = useAuthStore.getState().user;
      if (user && ['admin', 'staff'].includes(user.role)) {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const inscriptionHref = redirectTo !== '/'
    ? `/inscription?redirect=${encodeURIComponent(redirectTo)}`
    : '/inscription';

  return (
    <div className="min-h-screen flex" style={{ background: '#1A1F0E' }}>
      {/* Left decorative */}
      <div className="hidden lg:block flex-1 relative">
        <Image src="/images/hero/hero-02.png" alt="La Catena" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,31,14,0.1) 0%, rgba(26,31,14,0.6) 100%)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img src="/images/highQuality.png" alt="La Catena" style={{ width: 160, height: 160, objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(232,185,106,0.25))' }} />
          <p style={{ fontSize: 10, letterSpacing: '3px', color: 'rgba(240,234,210,0.5)', textTransform: 'uppercase', marginTop: 20 }}>Boutique Multibrand</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '48px 40px', maxWidth: 480, margin: '0 auto' }}>
        <Link href="/" className="flex flex-col items-center mb-8">
          <Image src="/images/noBack.png" alt="La Catena" width={220} height={220} className="object-contain" style={{ filter: 'drop-shadow(0 0 16px rgba(232,185,106,0.22)) brightness(1.1)' }} priority />
        </Link>

        {/* Message contextuel si redirection depuis le panier */}
        {redirectTo === '/commande' && (
          <div className="w-full mb-6" style={{ background: 'rgba(232,185,106,0.08)', border: '0.5px solid rgba(232,185,106,0.25)', borderRadius: 4, padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.5px' }}>
              Connectez-vous pour finaliser votre commande
            </p>
          </div>
        )}

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
          <Link href={inscriptionHref} style={{ color: 'var(--gold)' }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
