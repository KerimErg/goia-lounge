"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CalendarDays, LogOut, Plus, Settings } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Réservations", icon: CalendarDays },
  { href: "/admin/nouvelle", label: "Ajouter", icon: Plus },
  { href: "/admin/reglages", label: "Réglages", icon: Settings },
];

/** Cadre de l'espace équipe : barre du haut (ordinateur) et barre d'onglets en bas (téléphone). */
export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <div className="min-h-dvh bg-ivory pb-24 text-ink sm:pb-0">
      <header className="sticky top-0 z-40 bg-ink text-ivory">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo className="w-16 text-ivory" />
            <span className="eyebrow hidden text-[0.55rem] text-champagne sm:inline">Espace équipe</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors", active(n.href) ? "bg-ivory/10 text-champagne" : "text-ivory/75 hover:text-ivory")}>
                <n.icon className="size-4" />{n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm sm:ml-2">
            <span className="hidden text-ivory/60 md:inline">{name}</span>
            <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="flex items-center gap-2 rounded-full border border-ivory/20 px-3 py-1.5 text-ivory/80 transition-colors hover:border-ivory hover:text-ivory" aria-label="Se déconnecter">
              <LogOut className="size-4" /><span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>

      {/* Téléphone : onglets en bas, à portée de pouce */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-ink/10 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-1 py-3 text-[0.68rem]", active(n.href) ? "text-ink" : "text-ink/50")}>
            <n.icon className={cn("size-5", active(n.href) && "text-taupe-deep")} />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
