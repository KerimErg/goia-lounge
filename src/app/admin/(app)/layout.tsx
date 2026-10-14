import { requireStaff } from "@/lib/auth";
import { AdminShell } from "../shell";

export const dynamic = "force-dynamic";

/** Toutes les pages de l'espace équipe (sauf la connexion) : réservées à l'équipe connectée. */
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return <AdminShell name={user.name ?? ""}>{children}</AdminShell>;
}
