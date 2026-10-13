"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { Ornament } from "@/components/ornament";
import type { HeroVideo } from "@/content/media";
import { SmokeVeil } from "./smoke-veil";

type Text = { eyebrow: string; book: string; explore: string; scroll: string; tonight: string; play: string; pause: string };

/** Vidéo plein écran (version portrait sur téléphone), lecture sans son, bouton pause. */
function BackgroundVideo({ video, poster, labels }: { video: HeroVideo; poster: string; labels: { play: string; pause: string } }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<{ mp4: string; webm?: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const portrait = window.matchMedia("(max-width: 767px)").matches && video.portrait;
    setSrc(portrait ? video.portrait! : video.landscape);
  }, [video]);
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    v.load();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [src]);
  return (
    <>
      <video ref={ref} muted loop playsInline preload="metadata" poster={poster} aria-hidden="true" className="absolute inset-0 size-full object-cover">
        {src?.webm && <source src={src.webm} type="video/webm" />}
        {src && <source src={src.mp4} type="video/mp4" />}
      </video>
      <button
        type="button"
        onClick={() => { const v = ref.current; if (!v) return; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } }}
        aria-label={playing ? labels.pause : labels.play}
        className="absolute right-5 bottom-24 z-20 grid size-10 place-items-center rounded-full border border-ivory/40 bg-ink/40 text-ivory backdrop-blur-sm transition-colors hover:bg-ink/70"
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
    </>
  );
}

/**
 * Hero plein écran, façon grands lounges : ambiance floutée (ou vidéo) en fond,
 * fumée qui passe devant, logo GOIA au centre, réservation immédiate, bandeau d'infos en bas.
 */
export function HeroStage({ media, address, instagram, text }: {
  media: { poster: string; inset: string; video: HeroVideo | null };
  address: string;
  instagram: string | null;
  text: Text;
}) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);

  // Entrées en CSS (voir globals.css) : visibles dès le premier affichage.

  return (
    <section ref={section} className="bg-marble relative isolate flex min-h-[100svh] flex-col overflow-hidden text-ivory" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">GOIA — Huqqa Lounge, Kehl</h1>
      {/* Lueur abricot unique derrière l'arche */}
      <div aria-hidden className="absolute top-1/3 right-[-10%] -z-10 size-[42rem] max-w-[110vw] rounded-full bg-champagne/15 blur-[120px] lg:right-[5%]" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-page relative z-10 grid flex-1 items-center gap-10 pt-24 pb-10 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
        {/* Arche : photo réelle de la carte (ou vidéo si fournie) */}
        <div className="relative mx-auto w-[64vw] max-w-[440px] lg:order-2 lg:w-full">
          <div aria-hidden className="arch absolute inset-0 translate-x-3 -translate-y-3 border border-champagne/70 sm:translate-x-5 sm:-translate-y-5" />
          <div className="arch relative aspect-[4/5] overflow-hidden bg-ink-soft">
            <motion.div style={{ y: bgY }} className="absolute -inset-y-[6%] inset-x-0">
              <div className="absolute inset-0 animate-[slowzoom_24s_ease-in-out_infinite_alternate] motion-reduce:animate-none">
                <Image src={media.poster} alt="Mojito Framboise au GOIA" fill priority sizes="(min-width: 1024px) 440px, 64vw" className="object-cover" />
                {media.video && <BackgroundVideo video={media.video} poster={media.poster} labels={{ play: text.play, pause: text.pause }} />}
              </div>
            </motion.div>
          </div>
          <div className="absolute -bottom-6 -left-6 size-24 overflow-hidden rounded-full border-4 border-ink shadow-lift sm:-left-10 sm:size-32">
            <Image src={media.inset} alt="" fill sizes="128px" className="object-cover" />
          </div>
        </div>

        {/* Logo, signature, réservation */}
        <div className="text-center lg:order-1 lg:text-left">
          <div className="mx-auto w-[min(84vw,620px)] overflow-hidden lg:mx-0">
            <div className="enter-mask" style={{ animationDelay: "0.35s" }}>
              <Logo className="w-full text-ivory" />
            </div>
          </div>
          <p style={{ animationDelay: "0.9s" }} className="enter-rise eyebrow mt-5 text-[clamp(0.62rem,1.3vw,0.8rem)] tracking-[0.7em] text-ivory/90">Huqqa — Lounge</p>
          <div style={{ animationDelay: "1.1s" }} className="enter-rise mt-7 flex justify-center text-champagne lg:justify-start"><Ornament /></div>
          <div style={{ animationDelay: "1.3s" }} className="enter-rise mx-auto mt-9 grid w-full max-w-sm gap-3 sm:flex sm:max-w-none sm:justify-center lg:justify-start">
            <Button asChild size="lux" variant="apricot"><a href="#reserver">{text.book}</a></Button>
            <Button asChild size="lux" variant="outline" className="text-ivory"><Link href="/carte">{text.explore}</Link></Button>
          </div>
        </div>
      </motion.div>
      <SmokeVeil className="pointer-events-none absolute inset-0 z-[5] size-full mix-blend-screen" density={media.video ? 0.25 : 0.45} />

      {/* Bandeau d'infos */}
      <div style={{ animationDelay: "1.5s" }} className="enter-rise relative z-10 border-t border-ivory/15 bg-ink/40 backdrop-blur-md">
        <div className="container-page grid grid-cols-2 items-center gap-4 py-4 text-[0.68rem] tracking-[0.2em] text-ivory/85 uppercase sm:grid-cols-3">
          <p className="flex items-center gap-2.5"><span className="size-1.5 animate-pulse rounded-full bg-champagne motion-reduce:animate-none" aria-hidden />{text.tonight}</p>
          <p className="hidden text-center sm:block">{address}</p>
          <p className="text-right">
            {instagram ? (
              <a href={instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-2 transition-colors hover:text-ivory"><InstagramIcon className="size-3.5" />@goia.kehl</a>
            ) : (
              <a href="#bienvenue" className="transition-colors hover:text-ivory">{text.scroll} ↓</a>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
