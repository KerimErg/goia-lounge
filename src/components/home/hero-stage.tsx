"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import type { HeroVideo } from "@/content/media";
import { SmokeVeil } from "./smoke-veil";

const EASE = [0.22, 1, 0.36, 1] as const;

type Text = { eyebrow: string; lead: string; book: string; explore: string; scroll: string; tonight: string; play: string; pause: string };

/** Média de l'arche : vidéo en boucle si fournie (version portrait sur téléphone), sinon la photo. */
function ArchMedia({ poster, alt, video, labels }: { poster: string; alt: string; video: HeroVideo | null; labels: { play: string; pause: string } }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<{ mp4: string; webm?: string } | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!video) return;
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
      <Image src={poster} alt={alt} fill priority sizes="(min-width: 1024px) 34vw, 92vw" className="object-cover" />
      {video && (
        <video ref={ref} muted loop playsInline preload="metadata" poster={poster} aria-hidden="true" className="absolute inset-0 size-full object-cover">
          {src?.webm && <source src={src.webm} type="video/webm" />}
          {src && <source src={src.mp4} type="video/mp4" />}
        </video>
      )}
      {video && (
        <button
          type="button"
          onClick={() => { const v = ref.current; if (!v) return; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } }}
          aria-label={playing ? labels.pause : labels.play}
          className="absolute right-4 bottom-4 z-10 grid size-10 place-items-center rounded-full border border-ivory/40 bg-ink/40 text-ivory backdrop-blur-sm transition-colors hover:bg-ink/70"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
      )}
    </>
  );
}

export function HeroStage({ media, inset, coords, text }: {
  media: { poster: string; posterAlt: string; video: HeroVideo | null };
  inset: string;
  coords: string;
  text: Text;
}) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const insetY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.35]);

  const up = (delay: number) => (reduce ? {} : {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay, ease: EASE },
  });
  const unveil = (delay: number) => (reduce ? {} : {
    initial: { clipPath: "inset(100% 0% 0% 0%)" },
    animate: { clipPath: "inset(0% 0% 0% 0%)" },
    transition: { duration: 1.5, delay, ease: EASE },
  });

  const arch = (
    <div className="arch relative isolate aspect-[3/4] w-full overflow-hidden bg-ink-soft">
      <motion.div style={{ y: imgY }} className="absolute -inset-y-[8%] inset-x-0">
        <motion.div className="absolute inset-0" {...(reduce ? {} : { initial: { scale: 1.25 }, animate: { scale: 1 }, transition: { duration: 2.4, delay: 0.15, ease: EASE } })}>
          <ArchMedia poster={media.poster} alt={media.posterAlt} video={media.video} labels={{ play: text.play, pause: text.pause }} />
        </motion.div>
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(27_21_17/0.75),transparent_45%)] lg:bg-[linear-gradient(to_top,rgb(27_21_17/0.35),transparent_40%)]" />
      {/* Rideau qui se lève : l'image est déjà peinte dessous (pas de retard d'affichage) */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-0 z-10 bg-ink"
          initial={{ y: "0%" }}
          animate={{ y: "-101%" }}
          transition={{ duration: 1.5, delay: 0.15, ease: EASE }}
        />
      )}
    </div>
  );

  return (
    <section ref={section} className="relative isolate overflow-hidden bg-ink text-ivory" aria-labelledby="hero-title">
      {/* Lueur ambrée unique, comme la lumière derrière le verre cannelé */}
      <div aria-hidden className="absolute top-[18%] right-[8%] -z-10 size-[46rem] max-w-[120vw] rounded-full bg-amber/20 blur-[120px]" />
      <h1 id="hero-title" className="sr-only">GOIA — Huqqa Lounge, Kehl</h1>

      <motion.div style={{ opacity: fade }} className="container-page relative grid items-end gap-x-10 pt-24 pb-24 sm:pt-28 sm:pb-28 lg:min-h-[100svh] lg:grid-cols-12 lg:pt-32 lg:pb-28">
        {/* Colonne texte (ordinateur) / bas de l'écran (mobile) */}
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-7 lg:pb-6">
          <motion.p {...up(0.1)} className="eyebrow hidden text-taupe-light lg:block">{text.eyebrow}</motion.p>
          <motion.div style={{ y: logoY }} className="hidden lg:block">
            <motion.div {...unveil(0.35)} className="mt-8 w-[min(54vw,820px)] lg:-mr-[14%]">
              <Logo className="w-full text-ivory" />
            </motion.div>
            <motion.p {...up(0.9)} className="eyebrow mt-6 text-[0.8rem] tracking-[0.62em] text-ivory/80">Huqqa — Lounge</motion.p>
          </motion.div>
          <motion.p {...up(1)} className="mt-7 max-w-md font-accent text-[1.6rem] leading-[1.25] text-ivory/90 sm:text-3xl lg:mt-12">
            {text.lead}
          </motion.p>
          <motion.div {...up(1.15)} className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Button asChild size="lux" variant="light"><a href="#reserver">{text.book}</a></Button>
            <Button asChild size="lux" variant="outline" className="text-ivory"><a href="#le-lieu">{text.explore}</a></Button>
          </motion.div>
          <motion.p {...up(1.3)} className="mt-7 flex items-center gap-3 text-xs tracking-[0.18em] text-ivory/70 uppercase">
            <span className="size-1.5 rounded-full bg-amber" aria-hidden />{text.tonight}
          </motion.p>
        </div>

        {/* Arche (photo ou vidéo) + médaillon marbre + contour décalé */}
        <div className="relative order-1 lg:order-2 lg:col-span-5 lg:self-center">
          <motion.p {...up(0.1)} className="eyebrow mb-5 text-taupe-light lg:hidden">{text.eyebrow}</motion.p>
          <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
            <div aria-hidden className="arch absolute inset-0 translate-x-3 -translate-y-3 border border-taupe-light/40 lg:translate-x-5 lg:-translate-y-5" />
            {arch}
            {/* Logo posé dans l'arche sur mobile */}
            <motion.div {...unveil(0.5)} className="absolute inset-x-6 bottom-6 lg:hidden">
              <Logo className="w-full text-ivory" />
              <p className="eyebrow mt-3 text-center text-[0.62rem] tracking-[0.5em] text-ivory/85">Huqqa — Lounge</p>
            </motion.div>
            <motion.div
              style={{ y: insetY }}
              {...(reduce ? {} : { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.2, delay: 1, ease: EASE } })}
              className="absolute -bottom-8 -left-6 hidden size-36 overflow-hidden rounded-full border-[6px] border-ink shadow-lift sm:block lg:-left-16 lg:size-44"
            >
              <Image src={inset} alt="" fill sizes="176px" className="object-cover" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* La fumée passe devant l'arche et déborde dans la page */}
      <SmokeVeil className="pointer-events-none absolute inset-0 z-[5] size-full mix-blend-screen" density={media.video ? 0.25 : 0.55} />

      <p aria-hidden className="text-vertical eyebrow absolute top-1/2 right-3 hidden -translate-y-1/2 text-[0.6rem] text-ivory/40 xl:block">{coords}</p>

      <a href="#le-lieu" className="group absolute bottom-20 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-ivory/60 transition-colors hover:text-ivory lg:flex">
        <span className="eyebrow text-[0.6rem]">{text.scroll}</span>
        <span className="relative block h-10 w-px overflow-hidden bg-ivory/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.4s_var(--ease-lux)_infinite] bg-ivory motion-reduce:animate-none" />
        </span>
      </a>
    </section>
  );
}
