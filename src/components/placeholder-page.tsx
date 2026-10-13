import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** Page provisoire : le contenu arrive dans une prochaine étape. */
export async function PlaceholderPage({ title }: { title: string }) {
  const t = await getTranslations("placeholder");
  return (
    <section className="bg-grain grid min-h-[80dvh] bg-ivory px-5 pt-36 pb-24 text-ink sm:px-8">
      <div className="container-page">
        <p className="eyebrow text-taupe-deep">{t("title")}</p>
        <h1 className="mt-6 text-[clamp(3rem,10vw,8rem)] leading-[0.9]">{title}</h1>
        <p className="mt-10 max-w-md text-lg text-ink/75">{t("text")}</p>
        <Button asChild size="lux" className="mt-10"><Link href="/">{t("back")}</Link></Button>
      </div>
    </section>
  );
}
