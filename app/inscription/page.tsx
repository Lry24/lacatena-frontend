'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import { register, verifyOtp } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function InscriptionPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    setError('');
    try {
      await register({ email, phone: phone || undefined, first_name: firstName, last_name: lastName, password });
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOtp({ email, otp });
      await login({ email, password });
      router.push('/mon-compte');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Code incorrect ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#1A1F0E', padding: '48px 24px' }}>
      <Link href="/" className="flex flex-col items-center mb-12">
        <span className="font-serif text-2xl" style={{ color: 'var(--gold)', letterSpacing: '-0.5px' }}>La Catena</span>
        <span style={{ fontSize: 9, letterSpacing: '3px', color: 'var(--cream-muted)', textTransform: 'uppercase', marginTop: 4 }}>Boutique Multibrand</span>
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= s ? 'var(--gold)' : 'transparent',
              border: `0.5px solid ${step >= s ? 'var(--gold)' : 'rgba(240,234,210,0.2)'}`,
              color: step >= s ? '#2D3A0F' : 'var(--cream-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 500,
            }}>
              {s}
            </div>
            {s < 2 && <div style={{ width: 32, height: 1, background: step > s ? 'var(--gold)' : 'rgba(240,234,210,0.15)' }} />}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 440 }}>
        {step === 1 ? (
          <>
            <h1 className="font-serif mb-2 text-center" style={{ fontSize: 32, color: 'var(--cream)' }}>Créer un compte</h1>
            <p className="mb-8 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
              Rejoignez la communauté La Catena
            </p>

            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Ama" />
                <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Kofi" />
              </div>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com" />
              <Input label="Téléphone (optionnel)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+228 ..." />
              <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="8 caractères minimum" />
              <Input label="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" error={confirmPassword && password !== confirmPassword ? 'Les mots de passe ne correspondent pas' : undefined} />

              {error && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full uppercase font-medium tracking-widest mt-2 transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                {loading ? 'Création...' : 'Créer le compte'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-serif mb-2 text-center" style={{ fontSize: 32, color: 'var(--cream)' }}>Vérification</h1>
            <p className="mb-2 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
              Un code a été envoyé à votre email
            </p>
            <p className="mb-8 text-center font-medium" style={{ fontSize: 13, color: 'var(--gold)' }}>{email}</p>

            <form onSubmit={handleStep2} className="flex flex-col gap-6">
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', textAlign: 'center', marginBottom: 16 }}>
                  Code OTP (6 chiffres)
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  placeholder="000000"
                  className="w-full text-center text-3xl font-serif tracking-widest outline-none transition-all"
                  style={{
                    background: 'rgba(240,234,210,0.05)',
                    border: '0.5px solid rgba(240,234,210,0.1)',
                    borderRadius: 4,
                    color: 'var(--gold)',
                    padding: '20px',
                    letterSpacing: '12px',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
                />
              </div>

              {error && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)', textAlign: 'center' }}>{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                {loading ? 'Vérification...' : 'Vérifier et accéder'}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
          Déjà un compte ?{' '}
          <Link href="/connexion" style={{ color: 'var(--gold)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
