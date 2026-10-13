import { getTranslations } from "next-intl/server";
import { MapPin, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/brand/icons";
import { Link } from "@/i18n/navigation";
import { LogoLockup } from "@/components/brand/logo";
import { getVenue } from "@/lib/venue";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const { settings } = await getVenue();
  return (
    <footer className="border-t border-ivory/10 bg-[#0a0908]">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <LogoLockup className="w-40 text-ivory" />
          <p className="mt-6 max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3"><MapPin className="mt-0.5 size-4 text-brass" aria-hidden /><span>{settings.street}<br />{settings.postalCode} {settings.city}</span></li>
          <li className="flex gap-3"><Phone className="mt-0.5 size-4 text-brass" aria-hidden /><a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="link-underline">{settings.phone}</a></li>
          <li className="flex gap-3"><InstagramIcon className="mt-0.5 size-4 text-brass" /><a href={settings.instagramUrl} target="_blank" rel="noopener" className="link-underline">@goia.kehl</a></li>
        </ul>
        <nav aria-label="Liens" className="grid content-start gap-3 text-sm">
          <Link href="/carte" className="link-underline w-fit">{nav("menu")}</Link>
          <Link href="/reservation" className="link-underline w-fit">{nav("booking")}</Link>
          <Link href="/privatisation" className="link-underline w-fit">{nav("privatization")}</Link>
          <Link href="/contact" className="link-underline w-fit">{nav("contact")}</Link>
        </nav>
      </div>
      <div className="gold-rule opacity-40" />
      <div className="container-page flex flex-col gap-4 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-brass/60 text-[0.65rem] font-semibold text-brass">18+</span>
          <span>{t("adults")} · {t("tobacco")}</span>
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/impressum" className="link-underline">{t("impressum")}</Link>
          <Link href="/datenschutz" className="link-underline">{t("privacy")}</Link>
          <span>© {new Date().getFullYear()} GOIA Lounge · {t("rights")}</span>
        </p>
      </div>
    </footer>
  );
}
