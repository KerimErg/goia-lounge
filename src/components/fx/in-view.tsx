"use client";

import { useEffect } from "react";

/**
 * Déclenche les apparitions (.words, .sd-rise) quand elles arrivent à l'écran : ajoute « io » sur <html>
 * (qui masque ce qui n'est pas encore vu) puis « is-in » sur chaque élément, une seule fois.
 * Rien n'est masqué si l'utilisateur réduit les animations.
 */
export function InView() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = [...document.querySelectorAll<HTMLElement>(".words, .sd-rise")];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    // Ce qui est déjà à l'écran (ou au-dessus) reste visible : pas de clignotement
    els.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight * 0.88) el.classList.add("is-in"); else io.observe(el); });
    document.documentElement.classList.add("io");
    return () => io.disconnect();
  }, []);
  return null;
}
