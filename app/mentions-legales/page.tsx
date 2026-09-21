'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 'var(--header-offset)', minHeight: '80vh' }}>
        <div style={{ padding: '40px 40px 80px', maxWidth: 960, margin: '0 auto' }}>
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Mentions légales' }]} />
          
          <h1 className="font-serif mt-6 mb-8" style={{ fontSize: 'clamp(32px, 4vw, 44px)', color: 'var(--gold)' }}>
            Mentions Légales
          </h1>

          <div className="flex flex-col gap-8 text-sm" style={{ color: 'var(--cream-muted)', lineHeight: 1.8 }}>
            <section style={{ background: 'rgba(240,234,210,0.03)', border: '0.5px solid rgba(240,234,210,0.1)', padding: '28px', borderRadius: 4 }}>
              <h2 className="font-serif text-lg text-[var(--cream)] mb-3">1. Éditeur du site</h2>
              <p>
                Le site <strong>La Catena</strong> est édité par la société La Catena Multibrand SARL, immatriculée au Registre du Commerce et du Crédit Mobilier de Lomé (Togo).
              </p>
              <ul className="mt-3 list-disc list-inside flex flex-col gap-1">
                <li><strong>Siège social :</strong> Boulevard de la République, Lomé, Togo</li>
                <li><strong>Téléphone :</strong> +228 90 12 34 56</li>
                <li><strong>Email :</strong> contact@lacatena.tg</li>
                <li><strong>Directeur de la publication :</strong> Direction Générale La Catena</li>
              </ul>
            </section>

            <section style={{ background: 'rgba(240,234,210,0.03)', border: '0.5px solid rgba(240,234,210,0.1)', padding: '28px', borderRadius: 4 }}>
              <h2 className="font-serif text-lg text-[var(--cream)] mb-3">2. Hébergement</h2>
              <p>
                Le site est hébergé sur des serveurs sécurisés répondant aux normes internationales de protection des données.
              </p>
            </section>

            <section style={{ background: 'rgba(240,234,210,0.03)', border: '0.5px solid rgba(240,234,210,0.1)', padding: '28px', borderRadius: 4 }}>
              <h2 className="font-serif text-lg text-[var(--cream)] mb-3">3. Propriété intellectuelle</h2>
              <p>
                Tous les éléments du site (textes, images, graphismes, logo, icônes, logiciels) sont la propriété exclusive de La Catena ou de ses marques partenaires et sont protégés par le droit d&apos;auteur et les lois sur la propriété intellectuelle.
              </p>
            </section>

            <section style={{ background: 'rgba(240,234,210,0.03)', border: '0.5px solid rgba(240,234,210,0.1)', padding: '28px', borderRadius: 4 }}>
              <h2 className="font-serif text-lg text-[var(--cream)] mb-3">4. Protection des données personnelles</h2>
              <p>
                Conformément aux réglementations relatives à la protection des données, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des données vous concernant. Pour exercer ce droit, écrivez à <strong>support@lacatena.tg</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
