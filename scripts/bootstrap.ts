/**
 * Lancé à chaque déploiement Vercel (après les migrations) — sans risque pour les données :
 * 1. base vide (aucun réglage) → la remplit une fois : carte, horaires, salle (sans réservations fictives) ;
 * 2. ADMIN_EMAIL + ADMIN_PASSWORD renseignés et compte absent → crée l'accès propriétaire.
 * Un compte existant n'est jamais modifié (le mot de passe changé dans l'admin est conservé).
 */
import { spawnSync } from "node:child_process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.settings.count()) === 0) {
    console.log("→ Base vide : installation de la carte, des horaires et de la salle…");
    const r = spawnSync("npx", ["tsx", "prisma/seed.ts"], { stdio: "inherit", env: { ...process.env, SEED_ALLOW_RESET: "yes", SEED_DEMO: "no", SEED_SKIP_ADMIN: "yes" } });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (email && password.length >= 10 && !(await prisma.user.findUnique({ where: { email } }))) {
    await prisma.user.create({ data: { email, name: process.env.ADMIN_NAME?.trim() || "Propriétaire", role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) } });
    console.log(`✓ Accès propriétaire créé : ${email}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
