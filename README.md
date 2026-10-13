# GOIA Lounge

Site et système de réservation de **GOIA Lounge**, chicha lounge à Kehl.
Base technique reprise du site `KerimErg/location` (Next.js 15, Tailwind + shadcn/ui, Prisma + PostgreSQL, NextAuth), adaptée à la restauration :
véhicules → **tables**, agences → **zones**, jours de location → **créneaux horaires**.

> 🚧 Construction par étapes : 1. base + seed ✓ → **2. design + accueil ✓** → 3. carte → 4. réservation + plan de salle → 5. privatisation + contact → 6. admin → 7. légal + SEO.

## Démarrage local

```bash
npm install
cp .env.example .env        # renseignez DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET
npm run db:deploy           # applique les migrations (prisma/migrations)
SEED_ADMIN_PASSWORD="un-mot-de-passe" npm run db:seed
npm run dev                 # http://localhost:3000 → redirige vers /fr
```

Admin : http://localhost:3000/admin (identifiants affichés par le seed).

## Points techniques importants

- **Heures** : tout est stocké en UTC et converti depuis l'heure de Kehl (`src/lib/time.ts`). Ne jamais utiliser `new Date(année, mois, jour, heure)` : sur Vercel, l'heure du serveur est UTC.
- **Anti-double réservation** : contrainte d'exclusion PostgreSQL (`btree_gist`) sur `ReservationTable`. Deux réservations actives ne peuvent pas se chevaucher sur une même table, même en cas de clics simultanés. Une annulation ou un no-show libère la table automatiquement (déclencheur SQL).
- **Langues** : `/fr` (par défaut), `/de`, `/en` avec next-intl. Textes d'interface dans `src/messages/*.json` ; contenus (carte, zones, événements) traduits en base `{fr, de, en}`.
- **Admin** : `/admin`, réservé à l'équipe (rôles ADMIN / STAFF). Les clients n'ont pas de compte.

## Déploiement Vercel (résumé, détaillé à l'étape 7)

1. Base Neon : copier la connexion **poolée** dans `DATABASE_URL` (avec `pgbouncer=true`) et la **directe** dans `DIRECT_URL`.
2. Variables Vercel (Production + Preview) : `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (= domaine exact).
3. Le script `vercel-build` exécute `prisma generate && prisma migrate deploy && next build` : les migrations sont appliquées à chaque déploiement.
4. Seed (une seule fois, depuis votre machine) : `DATABASE_URL="<directe>" DIRECT_URL="<directe>" SEED_ALLOW_RESET=yes SEED_ADMIN_PASSWORD="…" npm run db:seed`.

## Direction artistique « Taupe & marbre »

Tirée du logo officiel (taupe `#7A6A5A`, lettres ivoire) et des photos du lieu ; le sombre est réservé aux moments immersifs.

| Rôle | Couleur | D'où elle vient |
|---|---|---|
| Taupe | `#7A6A5A` | fond du logo : sections Ambiance et Réservation, menu mobile |
| Ivoire / lin | `#F7F2EA` / `#ECE4D7` | lettres du logo : sections claires |
| Marbre vert | `#0F3B3C` | tables en marbre : section « À table » (veines générées en SVG) |
| Ambre | `#C98A45` | lumière derrière le verre cannelé : petits accents seulement |
| Encre | `#1B1511` | hero et pied de page |

- **Motif** : l'arche, reprise des niches lumineuses du lounge (cadre du hero, galerie, photo flottante).
- **Typographies** auto-hébergées (DSGVO) : Italiana (titres, proche du logo), Jost (texte), Cormorant Garamond italique (accents).
- **Parcours de l'accueil** : Hero (encre) → Le lieu (ivoire) → L'ambiance (taupe) → À table (marbre) → Galerie (lin) → Événements / Avis (seulement s'ils existent) → Réservation + infos pratiques (taupe) → pied de page (encre).
- **Animations** (Framer Motion, déjà présent) : rideau et masque sur le hero, titres ligne par ligne, révélations d'images par masque, parallaxe légère, galerie horizontale pilotée par le défilement (ordinateur), photo qui suit le pointeur dans « À table ». Tout est désactivé avec « réduire les animations ».
- **Fumée** : shader WebGL (bruit fractal, pas de particules), concentré autour de l'arche, rendu à demi-résolution, démarré quand le navigateur est au repos, en pause hors écran, désactivé sans GPU.
- **Vidéo du hero** : prête à l'emploi. Déposez les fichiers dans `public/videos/` et renseignez-les dans `src/content/media.ts` (paysage + portrait pour mobile, sans son, en boucle, bouton pause).
- **Aucune donnée inventée à l'accueil** : pas de prix ni de saveurs (la carte détaillée vient de l'admin), événements et avis affichés seulement s'ils sont publiés, téléphone / WhatsApp / email masqués tant qu'ils sont provisoires.

> ⚠️ La carte (chichas, boissons, prix) et les 3 événements créés par le seed sont des **exemples** : les événements sont créés non publiés, la carte doit être remplacée par la vraie avant la mise en ligne.

## À compléter

Adresse (provisoire : Bahnhofstraße 6, 77694 Kehl, à confirmer), téléphone, WhatsApp, email, horaires réels, carte réelle, photos haute définition (les actuelles font ≈ 450 px), vidéo du lieu pour le hero.
