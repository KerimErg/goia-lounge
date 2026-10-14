"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Photo = { src: string; alt: string };
const TILT = [-4, 5, -8, 7];

/**
 * Pile de photos qui se mélange toute seule (la photo du dessus passe derrière),
 * en pause au survol. Fixe si l'utilisateur préfère réduire les animations.
 */
export function PhotoDeck({ photos, interval = 3200 }: { photos: Photo[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState(photos.map((_, i) => i));
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused || photos.length < 2) return;
    const id = window.setInterval(() => setOrder((o) => [...o.slice(1), o[0]]), interval);
    return () => window.clearInterval(id);
  }, [reduce, paused, interval, photos.length]);

  return (
    <div
      className="relative mx-auto aspect-[4/5] w-[72%] max-w-[360px] md:w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {order.map((idx, pos) => {
        const p = photos[idx];
        const depth = order.length - pos; // le premier de la liste est au-dessus
        return (
          <motion.div
            key={p.src}
            className="absolute inset-0 overflow-hidden rounded-[1.75rem] border-[6px] border-ivory/95 bg-ink shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)]"
            style={{ zIndex: depth }}
            initial={false}
            animate={reduce ? { rotate: TILT[idx % TILT.length] / 2 } : {
              rotate: pos === 0 ? 0 : TILT[idx % TILT.length],
              x: pos === 0 ? 0 : (idx % 2 ? 1 : -1) * (10 + pos * 8),
              y: pos * 6,
              scale: 1 - pos * 0.04,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 360px, 72vw" className="object-cover" />
          </motion.div>
        );
      })}
    </div>
  );
}
