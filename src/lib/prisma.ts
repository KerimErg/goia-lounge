import { PrismaClient } from "@prisma/client";

/**
 * Adresse de la base adaptée à Neon :
 * - connexion « -pooler » (PgBouncer) → pgbouncer=true (pas de requêtes préparées partagées) ;
 * - délais plus longs : une base Neon gratuite se met en veille et met quelques secondes à se réveiller
 *   (sinon la génération des pages au déploiement échoue).
 */
function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("-pooler") && !url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "30");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "30");
    return url.toString();
  } catch {
    return raw;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl(), log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
