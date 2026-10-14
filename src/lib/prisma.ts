import { PrismaClient } from "@prisma/client";

/**
 * Adresse de la base adaptée à Neon : connexion partagée (« -pooler ») avec pgbouncer=true, peu de connexions
 * par instance, et des délais longs le temps qu'une base gratuite en veille se réveille.
 */
function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("-pooler") && !url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
    url.searchParams.delete("channel_binding"); // paramètre ajouté par Neon, inutile ici
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "5");
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

/** Journalise en clair une erreur de lecture (visible dans les journaux Vercel, même au déploiement). */
export function logged<T>(label: string, p: Promise<T>): Promise<T> {
  return p.catch((e: unknown) => {
    const err = e as Error & { code?: string };
    console.error(`[base] ${label} — ${err?.name ?? "Erreur"} ${err?.code ?? ""} : ${err?.message ?? e}`);
    throw e;
  });
}
