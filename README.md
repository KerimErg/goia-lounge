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

## Identité visuelle

- **Logo** : `public/images/goia/logo-goia.svg`, vectorisé depuis le logo officiel (composant `src/components/brand/logo.tsx`).
- **Couleurs** (`src/app/globals.css`) : nuit `#0E0D0C`, taupe `#7A6A5A` (fond du logo), marbre vert canard `#0B3F47`, laiton `#C9A46A`, ivoire `#F2EDE4`.
- **Polices** auto-hébergées (aucun appel à Google, conforme DSGVO) : Italiana (titres), Jost (texte), Cormorant Garamond italique (accents).
- **Accueil** : fumée animée en canvas (pause hors écran et si « réduire les animations »), apparitions au défilement, curseur doux sur ordinateur.
- **Carte OSM** chargée uniquement après clic (consentement).
- **Avis** : seuls les avis réels publiés depuis l'admin s'affichent ; sinon, invitation à laisser un avis.

## À compléter

Adresse (provisoire : Bahnhofstraße 6, 77694 Kehl, à confirmer), téléphone, WhatsApp, email, horaires réels, carte réelle, photos haute définition (les actuelles font ≈ 450 px).
