# La Catena — Boutique en ligne

Frontend Next.js 16 de La Catena (charte : Or `#E8B96A`, Olive `#4A6020`, Nuit `#1A1F0E`, DM Serif Display + DM Sans,
voir `.claude/CLAUDE.md`). Il consomme l'API du dossier `lacatena-backend`.

```bash
npm install
npm run dev -- -p 3001        # http://localhost:3001
```

L'adresse de l'API se règle avec `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:8000`).

## Boutique

| Page | Rôle |
|---|---|
| `/` | Accueil : univers, nouveautés, meilleures ventes |
| `/boutique` | Catalogue : univers et rayons, tailles, prix, marques, promos, tri |
| `/produits/[slug]` | Fiche : galerie, tailles avec stock, ajout au panier, favoris |
| `/panier`, `/commande` | Panier puis commande **sans compte** (coordonnées mémorisées sur l'appareil) |
| `/commande/confirmation` | Numéro de commande, facture PDF |
| `/suivi` | Suivi par numéro de commande + téléphone |
| `/mes-commandes`, `/favoris` | Historique et favoris gardés sur l'appareil |

## Administration (`/admin`)

Tableau de bord (ventes, statuts, alertes de stock), commandes (confirmation, préparation, remise, annulation,
paiements, notes internes, facture), produits (photos, tailles et stock), catégories, stock (réceptions, pertes,
inventaires), clients, paiements, frais de livraison, comptes de l'équipe et réglages (bandeau d'annonce).
