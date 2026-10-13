import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** Page provisoire : le contenu arrive dans une prochaine étape. */
export async function PlaceholderPage({ title }: { title: string }) {
  const t = await getTranslations("placeholder");
  return (
    <section className="bg-marble grid min-h-[80dvh] place-items-center px-6 pt-32 pb-20 text-center">
      <div className="max-w-lg">
        <p className="eyebrow text-brass">{t("title")}</p>
        <h1 className="mt-5 text-[clamp(2.6rem,7vw,4.5rem)] leading-none text-ivory">{title}</h1>
        <div className="gold-rule mx-auto mt-7 w-24" />
        <p className="mt-7 text-sand/85">{t("text")}</p>
        <Button asChild variant="outline" size="lux" className="mt-10"><Link href="/">{t("back")}</Link></Button>
      </div>
    </section>
  );
}
