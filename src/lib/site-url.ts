/**
 * Adresse publique du site, tolérante aux saisies approximatives dans Vercel :
 * « goia-lounge.vercel.app », « "https://…" », « https://…/fr/ » → « https://goia-lounge.vercel.app ».
 * Sans valeur exploitable : domaine de production fourni par Vercel, sinon localhost.
 */
export function siteOrigin(): string {
  const candidates = [
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const raw of candidates) {
    const v = raw?.trim().replace(/^["']|["']$/g, "").trim();
    if (!v) continue;
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      return `${u.protocol}//${u.host}`;
    } catch {
      /* valeur illisible : on essaie la suivante */
    }
  }
  return "http://localhost:3000";
}

// NextAuth lit NEXTAUTH_URL directement : on lui donne la version nettoyée.
if (process.env.NEXTAUTH_URL !== undefined || process.env.VERCEL) process.env.NEXTAUTH_URL = siteOrigin();
