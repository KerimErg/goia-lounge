import { Fragment, type CSSProperties } from "react";
import { Logo } from "@/components/brand/logo";

/** Titre dont les mots montent un à un au défilement (CSS pur, voir globals.css). */
export function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span className="words">
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w" style={{ "--i": Math.min(i, 8) } as CSSProperties}>{w}</span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </span>
  );
}

/** Rideau d'ouverture de l'accueil : logo, filet doré, puis le rideau se lève (≈ 2 s, une fois). */
export function IntroCurtain() {
  return (
    <div className="intro" aria-hidden>
      <div className="intro-logo">
        <Logo className="w-full" title="" />
        <span className="intro-line" />
        <span className="eyebrow mt-4 block text-center text-[0.55rem] tracking-[0.55em]">Huqqa — Lounge</span>
      </div>
    </div>
  );
}

/** Filet doré en haut de l'écran qui suit la lecture de la page. */
export function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden />;
}

export { InView } from "./in-view";
