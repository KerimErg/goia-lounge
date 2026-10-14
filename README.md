# GOIA Lounge

Site et système de réservation de **GOIA Lounge**, chicha lounge à Kehl.
Base technique reprise du site `KerimErg/location` (Next.js 15, Tailwind + shadcn/ui, Prisma + PostgreSQL, NextAuth), adaptée à la restauration :
véhicules → **tables**, agences → **zones**, jours de location → **créneaux horaires**.

> 🚧 Construction par étapes : 1. base + seed ✓ → **2. design + accueil ✓** → 3. carte → 4. réservation + plan de salle → 5. privatisation + contact → 6. admin → 7. légal + SEO.

## Démarrage local

```bash
npm install
cp .env.example .env        # renseignez DATABASE_URL, DATABASE_URL_UNPOOLED, NEXTAUTH_SECRET
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

## Réservations automatiques

- Confirmation immédiate, sans intervention : table attribuée automatiquement (la plus petite qui convient).
- **Plafonds** (réglages en base) : 8 personnes max en ligne (au-delà : Instagram), **45 personnes présentes max**, **12 arrivées max par créneau de 30 min** pour éviter le rush ; durée d'une table 2 h 30.
- Verrou PostgreSQL par soirée + contrainte d'exclusion : ni surréservation ni double réservation, même en cas de clics simultanés.
- E-mails (Resend) : confirmation au client avec lien d'annulation (jusqu'à 3 h avant), copie à l'établissement (`NOTIFY_EMAIL`), récapitulatif de la soirée chaque jour vers 16 h (Vercel Cron).
- Salle : Intérieur (20 tables) et Terrasse (10 tables), à ajuster dans l'admin.

## RGPD / DSGVO

- Impressum et Datenschutzerklärung complètes (DE / FR / EN) — **compléter `src/content/legal.ts`** (exploitant, téléphone, e-mail, USt-IdNr).
- Bandeau de confidentialité : aucun cookie publicitaire ni de mesure d'audience ; la carte OpenStreetMap ne se charge qu'avec l'accord du visiteur (rappelable dans le pied de page).
- Conservation : empreintes anti-abus effacées après 24 h, clients anonymisés 12 mois après leur dernière visite (cron quotidien).

## Déploiement Vercel (résumé, détaillé à l'étape 7)

1. Base Neon : dans Vercel, onglet **Storage → Neon → Connect** (crée `DATABASE_URL` et `DATABASE_URL_UNPOOLED` automatiquement). Ou à la main : connexion **poolée** dans `DATABASE_URL`, **directe** dans `DATABASE_URL_UNPOOLED`.
2. Variables Vercel (Production + Preview) : `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (= domaine exact), puis pour les e-mails `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL`, et `CRON_SECRET`.
3. Le script `vercel-build` exécute `prisma generate && prisma migrate deploy && next build` : les migrations sont appliquées à chaque déploiement.
4. Premier déploiement : la base vide est remplie automatiquement (carte, horaires, salle, sans données de démo) et l'accès propriétaire est créé depuis `ADMIN_EMAIL` / `ADMIN_PASSWORD` (voir `scripts/bootstrap.ts`).

## Design de l'accueil

Simple et lisible, inspiré des sites de grands lounges : peu de texte, titres clairs.

1. **Accueil plein écran** : ambiance du lounge en fond, fumée, logo, une phrase, « Réserver une table » et « Voir la carte », bandeau horaires / adresse / Instagram.
2. **Bienvenue** : une photo, une phrase, un bouton.
3. **Notre carte** : Chichas, Boissons, Desserts (photo + une ligne) et « Voir toute la carte ».
4. **Galerie** : 4 photos + Instagram.
5. **Événements / Avis** : seulement s'ils sont publiés dans l'admin.
6. **Réserver une table** puis **Nous trouver** (adresse, horaires, accès, carte OSM).

- **Couleurs du logo** : encre `#1B1511`, taupe `#7A6A5A`, ivoire `#F7F2EA`, lin `#ECE4D7`, marbre vert `#0F3B3C`, ambre `#C98A45` (petits accents).
- **Typographies** auto-hébergées (DSGVO) : Italiana (titres), Jost (texte).
- **Photos basse définition** (≈ 450 px) : affichées petites pour rester nettes ; les grands fonds sont floutés volontairement. Remplacez-les dans `src/content/media.ts` par des originaux HD ou une vidéo (`public/videos/`).
- **Aucune donnée inventée à l'accueil** : pas de prix, coordonnées provisoires masquées.

> ⚠️ La carte (chichas, boissons, prix) et les 3 événements créés par le seed sont des **exemples** : les événements sont créés non publiés, la carte doit être remplacée par la vraie avant la mise en ligne.

## À compléter

Adresse (provisoire : Bahnhofstraße 6, 77694 Kehl, à confirmer), téléphone, WhatsApp, email, horaires réels, carte réelle, photos haute définition (les actuelles font ≈ 450 px), vidéo du lieu pour le hero.
