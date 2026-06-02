# La Catena — Charte de design pour Claude

Référence de marque extraite de `la_catena_brand_guidelines.html` (v1.0 — 2026).
À appliquer systématiquement dans tout code frontend généré pour ce projet.

---

## Identité de marque

- **Nom** : La Catena
- **Tagline** : Boutique Multibrand
- **Positionnement** : Boutique mode premium multimarque — élégante, curative, ancrée
- **Ton** : Sophistiqué sans être distant. Accessible sans être banal. Chaque pièce choisie avec intention.

---

## 01 — Palette de couleurs

| Nom        | Hex       | Rôle                          |
|------------|-----------|-------------------------------|
| Or Catena  | `#E8B96A` | **Couleur principale** — accents, titres, CTA |
| Vert Olive | `#4A6020` | Couleur signature — fonds secondaires |
| Forêt      | `#2D3A0F` | Foncé / fond alternatif       |
| Nuit       | `#1A1F0E` | **Fond premium** (fond par défaut dark) |
| Ivoire     | `#F5EDD8` | Fond clair — version light    |
| Crème      | `#F0EAD2` | Texte principal sur fond sombre |

### Variables CSS à utiliser

```css
--gold:          #E8B96A;
--gold-dim:      rgba(232, 185, 106, 0.3);
--gold-faint:    rgba(232, 185, 106, 0.5);
--olive:         #4A6020;
--forest-dark:   #2D3A0F;
--forest:        #1A1F0E;   /* fond par défaut */
--ivory:         #F5EDD8;
--cream:         #F0EAD2;
--cream-muted:   rgba(240, 234, 210, 0.45);
--cream-subtle:  rgba(240, 234, 210, 0.15);
--border:        rgba(240, 234, 210, 0.1);
```

### Règle d'usage couleur

- `#E8B96A` (Or) **uniquement sur fond Olive `#4A6020` ou Forêt `#1A1F0E` / `#2D3A0F`**
- Ne jamais utiliser d'autres couleurs que la palette officielle
- Les fonds surface (cartes, panneaux) : `rgba(255,255,255,0.03)` avec border `rgba(255,255,255,0.07)`

---

## 02 — Typographie

### Familles

| Famille            | Usage                                              | Poids         |
|--------------------|----------------------------------------------------|---------------|
| **DM Serif Display** | Titres (H1), noms de marques, éléments héroïques | Regular (400), Italic |
| **DM Sans**        | Corps, sous-titres, labels, navigation             | Light (300), Regular (400), Medium (500) |

### Hiérarchie typographique

| Niveau | Taille | Style                           | Couleur       |
|--------|--------|---------------------------------|---------------|
| H1     | 32px+  | DM Serif Display, tracking -1px | `#E8B96A`     |
| H2     | 20px   | DM Sans Light (300)             | `#F0EAD2`     |
| Label  | 10px   | DM Sans, UPPERCASE, tracking 3px | `#E8B96A`    |
| Corps  | 13px   | DM Sans Regular, line-height 1.7 | `rgba(240,234,210,0.55)` |

### Import Google Fonts

```tsx
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["300","400","500"] });
const dmSerif = DM_Serif_Display({ variable: "--font-dm-serif", subsets: ["latin"], weight: "400", style: ["normal","italic"] });
```

### Variables CSS fonts

```css
--font-sans:  var(--font-dm-sans);
--font-serif: var(--font-dm-serif);
```

---

## 03 — Logo

Composé de 3 éléments :
1. **Wordmark** : "La Catena" — DM Serif Display, tracking -0.5px
2. **Motif chaîne** : `⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙` (caractère ⊙, letter-spacing 1px, opacity 0.7)
3. **Badge tagline** : "BOUTIQUE MULTIBRAND" — pill, 7.5px, letter-spacing 3px, UPPERCASE

### 3 variantes logo

| Variante     | Fond       | Texte logo | Badge tagline                  |
|--------------|------------|------------|-------------------------------|
| Principale   | `#4A6020`  | `#E8B96A`  | bg `#E8B96A`, texte `#3D5018` |
| Claire       | `#F5EDD8`  | `#3D5018`  | bg `#3D5018`, texte `#F5EDD8` |
| Nuit         | `#1A1F0E`  | `#E8B96A`  | outline `rgba(232,185,106,0.3)`, texte `#E8B96A` |

### Zone d'exclusion

Espace minimum autour du logo = hauteur du texte "La Catena". Ne jamais coller d'éléments.

---

## 04 — Règles d'usage (À faire / À éviter)

### À faire
- Utiliser Or Catena `#E8B96A` sur fond Olive ou Forêt uniquement
- Respecter la zone d'exclusion autour du logo
- Conserver les proportions originales du logo
- Utiliser DM Serif Display pour **tous** les titres
- Laisser respirer les compositions — **espaces généreux**

### À éviter
- Ne pas étirer ou déformer le logo
- Ne pas placer le logo sur fond photographique sans voile sombre
- Ne pas utiliser d'autres couleurs que la palette officielle
- Ne pas ajouter d'ombres portées ou d'effets sur le logo
- Ne pas mélanger les fontes avec d'autres familles typographiques

---

## 05 — Tone & Positionnement

| Mot-clé   | Description |
|-----------|-------------|
| **Élégant**  | Sophistiqué sans être distant. Accessible sans être banal. |
| **Curatif**  | Une sélection pensée, chaque pièce choisie avec intention. |
| **Ancré**    | Identité forte, univers cohérent, présence mémorable. |

**Langue principale** : Français (tous les textes UI visibles).

---

## 06 — Éléments graphiques signature

### Motif chaîne (identitaire central)

```
Grande taille :  ⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙⊙  (28px, DM Serif, color #E8B96A, letter-spacing 2px)
Séparateur    :  ligne gradient  linear-gradient(90deg, transparent, #E8B96A 20%, #E8B96A 80%, transparent), opacity 0.4
```

### Badges tagline

```html
<!-- Badge filled -->
<span style="background:#E8B96A; color:#3d5018; padding:5px 18px; border-radius:20px;
             font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:500;">
  Boutique Multibrand
</span>

<!-- Badge outline -->
<span style="border:1px solid rgba(232,185,106,0.5); color:#E8B96A; padding:5px 18px;
             border-radius:20px; font-size:10px; letter-spacing:3px; text-transform:uppercase;">
  Boutique Multibrand
</span>
```

### Séparateur de section

```tsx
<div className="flex items-center gap-4 mb-12">
  <p style={{ fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "var(--cream-muted)" }}>
    Titre de section
  </p>
  <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
</div>
```

---

## 07 — Spacing

Échelle contrainte (ne pas utiliser de valeurs arbitraires) :

`4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 48 · 56 · 64 · 80px`

Padding de page : `48px 40px` (desktop) · `24px 16px` (mobile).

---

## 08 — Surfaces / Cartes

```css
/* Carte standard */
background: rgba(255, 255, 255, 0.025);
border: 0.5px solid rgba(255, 255, 255, 0.07);
border-radius: 8px;

/* Carte légère */
background: rgba(240, 234, 210, 0.04);
border: 0.5px solid rgba(240, 234, 210, 0.1);
border-radius: 8px;
```

---

## 09 — Skills actifs

Les skills suivants sont installés dans `.claude/skills/` et doivent guider les décisions UI :

| Skill           | Application principale |
|-----------------|----------------------|
| `refactoring-ui` | Hiérarchie visuelle, spacing, couleurs, système de design |
| `hooked-ux`      | Boucles d'engagement, triggers email, wishlist, rétention |
