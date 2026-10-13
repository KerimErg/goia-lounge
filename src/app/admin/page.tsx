import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Tableau de bord provisoire (étape 1) : vérifie la connexion à la base. Le vrai dashboard arrive à l'étape 6. */
export default async function AdminHome() {
  const user = await requireStaff();
  const [zones, tables, reservations, menuItems] = await Promise.all([
    prisma.zone.count(), prisma.table.count(), prisma.reservation.count(), prisma.menuItem.count(),
  ]);
  return (
    <main className="container-page py-12">
      <h1 className="text-4xl">Bonjour {user.name}</h1>
      <ul className="mt-6 grid gap-2 text-muted-foreground">
        <li>{zones} zones · {tables} tables</li>
        <li>{reservations} réservations</li>
        <li>{menuItems} produits à la carte</li>
      </ul>
    </main>
  );
}
