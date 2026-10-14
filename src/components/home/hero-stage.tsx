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

/** Vidéo plein cadre (toute la largeur), lecture sans son en boucle, bouton pause. */
function BackgroundVideo({ video, poster, labels }: { video: HeroVideo; poster: string; labels: { play: string; pause: string } }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);
  return (
    <>
      <video ref={ref} muted loop playsInline autoPlay preload="auto" poster={poster} aria-hidden="true" className="absolute inset-0 size-full object-cover object-[50%_55%]">
        {video.webm && <source src={video.webm} type="video/webm" />}
        <source src={video.mp4} type="video/mp4" />
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
  media: { poster: string; posterPortrait: string; video: HeroVideo | null };
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
  // En quittant l'accueil, l'image se replie en carte arrondie et laisse place au fond clair de « Bienvenue »
  const shrink = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.86]);
  const radius = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 48]);

  // Entrées en CSS (voir globals.css) : visibles dès le premier affichage.

  return (
    <motion.section ref={section} style={{ scale: shrink, borderRadius: radius }} className="relative isolate flex h-[100svh] min-h-[620px] origin-bottom flex-col overflow-hidden bg-ink text-ivory" aria-labelledby="hero-title">
      {/* Fond : ambiance du lounge, lent zoom continu */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-20">
        {media.video ? (
          // Vidéo naturelle, sans effet : l'image d'attente est sa première image
          <div className="absolute inset-0">
            <Image src={media.poster} alt="" fill priority sizes="100vw" quality={80} className="object-cover object-[50%_55%]" />
            <BackgroundVideo video={media.video} poster={media.poster} labels={{ play: text.play, pause: text.pause }} />
          </div>
        ) : (
          <div className="absolute inset-0 animate-[slowzoom_24s_ease-in-out_infinite_alternate] motion-reduce:animate-none">
            <Image src={media.poster} alt="" fill priority sizes="100vw" quality={70} className="hidden object-cover sm:block" />
            <Image src={media.posterPortrait} alt="" fill priority sizes="100vw" quality={70} className="object-cover sm:hidden" />
          </div>
        )}
      </motion.div>
      <div aria-hidden className={`absolute inset-0 -z-10 ${media.video ? "bg-[radial-gradient(ellipse_at_50%_45%,rgb(27_21_17/0.3),rgb(27_21_17/0.6)_85%)]" : "bg-[radial-gradient(ellipse_at_50%_45%,rgb(27_21_17/0.25),rgb(27_21_17/0.85)_75%)]"}`} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-ink to-transparent" />
      {!media.video && <SmokeVeil className="pointer-events-none absolute inset-0 z-0 size-full mix-blend-screen" density={0.6} />}

      <h1 id="hero-title" className="sr-only">GOIA — Huqqa Lounge, Kehl</h1>
      {/* Cadre fin, comme un faire-part : touche luxe discrète */}
      <div aria-hidden className="pointer-events-none absolute inset-3 z-10 border border-champagne/25 sm:inset-5" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-page relative z-10 flex flex-1 flex-col items-center justify-center pt-20 text-center">
        {/* Logo : chaque lettre monte derrière un masque */}
        <div className="w-[min(86vw,720px)] overflow-hidden">
          <div className="enter-mask" style={{ animationDelay: "0.35s" }}>
            <Logo className="w-full text-ivory drop-shadow-[0_8px_40px_rgb(27_21_17/0.5)]" />
          </div>
        </div>
        <p style={{ animationDelay: "0.9s" }} className="enter-rise eyebrow mt-6 text-[clamp(0.62rem,1.4vw,0.85rem)] tracking-[0.7em] text-ivory/90">Huqqa — Lounge</p>

        <div style={{ animationDelay: "1.1s" }} className="enter-rise mt-8 text-champagne"><Ornament /></div>
        <div style={{ animationDelay: "1.3s" }} className="enter-rise mt-10 grid w-full max-w-sm gap-3 sm:flex sm:max-w-none sm:justify-center">
          <Button asChild size="lux" variant="light"><a href="#reserver">{text.book}</a></Button>
          <Button asChild size="lux" variant="outline" className="text-ivory backdrop-blur-sm"><Link href="/carte">{text.explore}</Link></Button>
        </div>
      </motion.div>

      {/* Bandeau d'infos */}
      <div style={{ animationDelay: "1.5s" }} className="enter-rise relative z-10 border-t border-ivory/15 bg-ink/30 backdrop-blur-md">
        <div className="container-page grid grid-cols-2 items-center gap-4 py-4 text-[0.68rem] tracking-[0.2em] text-ivory/85 uppercase sm:grid-cols-3">
          <p className="flex items-center gap-2.5"><span className="size-1.5 animate-pulse rounded-full bg-amber motion-reduce:animate-none" aria-hidden />{text.tonight}</p>
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
    </motion.section>
  );
}
