"use client";

import { useState } from "react";

// ──────────────────────────────────────────────
// refactoring-ui: Hiérarchie visuelle à 3 niveaux
//   Primary   → DM Serif Display, grand, or
//   Secondary → DM Sans 300-400, cream
//   Tertiary  → uppercase spaced, cream-muted
//
// hooked-ux: Boucle Trigger → Action → Reward → Investment
//   Trigger   → "Nouvelles arrivées" + anticipation
//   Action    → 1 champ email, 1 CTA minimal
//   Reward    → Message de confirmation animé + badge exclusif
//   Investment → Wishlist / favoris (cœur sur les cartes)
// ──────────────────────────────────────────────

const ARRIVALS = [
  { id: 1, brand: "Jacquemus", name: "Le Bambino Long", category: "Sacs", price: "590 €", tag: "Nouveau" },
  { id: 2, brand: "Ami Paris", name: "Veste en Denim", category: "Vêtements", price: "395 €", tag: "Exclusif" },
  { id: 3, brand: "A.P.C.", name: "Demi-lune", category: "Sacs", price: "320 €", tag: "Dernier" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  function toggleWishlist(id: number) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>

      {/* ── NAV ── refactoring-ui: tertiary level, uppercase spaced */}
      <nav className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col">
          <span style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 22, color: "var(--gold)", lineHeight: 1, letterSpacing: -0.5 }}>
            La Catena
          </span>
          <span style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "var(--cream-muted)", marginTop: 4 }}>
            Boutique Multibrand
          </span>
        </div>
        <div className="hidden sm:flex gap-8">
          {["Collections", "Marques", "Nouveautés", "À propos"].map((item) => (
            <a key={item} href="#" style={{ fontSize: 13, color: "var(--cream-muted)", letterSpacing: "0.5px" }}
              className="hover:text-[#f0ead2] transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div style={{ fontSize: 9, letterSpacing: "3px", textTransform: "uppercase", color: "var(--cream-muted)" }}>
          {wishlist.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span style={{ color: "var(--gold)" }}>♥</span> {wishlist.length}
            </span>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col">

        {/* ── HERO ── refactoring-ui: Primary hierarchy + Spacing scale 48/32/16 */}
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
          {/* Tertiary label */}
          <p style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 24 }}>
            Printemps — Été 2025
          </p>

          {/* Primary: DM Serif Display */}
          <h1 style={{
            fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
            fontSize: "clamp(40px, 7vw, 80px)",
            color: "var(--cream)",
            lineHeight: 1.1,
            letterSpacing: -1,
            maxWidth: 700,
            marginBottom: 24,
          }}>
            Pièces sélectionnées.<br />
            <em style={{ color: "var(--gold)" }}>Marques choisies.</em>
          </h1>

          {/* Secondary: DM Sans 300 */}
          <p style={{ fontWeight: 300, fontSize: 18, color: "var(--cream-muted)", maxWidth: 480, lineHeight: 1.7, marginBottom: 48 }}>
            Une curation de marques contemporaines, réunies dans un seul espace pour ceux qui savent ce qu&apos;ils cherchent.
          </p>

          {/* Chain motif (brand element) */}
          <div className="chain-divider mb-12" aria-hidden="true">⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙</div>

          {/* CTA buttons — refactoring-ui: primary/secondary hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#" style={{
              background: "var(--gold)",
              color: "#1a1f0e",
              padding: "12px 32px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}>
              Découvrir
            </a>
            <a href="#" style={{
              border: "0.5px solid var(--gold-dim)",
              color: "var(--gold)",
              padding: "12px 32px",
              borderRadius: 9999,
              fontSize: 12,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}>
              Nos marques
            </a>
          </div>
        </section>

        {/* ── NOUVELLES ARRIVÉES ── hooked-ux: Variable Reward + Investment (wishlist) */}
        <section className="px-6 sm:px-12 pb-24">
          <div className="flex items-center gap-4 mb-12">
            <p style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--cream-muted)" }}>
              Nouvelles arrivées
            </p>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ARRIVALS.map((item, i) => (
              <div key={item.id} className="animate-fade-up group" style={{ animationDelay: `${i * 120}ms` }}>
                {/* Placeholder visuel */}
                <div style={{
                  background: "rgba(240,234,210,0.04)",
                  border: "0.5px solid var(--border)",
                  borderRadius: 8,
                  aspectRatio: "3/4",
                  marginBottom: 16,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Tag */}
                  <span style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    fontSize: 9,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    background: "var(--gold)",
                    color: "#1a1f0e",
                    padding: "3px 10px",
                    borderRadius: 9999,
                    fontWeight: 500,
                  }}>
                    {item.tag}
                  </span>

                  {/* hooked-ux: Investment — wishlist */}
                  <button
                    onClick={() => toggleWishlist(item.id)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(26,31,14,0.7)",
                      border: "0.5px solid var(--border)",
                      borderRadius: 9999,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: wishlist.includes(item.id) ? "var(--gold)" : "var(--cream-muted)",
                      fontSize: 14,
                      transition: "color 0.2s",
                    }}
                    aria-label="Ajouter aux favoris"
                  >
                    {wishlist.includes(item.id) ? "♥" : "♡"}
                  </button>

                  {/* Placeholder image area */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "var(--font-dm-serif), serif", fontSize: 11, color: "var(--cream-muted)", letterSpacing: 2 }}>
                      {item.brand}
                    </span>
                  </div>
                </div>

                {/* Card info — refactoring-ui: de-emphasized label, emphasized value */}
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--cream-muted)", marginBottom: 4 }}>
                      {item.brand} · {item.category}
                    </p>
                    <p style={{ fontSize: 16, color: "var(--cream)", fontWeight: 400 }}>
                      {item.name}
                    </p>
                  </div>
                  <p style={{ fontSize: 15, color: "var(--gold)", fontWeight: 500, whiteSpace: "nowrap", marginLeft: 12 }}>
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRIGGER EMAIL ── hooked-ux: External Trigger → Action (simple) → Variable Reward */}
        <section style={{ borderTop: "0.5px solid var(--border)", padding: "80px 24px" }}>
          <div className="max-w-lg mx-auto text-center">
            <p style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
              Accès prioritaire
            </p>
            <h2 style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 32, color: "var(--cream)", marginBottom: 16, lineHeight: 1.2 }}>
              Soyez les premiers informés
            </h2>
            <p style={{ fontWeight: 300, fontSize: 15, color: "var(--cream-muted)", lineHeight: 1.7, marginBottom: 40 }}>
              Nouvelles arrivées, ventes privées, et pièces en édition limitée — réservés aux membres de la liste.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  style={{
                    flex: 1,
                    background: "rgba(240,234,210,0.05)",
                    border: "0.5px solid var(--border)",
                    borderRadius: 9999,
                    padding: "11px 20px",
                    fontSize: 14,
                    color: "var(--cream)",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "var(--gold)",
                    color: "#1a1f0e",
                    borderRadius: 9999,
                    padding: "11px 24px",
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Rejoindre
                </button>
              </form>
            ) : (
              /* hooked-ux: Variable Reward → confirmation animée */
              <div className="animate-fade-up" style={{ padding: "20px 32px", border: "0.5px solid var(--gold-dim)", borderRadius: 8, display: "inline-block" }}>
                <p style={{ color: "var(--gold)", fontSize: 13, letterSpacing: 1 }}>
                  ✓ Bienvenue dans le cercle
                </p>
                <p style={{ color: "var(--cream-muted)", fontSize: 12, marginTop: 6, fontWeight: 300 }}>
                  Votre accès prioritaire est confirmé.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── refactoring-ui: tertiary, minimal */}
      <footer style={{ borderTop: "0.5px solid var(--border)", padding: "24px 32px" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "var(--font-dm-serif), serif", color: "var(--gold)", fontSize: 14 }}>
            La Catena
          </span>
          <div className="chain-divider">⊙⊙⊙⊙⊙⊙⊙⊙</div>
          <span style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--cream-muted)" }}>
            © 2025 — Boutique Multibrand
          </span>
        </div>
      </footer>
    </div>
  );
}
