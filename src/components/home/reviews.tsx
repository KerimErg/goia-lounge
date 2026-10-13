import { getLocale, getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/prisma";

/**
 * Avis RÉELS saisis par l'équipe dans l'admin (published = true), avec leur source.
 * Aucune section tant qu'aucun avis n'est publié — rien n'est jamais inventé.
 */
export async function Reviews({ googleReviewsUrl }: { googleReviewsUrl: string | null }) {
  const t = await getTranslations("reviews");
  const locale = await getLocale();
  const reviews = await prisma.review.findMany({ where: { published: true }, orderBy: { date: "desc" }, take: 3 });
  if (reviews.length === 0) return null;
  const fmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <section className="bg-linen py-24 text-ink sm:py-32" aria-labelledby="reviews-title">
      <div className="container-page">
        <Reveal><p className="eyebrow text-taupe-deep">{t("eyebrow")}</p></Reveal>
        <h2 id="reviews-title" className="mt-6 text-[clamp(2.4rem,6vw,5rem)] leading-none">{t("title")}</h2>
        <div className="mt-14 grid gap-12 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={0.08 * i}>
              <figure className={i === 0 ? "lg:col-span-1" : ""}>
                {r.rating && (
                  <p className="flex gap-1 text-taupe-deep" aria-label={`${r.rating}/5`}>
                    {Array.from({ length: 5 }, (_, k) => <Star key={k} className="size-3.5" fill={k < r.rating! ? "currentColor" : "none"} aria-hidden />)}
                  </p>
                )}
                <blockquote className="mt-5 font-accent text-2xl leading-snug">« {r.text} »</blockquote>
                <figcaption className="mt-6 text-xs tracking-[0.18em] text-taupe-deep uppercase">
                  {r.author} · {fmt.format(r.date)} ·{" "}
                  {r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="noopener" className="link-underline">{t("source", { source: r.source })}</a> : t("source", { source: r.source })}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {googleReviewsUrl && (
          <a href={googleReviewsUrl} target="_blank" rel="noopener" className="link-underline mt-12 inline-block text-sm">{t("google")} ↗</a>
        )}
      </div>
    </section>
  );
}
