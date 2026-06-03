'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Input from '@/components/ui/Input';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: 190 }}>
        {/* Hero */}
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{ padding: '64px 40px 48px', background: '#2D3A0F', borderBottom: '0.5px solid rgba(232,185,106,0.15)' }}
        >
          <p style={{ fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(232,185,106,0.7)', marginBottom: 12 }}>
            Nous sommes la pour vous
          </p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--gold)', lineHeight: 1.1 }}>
            Parlez-nous
          </h1>
          <p className="mt-4" style={{ fontSize: 14, color: 'var(--cream-muted)', maxWidth: 480, lineHeight: 1.7 }}>
            Une question, une suggestion, ou simplement envie d&apos;echanger ?
            Notre equipe vous repond avec plaisir.
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
          style={{ padding: '64px 40px 80px', maxWidth: 1440, margin: '0 auto' }}
        >
          {/* Formulaire */}
          <div>
            <div style={{ marginBottom: 32 }}>
              <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Contact' }]} />
            </div>

            {sent ? (
              <div className="animate-fade-up flex flex-col gap-4" style={{
                padding: '40px',
                background: 'rgba(232,185,106,0.06)',
                border: '0.5px solid rgba(232,185,106,0.3)',
                borderRadius: 4,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(232,185,106,0.15)',
                  border: '0.5px solid rgba(232,185,106,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B96A" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-serif" style={{ fontSize: 24, color: 'var(--cream)' }}>Message envoye</h2>
                <p style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.7 }}>
                  Merci, <span style={{ color: 'var(--cream)' }}>{form.name}</span>.
                  Nous avons bien recu votre message et vous repondrons dans les 24 heures.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-serif mb-8" style={{ fontSize: 32, color: 'var(--cream)' }}>
                  Envoyez-nous un message
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Votre nom" value={form.name} onChange={set('name')} required placeholder="Prenom Nom" />
                    <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="vous@exemple.com" />
                  </div>

                  <div>
                    <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 8 }}>
                      Sujet
                    </p>
                    <select
                      value={form.subject}
                      onChange={set('subject')}
                      required
                      className="w-full px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(240,234,210,0.05)',
                        border: '0.5px solid rgba(240,234,210,0.1)',
                        color: form.subject ? 'var(--cream)' : 'var(--cream-muted)',
                        borderRadius: 4,
                      }}
                    >
                      <option value="" disabled>Selectionner un sujet</option>
                      <option value="commande">Ma commande</option>
                      <option value="produit">Question produit</option>
                      <option value="livraison">Livraison &amp; retours</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--cream-muted)', marginBottom: 8 }}>
                      Message
                    </p>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      rows={6}
                      required
                      placeholder="Decrivez votre demande..."
                      className="w-full px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{
                        background: 'rgba(240,234,210,0.05)',
                        border: '0.5px solid rgba(240,234,210,0.1)',
                        borderRadius: 4, color: 'var(--cream)', fontSize: 13,
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(240,234,210,0.1)'; }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="uppercase font-medium tracking-widest transition-colors hover:bg-[#f5cb85]"
                    style={{ background: 'var(--gold)', color: '#2D3A0F', padding: '14px', borderRadius: 2, fontSize: 10, letterSpacing: '2px' }}
                  >
                    Envoyer le message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Coordonnees */}
          <div className="flex flex-col gap-8">
            <h2 className="font-serif" style={{ fontSize: 32, color: 'var(--cream)' }}>Nos coordonnees</h2>

            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B96A" strokeWidth="1.6">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                ),
                title: 'Adresse',
                lines: ['Boulevard de la Republique', 'Lome, Togo'],
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B96A" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
                title: 'Horaires',
                lines: ['Lundi - Samedi : 9h a 18h', 'Dimanche : Ferme'],
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B96A" strokeWidth="1.6">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                ),
                title: 'Email',
                lines: ['contact@lacatena.tg', 'support@lacatena.tg'],
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8B96A" strokeWidth="1.6">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                  </svg>
                ),
                title: 'Telephone',
                lines: ['+228 XX XX XX XX', 'WhatsApp disponible'],
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-5"
                style={{
                  padding: '20px 24px',
                  background: 'rgba(240,234,210,0.04)',
                  border: '0.5px solid rgba(240,234,210,0.1)',
                  borderRadius: 4,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                    {item.title}
                  </p>
                  {item.lines.map((line, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--cream-muted)', lineHeight: 1.7 }}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ padding: '24px', background: '#4A6020', border: '0.5px solid rgba(232,185,106,0.2)', borderRadius: 4 }}>
              <p style={{ fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                Notre engagement
              </p>
              <p style={{ fontSize: 13, color: 'rgba(240,234,210,0.85)', lineHeight: 1.7 }}>
                Chaque message recoit une reponse personnalisee dans les 24 heures.
                Votre satisfaction est notre priorite absolue.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
