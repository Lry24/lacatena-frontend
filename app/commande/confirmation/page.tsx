'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ShopShell from '@/components/layout/ShopShell';
import { Button, Loading, label } from '@/components/ui';
import { invoiceUrl } from '@/lib/api';

const NEXT_STEPS = [
  { n: '01', title: 'Nous vous appelons', text: 'Sous quelques heures, pour confirmer les tailles, l’adresse et le paiement.' },
  { n: '02', title: 'Préparation soignée', text: 'Vos pièces sont vérifiées, repassées et emballées avec soin.' },
  { n: '03', title: 'Remise', text: 'Livraison à l’adresse indiquée ou retrait en boutique, selon votre choix.' },
];

function Confirmation() {
  const params = useSearchParams();
  const number = params.get('n') || '';
  const phone = params.get('t') || '';

  return (
    <div className="flex flex-col items-center text-center" style={{ maxWidth: 720, margin: '0 auto' }}>
      <span className="animate-fade-up flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: '50%', border: '0.5px solid rgba(232,185,106,0.5)', color: 'var(--gold)', fontSize: 28, marginBottom: 28 }}>✓</span>
      <p style={{ fontSize: 10, letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Merci pour votre confiance</p>
      <h1 className="font-serif" style={{ fontSize: 'clamp(34px, 4.5vw, 52px)', color: 'var(--cream)', lineHeight: 1.1, marginBottom: 16 }}>Votre commande est enregistrée</h1>
      <p style={{ color: 'var(--cream-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
        Gardez précieusement ce numéro : avec votre téléphone, il suffit pour suivre votre commande.
      </p>
      <div style={{ border: '0.5px solid rgba(232,185,106,0.35)', background: '#2D3A0F', padding: '20px 40px', marginBottom: 40 }}>
        <p style={{ ...label, marginBottom: 6 }}>Numéro de commande</p>
        <p className="font-serif" style={{ fontSize: 30, color: 'var(--gold)', letterSpacing: '1px' }}>{number}</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mb-16">
        <Button href={`/suivi?commande=${encodeURIComponent(number)}&tel=${encodeURIComponent(phone)}`}>Suivre ma commande</Button>
        {number && phone && (
          <a href={invoiceUrl(number, phone)} className="btn-outline hover:border-[#E8B96A]" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, padding: '14px 28px', color: 'var(--gold)', border: '0.5px solid rgba(232,185,106,0.45)' }}>
            Télécharger la facture
          </a>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-6 w-full text-left">
        {NEXT_STEPS.map((s) => (
          <div key={s.n} style={{ background: 'rgba(240,234,210,0.04)', border: '0.5px solid rgba(240,234,210,0.1)', borderRadius: 8, padding: 24 }}>
            <p className="font-serif" style={{ fontSize: 26, color: 'var(--gold)', marginBottom: 8 }}>{s.n}</p>
            <p style={{ fontSize: 14, color: 'var(--cream)', marginBottom: 6 }}>{s.title}</p>
            <p style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.6 }}>{s.text}</p>
          </div>
        ))}
      </div>
      <a href="/boutique" className="mt-12 hover:text-[#E8B96A]" style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--cream-muted)' }}>Continuer mes achats →</a>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <ShopShell>
      <Suspense fallback={<Loading />}><Confirmation /></Suspense>
    </ShopShell>
  );
}
