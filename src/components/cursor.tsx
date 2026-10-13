"use client";

import { useEffect, useRef } from "react";

/**
 * Curseur discret (souris uniquement) : un anneau clair en mode « différence » (lisible sur tous les fonds) qui suit le pointeur
 * et s'agrandit au survol des liens et boutons. Le curseur système reste visible.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ring.current!;
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const hover = (e.target as HTMLElement).closest("a, button, [role=button], select, label");
      el.dataset.hover = hover ? "true" : "false";
      el.style.opacity = "1";
    };
    const leave = () => { el.style.opacity = "0"; };
    const tick = () => {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);
  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] hidden size-8 rounded-full border border-white opacity-0 mix-blend-difference transition-[width,height,opacity,background-color] duration-300 data-[hover=true]:size-14 data-[hover=true]:bg-white md:block"
    />
  );
}
