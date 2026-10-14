"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/carte", key: "menu" },
  { href: "/contact", key: "contact" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * En-tête : transparent (texte ivoire) sur le hero de l'accueil, fond ivoire
 * légèrement flouté (texte encre) dès que l'on défile ou sur les autres pages.
 * Mobile : logo, bouton Réserver, menu plein écran sur le taupe du logo.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  const light = overHero || open; // texte ivoire
  // Sur l'accueil, « Réserver » descend au formulaire rapide ; ailleurs, ouvre la page de réservation.
  const BookLink = ({ className, children, onClick, label }: { className: string; children: React.ReactNode; onClick?: () => void; label?: string }) =>
    pathname === "/"
      ? <a href="#reserver" className={className} onClick={onClick} aria-label={label}>{children}</a>
      : <Link href="/reservation" className={className} onClick={onClick} aria-label={label}>{children}</Link>;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-500",
        open ? "bg-taupe text-ivory" : overHero ? "bg-transparent text-ivory" : "bg-ivory/92 text-ink shadow-[0_1px_0_rgb(27_21_17/0.08)] backdrop-blur-xl",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">{t("skip")}</a>
      <div className="container-page grid h-18 grid-cols-[1fr_auto_1fr] items-center sm:h-20">
        <nav aria-label="Navigation" className="hidden items-center gap-9 lg:flex">
          {/* Ordinateur : « Réserver » en haut à gauche */}
          <BookLink
            className={cn("eyebrow px-5 py-3 text-[0.66rem] transition-colors duration-300", light ? "bg-ivory text-ink hover:bg-linen" : "bg-ink text-ivory hover:bg-taupe")}
          >
            {t("booking")}
          </BookLink>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cn("eyebrow link-underline py-1 text-[0.66rem]", pathname === l.href ? "opacity-100" : "opacity-80 hover:opacity-100")}>
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="-ml-2 flex size-11 items-center justify-center lg:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-7">
            <span className={cn("absolute left-0 h-px w-7 bg-current transition-all duration-500 ease-[var(--ease-lux)]", open ? "top-1.5 rotate-45" : "top-0")} />
            <span className={cn("absolute left-0 h-px bg-current transition-all duration-500 ease-[var(--ease-lux)]", open ? "top-1.5 w-7 -rotate-45" : "top-3 w-4")} />
          </span>
        </button>

        <Link href="/" aria-label="GOIA — accueil" className="justify-self-center transition-opacity hover:opacity-75">
          <Logo className="w-[5.5rem] sm:w-28" />
        </Link>

        <div className="flex items-center justify-end gap-7">
          <LanguageSwitcher className="hidden lg:flex" />
          <BookLink
            label={t("booking")}
            className={cn(
              "eyebrow flex h-10 items-center justify-center px-3.5 text-[0.6rem] tracking-[0.25em] transition-colors duration-300 sm:h-auto sm:px-5 sm:py-3 sm:text-[0.66rem] lg:hidden",
              light ? "bg-ivory text-ink hover:bg-linen" : "bg-ink text-ivory hover:bg-taupe",
            )}
          >
            {t("booking")}
          </BookLink>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Navigation"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="bg-grain fixed inset-x-0 top-18 bottom-0 flex flex-col justify-between overflow-y-auto bg-taupe px-6 pt-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-ivory sm:top-20 lg:hidden"
          >
            <ul>
              {[{ href: "/", key: "home" } as const, ...LINKS].map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-ivory/20">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: EASE }}
                  >
                    <Link href={l.href} className="block py-4 font-display text-[2.6rem] leading-none">{t(l.key)}</Link>
                  </motion.span>
                </li>
              ))}
            </ul>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-10 grid gap-6"
            >
              <BookLink onClick={() => setOpen(false)} className="eyebrow flex h-14 items-center justify-center bg-ivory text-ink">{t("booking")}</BookLink>
              <LanguageSwitcher className="text-sm" />
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
