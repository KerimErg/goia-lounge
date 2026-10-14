/**
 * Crée (ou met à jour) un accès à l'espace équipe, SANS toucher au reste de la base.
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run admin:create
 * À utiliser sur le vrai site pour le premier compte propriétaire, ou pour retrouver un accès.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Propriétaire";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 10) {
    console.error("Indiquez ADMIN_EMAIL et ADMIN_PASSWORD (10 caractères minimum).");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  console.log(`✓ Accès propriétaire prêt : ${user.email} — connexion sur /admin`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
