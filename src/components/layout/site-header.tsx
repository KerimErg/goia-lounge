"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/carte", key: "menu" },
  { href: "/privatisation", key: "privatization" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * En-tête : transparent sur la photo d'accueil, fond nuit flouté après défilement.
 * Ordinateur : liens à gauche, logo au centre, langue + « Réserver » à droite.
 * Mobile : logo, bouton Réserver et menu plein écran.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || !overHero || open;

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500",
      solid ? "border-b border-ivory/10 bg-night/85 backdrop-blur-xl" : "bg-gradient-to-b from-night/70 to-transparent")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-brass focus:px-4 focus:py-2 focus:text-night">{t("skip")}</a>
      <div className="container-page grid h-18 grid-cols-[1fr_auto_1fr] items-center sm:h-20">
        {/* Gauche */}
        <nav aria-label="Navigation" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn("eyebrow link-underline py-1 text-ivory/85 transition-colors hover:text-ivory", pathname === l.href && "text-brass")}>
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="flex size-11 items-center justify-center lg:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-6">
            <span className={cn("absolute left-0 h-px w-6 bg-ivory transition-all duration-300", open ? "top-1.5 rotate-45" : "top-0")} />
            <span className={cn("absolute left-0 h-px w-6 bg-ivory transition-all duration-300", open ? "top-1.5 -rotate-45" : "top-3")} />
          </span>
        </button>

        {/* Centre : logo */}
        <Link href="/" aria-label="GOIA — accueil" className="justify-self-center text-ivory transition-colors hover:text-brass">
          <Logo className="w-24 sm:w-28" />
        </Link>

        {/* Droite */}
        <div className="flex items-center justify-end gap-6">
          <LanguageSwitcher className="hidden lg:flex" />
          <Link href="/reservation" aria-label={t("booking")} className="eyebrow flex size-11 items-center justify-center border border-brass/70 text-brass transition-colors hover:bg-brass hover:text-night sm:size-auto sm:px-5 sm:py-2.5">
            <CalendarDays className="size-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">{t("booking")}</span>
          </Link>
        </div>
      </div>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-x-0 top-18 bottom-0 flex flex-col justify-between bg-night/97 px-6 pt-10 pb-12 backdrop-blur-xl sm:top-20 lg:hidden"
          >
            <ul className="space-y-1">
              {[{ href: "/", key: "home" } as const, ...LINKS, { href: "/reservation", key: "booking" } as const].map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.1, duration: 0.5 }}>
                  <Link href={l.href} className="block py-2 font-display text-4xl text-ivory transition-colors hover:text-brass">{t(l.key)}</Link>
                </motion.li>
              ))}
            </ul>
            <LanguageSwitcher className="text-sm" />
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
