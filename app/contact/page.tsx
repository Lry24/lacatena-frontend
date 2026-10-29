import type { Metadata } from 'next';
import ShopShell from '@/components/layout/ShopShell';
import { PageHeading, SectionTitle } from '@/components/ui';

export const metadata: Metadata = { title: 'Contact' };

const CARDS = [
  { title: 'La boutique', lines: ['Boulevard du 13 Janvier', 'Lomé, Togo', 'Lun – Sam · 9h – 19h'] },
  { title: 'Téléphone & WhatsApp', lines: ['+228 90 00 00 00', 'Réponse dans l’heure', 'aux heures d’ouverture'] },
  { title: 'E-mail', lines: ['contact@lacatena.tg', 'Rappelez votre numéro de', 'commande (LC-…) si besoin'] },
];

const FAQ = [
  { q: 'Comment se passe une commande ?', a: 'Vous commandez sans créer de compte. Notre équipe vous appelle pour confirmer les tailles, l’adresse et le paiement, puis prépare vos pièces. Vous suivez chaque étape avec votre numéro de commande.' },
  { q: 'Quels sont les délais et frais de livraison ?', a: 'À Lomé : 2 000 FCFA en 24 à 48 h (offerte dès 50 000 FCFA d’articles) ou express le jour même. Intérieur du pays : envoi par agence en 2 à 4 jours. Le retrait en boutique est toujours gratuit.' },
  { q: 'Comment payer ?', a: 'En espèces à la livraison ou en boutique, ou par Mobile Money (Flooz, T-Money) après notre appel de confirmation. Aucun paiement n’est demandé sur le site.' },
  { q: 'Puis-je échanger une pièce ?', a: 'Oui, sous 7 jours, si la pièce n’a pas été portée et conserve ses étiquettes. Passez en boutique ou contactez-nous pour organiser l’échange.' },
];

export default function ContactPage() {
  return (
    <ShopShell narrow>
      <PageHeading eyebrow="Nous écrire, nous rendre visite" title="Contact">
        Une question sur une taille, une pièce ou une commande ? Notre équipe vous répond avec plaisir.
      </PageHeading>
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {CARDS.map((c) => (
          <div key={c.title} style={{ background: 'rgba(var(--fg-rgb),0.025)', border: '0.5px solid rgba(var(--fg-rgb),0.07)', borderRadius: 8, padding: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>{c.title}</p>
            {c.lines.map((l, i) => <p key={l} style={{ fontSize: i === 0 ? 17 : 13, color: i === 0 ? 'var(--cream)' : 'var(--cream-muted)', lineHeight: 1.7 }} className={i === 0 ? 'font-serif' : ''}>{l}</p>)}
          </div>
        ))}
      </div>
      <div id="livraison">
        <SectionTitle>Questions fréquentes</SectionTitle>
        <div className="flex flex-col">
          {FAQ.map((f) => (
            <details key={f.q} className="group" style={{ borderBottom: '0.5px solid var(--border)', padding: '20px 0' }}>
              <summary className="flex justify-between items-center cursor-pointer list-none font-serif" style={{ fontSize: 20, color: 'var(--cream)' }}>
                {f.q}<span className="transition-transform group-open:rotate-45" style={{ color: 'var(--gold)', fontSize: 22 }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: 'var(--cream-muted)', lineHeight: 1.8, marginTop: 12, maxWidth: 720 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </ShopShell>
  );
}
