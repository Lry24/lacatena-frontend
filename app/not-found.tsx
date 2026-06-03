import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px' }}>
      <div className="chain-divider mb-8" style={{ fontSize: 20, letterSpacing: '6px', color: 'rgba(232,185,106,0.3)' }}>
        ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙
      </div>

      <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 16 }}>
        Erreur 404
      </p>

      <h1 className="font-serif mb-6" style={{ fontSize: 'clamp(40px, 8vw, 80px)', color: 'var(--gold)', lineHeight: 1, letterSpacing: '-2px' }}>
        Page introuvable
      </h1>

      <p style={{ fontSize: 14, color: 'var(--cream-muted)', lineHeight: 1.7, maxWidth: 400, marginBottom: 40 }}>
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil pour continuer votre exploration.
      </p>

      <div className="chain-divider mb-10" style={{ fontSize: 14, letterSpacing: '4px', color: 'rgba(232,185,106,0.2)' }}>
        ⊙⊙⊙⊙⊙⊙
      </div>

      <Link
        href="/"
        className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
        style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px 32px', borderRadius: 2, fontSize: 10, letterSpacing: '3px' }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
