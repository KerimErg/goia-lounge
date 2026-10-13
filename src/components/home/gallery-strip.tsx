"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { InstagramIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type Img = { id: string; url: string; alt: string };

// Formats variés : haut, carré, large, haut… (cadrages différents d'une même série)
const FORMATS = ["h-[56vh] aspect-[3/4]", "h-[38vh] aspect-square self-end", "h-[44vh] aspect-[4/3]", "h-[56vh] aspect-[2/3] self-start"];
const MOBILE = ["h-[52vh] aspect-[3/4]", "h-[36vh] aspect-square self-end", "h-[40vh] aspect-[4/3]", "h-[52vh] aspect-[2/3]"];

/**
 * Galerie horizontale. Ordinateur : la bande défile latéralement pendant que l'on fait
 * défiler la page (section « collée »). Mobile : glisser au doigt, avec aimantation.
 */
export function GalleryStrip({ images, title, eyebrow, hint, instagramUrl, follow }: {
  images: Img[]; title: string; eyebrow: string; hint: string; instagramUrl: string | null; follow: string;
}) {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setDesktop(mq.matches && !reduce);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => { window.removeEventListener("resize", measure); mq.removeEventListener("change", measure); };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);

  return (
    <section
      ref={outer}
      className={cn("bg-grain relative bg-linen text-ink", desktop ? "h-[280vh]" : "py-24 sm:py-32")}
      aria-labelledby="gallery-title"
    >
      <div className={cn(desktop && "sticky top-0 flex h-screen flex-col justify-center overflow-hidden")}>
        <div className="container-page flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-taupe-deep">{eyebrow}</p>
            <h2 id="gallery-title" className="mt-5 text-[clamp(2.6rem,6.5vw,5.5rem)] leading-none">{title}</h2>
          </div>
          <p className="eyebrow hidden text-[0.62rem] text-taupe-deep sm:block" aria-hidden>{hint} →</p>
        </div>

        <motion.div
          ref={track}
          style={desktop ? { x } : undefined}
          className={cn(
            "mt-10 flex items-center gap-4 px-5 sm:gap-6 sm:px-8 lg:mt-14 lg:gap-8 lg:px-10",
            !desktop && "snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {images.map((img, i) => (
            <figure key={img.id} className={cn("group relative shrink-0 snap-center overflow-hidden", (desktop ? FORMATS : MOBILE)[i % 4])}>
              <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 45vw, 80vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 bg-[linear-gradient(to_top,rgb(27_21_17/0.7),transparent)] p-4 pt-12 text-sm text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
                {img.alt}
              </figcaption>
            </figure>
          ))}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener"
              className={cn("group arch flex shrink-0 snap-center flex-col items-center justify-center gap-5 bg-taupe p-8 text-center text-ivory transition-colors hover:bg-taupe-deep", desktop ? "h-[48vh] aspect-[3/4]" : "h-[42vh] aspect-[3/4]")}
            >
              <Logo className="w-32" />
              <span className="flex items-center gap-2 text-sm"><InstagramIcon className="size-4" />@goia.kehl</span>
              <span className="eyebrow text-[0.6rem] text-ivory transition-colors group-hover:text-ivory">{follow}</span>
            </a>
          )}
          <span aria-hidden className="w-1 shrink-0 lg:w-10" />
        </motion.div>
      </div>
    </section>
  );
}
