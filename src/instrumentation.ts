/** Journalise en clair les erreurs du serveur (pages, actions) dans les journaux Vercel. */
export async function onRequestError(err: unknown, request: { path: string; method: string }) {
  const e = err as Error & { digest?: string };
  console.error(`[erreur serveur] ${request.method} ${request.path} — ${e?.message ?? err} (digest ${e?.digest ?? "?"})`, e?.stack ?? "");
}
