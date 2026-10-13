import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LogoLockup } from "@/components/brand/logo";
import { Smoke } from "./smoke";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Photo d'ambiance + voiles sombres + lueur ambrée + fumée animée */}
      <Image
        src="/images/goia/chicha-fumee-ambiance.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-30 scale-105 object-cover object-center opacity-60 blur-[1.5px]"
      />
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_35%,rgb(14_13_12/0.35),rgb(14_13_12/0.92)_70%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-20 h-1/2 bg-gradient-to-t from-night via-night/70 to-transparent" />
      <div aria-hidden className="absolute top-1/3 left-1/2 -z-20 size-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/10 blur-3xl" />
      <Smoke className="absolute inset-0 -z-10 h-full w-full" />

      <div className="container-page flex flex-col items-center pt-24 pb-28 text-center">
        <p className="eyebrow animate-in fade-in slide-in-from-bottom-2 text-brass duration-1000">{t("eyebrow")}</p>
        <h1 className="mt-8 w-[min(78vw,560px)] animate-in fade-in zoom-in-95 text-ivory duration-1000 [animation-delay:150ms] [animation-fill-mode:both]">
          <span className="sr-only">GOIA Lounge</span>
          <LogoLockup className="w-full text-[clamp(0.85rem,2.2vw,1.35rem)]" />
        </h1>
        <p className="mt-10 max-w-xl animate-in fade-in font-accent text-2xl leading-snug text-sand duration-1000 [animation-delay:400ms] [animation-fill-mode:both] sm:text-3xl">
          {t("tagline")}
        </p>
        <div className="mt-12 flex w-full max-w-md animate-in flex-col gap-3 fade-in duration-1000 [animation-delay:600ms] [animation-fill-mode:both] sm:max-w-none sm:flex-row sm:justify-center">
          <Button asChild size="lux"><Link href="/reservation">{t("book")}</Link></Button>
          <Button asChild size="lux" variant="outline"><Link href="/carte">{t("seeMenu")}</Link></Button>
        </div>
      </div>

      <a href="#reserver" className="eyebrow absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/60 transition-colors hover:text-brass">
        {t("scroll")}
        <ChevronDown className="size-4 animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
