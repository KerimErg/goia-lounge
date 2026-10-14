/**
 * Lancé à chaque déploiement Vercel (après les migrations) — sans risque pour les données :
 * 1. base vide OU incomplète (réglages, carte, horaires ou salle manquants) et aucune réservation
 *    → la remplit : carte, horaires, salle (sans réservations fictives) ;
 * 2. ADMIN_EMAIL + ADMIN_PASSWORD renseignés et compte absent → crée l'accès propriétaire.
 * Un compte existant n'est jamais modifié (le mot de passe changé dans l'admin est conservé).
 * Connexion DIRECTE (DATABASE_URL_UNPOOLED) : plus fiable que la connexion partagée pour ces opérations.
 */
import { spawnSync } from "node:child_process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const direct = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasourceUrl: direct });

async function counts() {
  const [settings, categories, items, hours, tables, reservations, users] = await Promise.all([
    prisma.settings.count(), prisma.menuCategory.count(), prisma.menuItem.count(), prisma.openingHours.count(),
    prisma.table.count(), prisma.reservation.count(), prisma.user.count(),
  ]);
  return { settings, categories, items, hours, tables, reservations, users };
}

async function main() {
  let c = await counts();
  console.log("→ État de la base :", JSON.stringify(c));
  const complete = c.settings > 0 && c.categories > 0 && c.items > 0 && c.hours > 0 && c.tables > 0;
  if (!complete) {
    if (c.reservations > 0) {
      console.warn("⚠ Base incomplète mais des réservations existent : remplissage automatique ignoré pour ne rien effacer.");
    } else {
      console.log("→ Base vide ou incomplète : installation de la carte, des horaires et de la salle…");
      const r = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: direct, SEED_ALLOW_RESET: "yes", SEED_DEMO: "no", SEED_SKIP_ADMIN: "yes" },
      });
      if (r.status !== 0) { console.error("✗ Remplissage de la base échoué", r.error ?? ""); process.exit(r.status ?? 1); }
      c = await counts();
      console.log("✓ Base remplie :", JSON.stringify(c));
    }
  }
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (email && password.length < 10) console.warn("⚠ ADMIN_PASSWORD fait moins de 10 caractères : accès propriétaire NON créé.");
  if (email && password.length >= 10 && !(await prisma.user.findUnique({ where: { email } }))) {
    await prisma.user.create({ data: { email, name: process.env.ADMIN_NAME?.trim() || "Propriétaire", role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) } });
    console.log(`✓ Accès propriétaire créé : ${email}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
