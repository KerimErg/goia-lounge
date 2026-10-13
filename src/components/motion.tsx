"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Révélation d'image par masque : le cadre s'ouvre de bas en haut
 * pendant que l'image se recadre (léger dézoom). Désactivé si « réduire les animations ».
 */
export function MaskReveal({ children, className, from = "bottom", delay = 0 }: {
  children: React.ReactNode; className?: string; from?: "bottom" | "left" | "right"; delay?: number;
}) {
  const reduce = useReducedMotion();
  const hidden = { bottom: "inset(100% 0% 0% 0%)", left: "inset(0% 100% 0% 0%)", right: "inset(0% 0% 0% 100%)" }[from];
  if (reduce) return <div className={cn("relative overflow-hidden", className)}><div className="absolute inset-0">{children}</div></div>;
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.4, delay, ease: EASE }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.2 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 2, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Léger décalage vertical au défilement (parallaxe). `amount` en pixels. */
export function Parallax({ children, className, amount = 60 }: { children: React.ReactNode; className?: string; amount?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [amount, -amount]);
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}

/** Titre qui monte ligne par ligne derrière un masque (une ligne = un élément du tableau). */
export function LineTitle({ lines, as: Tag = "h2", className, delay = 0, id }: {
  lines: string[]; as?: "h2" | "h3" | "p"; className?: string; delay?: number; id?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <Tag id={id} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "105%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.1, delay: delay + i * 0.1, ease: EASE }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
