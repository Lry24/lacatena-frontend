'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';

export default function LivraisonRetoursPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 'var(--header-offset)', minHeight: '80vh' }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 960, margin: '0 auto' }}>
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Livraison & Retours' }]} />
          
          <h1 className="font-serif mt-6 mb-8" style={{ fontSize: 'clamp(32px, 4vw, 44px)', color: 'var(--gold)' }}>
            Livraison &amp; Retours
          </h1>

          <div className="flex flex-col gap-8 text-sm" style={{ color: 'var(--cream-muted)', lineHeight: 1.8 }}>
            {/* Livraison */}
            <section style={{ background: 'rgba(240,234,210,0.03)', border: '0.5px solid rgba(240,234,210,0.1)', padding: '28px', borderRadius: 4 }}>
              <h2 className="font-serif text-lg text-[var(--cream)] mb-4 flex items-center gap-3">
                <span style={{ color: 'var(--gold)' }}>✦</span> Délais &amp; Tarifs de Livraison
              </h2>
              <div className="flex flex-col gap-3">
                <p>
                  Nous livrons dans tout le Togo ainsi que dans les principaux pays de la sous-région ouest-africaine.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, border: '0.5px solid rgba(240,234,210,0.08)' }}>
                    <p className="font-medium text-[var(--cream)]">Lomé &amp; agglomération</p>
                    <p className="text-xs text-[var(--gold)] mt-1">24 à 48 heures</p>
                    <p className="text-xs mt-1">Gratuit dès 50 000 FCFA d&apos;achat (sinon 3 500 FCFA).</p>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 4, border: '0.5px solid rgba(240,234,210,0.08)' }}>
                    <p className="font-medium text-[var(--cream)]">Intérieur du Togo &amp; International</p>
                    <p className="text-xs text-[var(--gold)] mt-1">3 à 5 jours ouvrés</p>
                    <p className="text-xs mt-1">Tarif calculé selon la zone et le poids du colis.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Retours */}
            <section style={{ background: 'rgba(240,234,210,0.03)', border: '0.5px solid rgba(240,234,210,0.1)', padding: '28px', borderRadius: 4 }}>
              <h2 className="font-serif text-lg text-[var(--cream)] mb-4 flex items-center gap-3">
                <span style={{ color: 'var(--gold)' }}>↩</span> Politique de Retours &amp; Échanges
              </h2>
              <p>
                Vous disposez d&apos;un délai de <strong>14 jours</strong> à compter de la réception de votre commande pour effectuer un retour ou demander un échange.
              </p>
              <ul className="mt-3 list-disc list-inside flex flex-col gap-2">
                <li>Les articles doivent être retournés dans leur état d&apos;origine, non portés, non lavés, avec toutes leurs étiquettes intactes.</li>
                <li>Les articles confectionnés sur mesure ou personnalisés ne sont ni repris ni échangés.</li>
                <li>Le remboursement est effectué sous 5 à 7 jours ouvrés après contrôle qualité de la pièce retournée.</li>
              </ul>
            </section>

            {/* Assistance */}
            <div style={{ padding: '24px', background: 'rgba(232,185,106,0.08)', border: '0.5px solid rgba(232,185,106,0.3)', borderRadius: 4 }}>
              <p className="text-xs uppercase tracking-widest text-[var(--gold)] font-medium mb-2">Besoin d&apos;aide ?</p>
              <p style={{ color: 'var(--cream)' }}>
                Pour toute question relative à votre livraison ou pour initier un retour, contactez notre équipe via la page{' '}
                <Link href="/contact" className="underline text-[var(--gold)] hover:opacity-80">
                  Contact
                </Link>{' '}
                ou sur WhatsApp au <strong>+228 90 12 34 56</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
