'use client';
import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import { forgotPassword, resetPassword } from '@/lib/api';

export default function MotDePasseOubliePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Aucun compte associé à cet email.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    setError('');
    try {
      await resetPassword({ email, otp, new_password: newPassword });
      setStep(3);
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

      <div style={{ width: '100%', maxWidth: 400 }}>
        {step === 1 && (
          <>
            <h1 className="font-serif mb-2 text-center" style={{ fontSize: 28, color: 'var(--cream)' }}>Mot de passe oublié</h1>
            <p className="mb-8 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.6 }}>
              Saisissez votre email. Nous vous enverrons un code de réinitialisation.
            </p>
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@exemple.com" />
              {error && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full uppercase font-medium tracking-widest mt-2 transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-serif mb-2 text-center" style={{ fontSize: 28, color: 'var(--cream)' }}>Nouveau mot de passe</h1>
            <p className="mb-2 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
              Un code a été envoyé à
            </p>
            <p className="mb-8 text-center font-medium" style={{ fontSize: 13, color: 'var(--gold)' }}>{email}</p>
            <form onSubmit={handleStep2} className="flex flex-col gap-4">
              <div>
                <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 12, textAlign: 'center' }}>Code OTP</p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  placeholder="000000"
                  className="w-full text-center text-2xl font-serif tracking-widest outline-none transition-all"
                  style={{
                    background: 'rgba(240,234,210,0.05)',
                    border: '0.5px solid rgba(240,234,210,0.1)',
                    borderRadius: 4,
                    color: 'var(--gold)',
                    padding: '16px',
                    letterSpacing: '10px',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
                />
              </div>
              <Input label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="8 caractères minimum" />
              <Input
                label="Confirmer le mot de passe" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••"
                error={confirmPassword && newPassword !== confirmPassword ? 'Les mots de passe ne correspondent pas' : undefined}
              />
              {error && <p style={{ fontSize: 12, color: 'rgba(220,100,100,0.9)' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full uppercase font-medium tracking-widest mt-2 transition-colors hover:bg-[#f5cb85] disabled:opacity-40"
                style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center animate-fade-up flex flex-col items-center gap-6">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,185,106,0.15)', border: '0.5px solid rgba(232,185,106,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--gold)', fontSize: 20 }}>✓</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 28, color: 'var(--cream)' }}>Mot de passe modifié</h1>
            <p style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.7 }}>
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Link
              href="/connexion"
              className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
              style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '12px 28px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
            >
              Se connecter
            </Link>
          </div>
        )}

        {step < 3 && (
          <p className="mt-8 text-center" style={{ fontSize: 13, color: 'var(--cream-muted)' }}>
            <Link href="/connexion" style={{ color: 'var(--gold)' }}>← Retour à la connexion</Link>
          </p>
        )}
      </div>
    </div>
  );
}
