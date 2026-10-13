import { getLocale, getTranslations } from "next-intl/server";
import { InstagramIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { contactLinks, dayName, getVenue, groupHours } from "@/lib/venue";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const info = await getTranslations("info");
  const locale = await getLocale();
  const { settings: s, hours } = await getVenue();
  const links = contactLinks(s);
  const days = (d: number[]) => (d.length === 1 ? dayName(d[0], locale, "short") : `${dayName(d[0], locale, "short")} – ${dayName(d[d.length - 1], locale, "short")}`);

  return (
    <footer className="border-t border-ivory/10 bg-ink text-ivory">
      <div className="container-page pt-20 pb-10 sm:pt-28">
        <Logo className="w-full max-w-[1100px] text-ivory/95" />
        <p className="eyebrow mt-6 text-[0.7rem] tracking-[0.6em] text-taupe-light">Huqqa — Lounge · {s.city}</p>

        <div className="mt-16 grid gap-12 border-t border-ivory/15 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="eyebrow text-[0.62rem] text-taupe-light">{info("address")}</h2>
            <address className="mt-4 text-sm leading-relaxed not-italic">{s.venueName}<br />{s.street}<br />{s.postalCode} {s.city}</address>
          </div>
          <div>
            <h2 className="eyebrow text-[0.62rem] text-taupe-light">{info("hours")}</h2>
            <dl className="mt-4 space-y-1.5 text-sm">
              {groupHours(hours).map((g) => (
                <div key={g.days.join()} className="flex gap-4">
                  <dt className="w-24 text-ivory/70 first-letter:uppercase">{days(g.days)}</dt>
                  <dd className="tabular-nums">{g.label === "closed" ? info("closed") : g.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="eyebrow text-[0.62rem] text-taupe-light">{info("contact")}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {links.instagram && <li><a href={links.instagram} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><InstagramIcon className="size-4" />@goia.kehl</a></li>}
              {links.whatsapp && <li><a href={links.whatsapp} target="_blank" rel="noopener" className="link-underline inline-flex items-center gap-2"><WhatsAppIcon className="size-4" />WhatsApp</a></li>}
              {links.phone && <li><a href={`tel:${links.phone.replace(/[^\d+]/g, "")}`} className="link-underline">{links.phone}</a></li>}
              {links.email && <li><a href={`mailto:${links.email}`} className="link-underline">{links.email}</a></li>}
            </ul>
          </div>
          <nav aria-label="Liens" className="grid content-start gap-2 text-sm">
            <Link href="/carte" className="link-underline w-fit">{nav("menu")}</Link>
            <Link href="/reservation" className="link-underline w-fit">{nav("booking")}</Link>
            <Link href="/privatisation" className="link-underline w-fit">{nav("privatization")}</Link>
            <Link href="/contact" className="link-underline w-fit">{nav("contact")}</Link>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-ivory/15 pt-8 text-xs text-ivory/60 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ivory/40 text-[0.65rem] font-medium text-ivory">18+</span>
            <span>{t("adults")} · {t("tobacco")}</span>
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/impressum" className="link-underline">{t("impressum")}</Link>
            <Link href="/datenschutz" className="link-underline">{t("privacy")}</Link>
            <span>© {new Date().getFullYear()} GOIA Lounge</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
