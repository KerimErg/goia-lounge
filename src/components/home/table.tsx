import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/brand/icons";
import { Link } from "@/i18n/navigation";
import { LineTitle } from "@/components/motion";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { PHOTOS } from "@/content/media";
import { splitLines } from "@/lib/utils";
import { TableList } from "./table-list";

/**
 * D — À table, sur le marbre vert. Uniquement ce que montrent les photos du lieu :
 * aucun prix ni saveur inventés ici (la carte détaillée est gérée dans l'admin).
 */
export async function AtTable({ instagramUrl }: { instagramUrl: string | null }) {
  const t = await getTranslations("table");
  return (
    <section id="a-table" className="bg-marble relative overflow-hidden py-24 text-ivory sm:py-32 lg:py-40" aria-labelledby="table-title">
      <div className="container-page">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal><p className="eyebrow text-ivory/65">{t("eyebrow")}</p></Reveal>
            <LineTitle id="table-title" lines={splitLines(t("title"), 2)} className="mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1]" />
          </div>
          <Reveal delay={0.15} className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lux" variant="light"><Link href="/carte">{t("menu")}<ArrowUpRight aria-hidden /></Link></Button>
            {instagramUrl && (
              <Button asChild size="lux" variant="outline" className="text-ivory">
                <a href={instagramUrl} target="_blank" rel="noopener"><InstagramIcon className="size-4" />{t("news")}</a>
              </Button>
            )}
          </Reveal>
        </div>
        <TableList
          rows={[
            { key: "shisha", title: t("shisha_t"), text: t("shisha"), image: PHOTOS.smoke },
            { key: "sweets", title: t("sweets_t"), text: t("sweets"), image: PHOTOS.cheesecake },
            { key: "glass", title: t("glass_t"), text: t("glass"), image: PHOTOS.table },
          ]}
        />
      </div>
    </section>
  );
}
