import { getLocale, getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { InstagramIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "./section-heading";

/**
 * Avis : uniquement des avis RÉELS saisis par l'équipe dans l'admin (published = true).
 * Sans avis publié, on invite à laisser un avis — aucun avis n'est jamais inventé.
 */
export async function Reviews({ googleReviewsUrl, instagramUrl }: { googleReviewsUrl: string | null; instagramUrl: string }) {
  const t = await getTranslations("reviews");
  const locale = await getLocale();
  const reviews = await prisma.review.findMany({ where: { published: true }, orderBy: { date: "desc" }, take: 6 });
  const fmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <section className="py-24 sm:py-32" aria-labelledby="reviews">
      <div className="container-page">
        <Reveal><SectionHeading eyebrow={t("eyebrow")} title={t("title")} /></Reveal>
        {reviews.length > 0 && (
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={0.06 * i}>
                <li className="flex h-full flex-col border border-ivory/10 p-8">
                  {r.rating && (
                    <p className="flex gap-1 text-brass" aria-label={`${r.rating}/5`}>
                      {Array.from({ length: 5 }, (_, k) => <Star key={k} className="size-3.5" fill={k < r.rating! ? "currentColor" : "none"} aria-hidden />)}
                    </p>
                  )}
                  <blockquote className="mt-5 flex-1 font-accent text-xl leading-snug text-ivory">« {r.text} »</blockquote>
                  <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {r.author} · {fmt.format(r.date)} ·{" "}
                    {r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="noopener" className="link-underline">{t("source", { source: r.source })}</a> : t("source", { source: r.source })}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
        <Reveal className="mt-12 flex flex-col items-center gap-6 text-center">
          {reviews.length === 0 && <p className="max-w-md font-accent text-2xl text-sand">{t("empty")}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            {googleReviewsUrl && (
              <Button asChild variant="outline" size="lux"><a href={googleReviewsUrl} target="_blank" rel="noopener">{t("google")}</a></Button>
            )}
            <Button asChild variant="outline" size="lux">
              <a href={instagramUrl} target="_blank" rel="noopener"><InstagramIcon className="size-4" />{t("instagram")}</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
