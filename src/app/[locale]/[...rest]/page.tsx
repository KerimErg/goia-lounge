import { notFound, redirect } from "next/navigation";

/** Adresse inconnue sous /fr, /de, /en : page 404 du site (et /fr/admin → /admin, erreur fréquente). */
export default async function CatchAll({ params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  if (rest[0] === "admin") redirect(`/${rest.join("/")}`);
  notFound();
}
