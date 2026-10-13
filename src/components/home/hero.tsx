import { getTranslations } from "next-intl/server";
import { HERO_MEDIA, PHOTOS } from "@/content/media";
import { formatCoord, getVenue, hoursFor } from "@/lib/venue";
import { nowInKehl } from "@/lib/time";
import { HeroStage } from "./hero-stage";

export async function Hero() {
  const t = await getTranslations("hero");
  const { settings, hours } = await getVenue();
  const tonight = hoursFor(hours, nowInKehl().weekday);
  return (
    <HeroStage
      media={HERO_MEDIA}
      inset={PHOTOS.table}
      coords={`${formatCoord(settings.latitude, "N", "S")} · ${formatCoord(settings.longitude, "E", "W")}`}
      text={{
        eyebrow: t("eyebrow"),
        lead: t("lead"),
        book: t("book"),
        explore: t("explore"),
        scroll: t("scroll"),
        tonight: tonight ? `${t("today")} · ${tonight}` : t("closedToday"),
        play: t("playVideo"),
        pause: t("pauseVideo"),
      }}
    />
  );
}
