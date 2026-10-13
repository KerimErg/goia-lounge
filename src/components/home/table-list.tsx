"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type Row = { key: string; title: string; text: string; image: string };

/**
 * Liste typographique « À table ». Sur ordinateur, la photo correspondante suit
 * le pointeur au survol d'une ligne ; sur mobile, elle s'affiche dans la ligne.
 */
export function TableList({ rows }: { rows: Row[] }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 24, mass: 0.6 });
  const y = useSpring(my, { stiffness: 180, damping: 24, mass: 0.6 });

  return (
    <ul
      ref={box}
      className="relative mt-16 border-t border-ivory/20"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !box.current) return;
        const r = box.current.getBoundingClientRect();
        mx.set(e.clientX - r.left); my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => setActive(null)}
    >
      {rows.map((row, i) => (
        <li
          key={row.key}
          onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
          className="group relative grid items-center gap-5 border-b border-ivory/20 py-8 sm:grid-cols-[auto_1fr] sm:gap-10 md:py-10 lg:grid-cols-[1fr_minmax(0,26rem)]"
        >
          <div className="flex items-center gap-5">
            <span className="relative size-20 shrink-0 overflow-hidden rounded-full lg:hidden">
              <Image src={row.image} alt="" fill sizes="80px" className="object-cover" />
            </span>
            <h3 className="text-[clamp(3rem,10vw,8.5rem)] leading-[0.9] transition-[transform,color] duration-700 ease-[var(--ease-lux)] lg:group-hover:translate-x-6 lg:group-hover:text-amber">
              {row.title}
            </h3>
          </div>
          <p className="max-w-[34ch] text-lg leading-relaxed text-ivory/80 lg:justify-self-end">{row.text}</p>
        </li>
      ))}

      {/* Photo flottante (souris uniquement, décorative) */}
      <motion.div aria-hidden style={{ x, y }} className="pointer-events-none absolute top-0 left-0 z-20 hidden lg:block">
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={active}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, rotate: 4 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="arch absolute -top-48 -left-32 h-72 w-60 overflow-hidden shadow-lift"
            >
              <Image src={rows[active].image} alt="" fill sizes="240px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ul>
  );
}
