"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

const T = {
  fr: { title: "Un petit souci de chargement", text: "La page n’a pas pu s’afficher. Réessayez dans un instant.", retry: "Réessayer", home: "Accueil" },
  de: { title: "Kleines Ladeproblem", text: "Die Seite konnte nicht angezeigt werden. Bitte gleich noch einmal versuchen.", retry: "Erneut versuchen", home: "Startseite" },
  en: { title: "A small loading issue", text: "The page could not be displayed. Please try again in a moment.", retry: "Try again", home: "Home" },
};

/** Erreur dans une page : message clair et bouton « Réessayer » au lieu d'une page technique. */
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const t = T[(locale as keyof typeof T) in T ? (locale as keyof typeof T) : "fr"];
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="grid min-h-[80dvh] place-items-center bg-ink px-6 pt-24 text-center text-ivory">
      <div>
        <p className="font-display text-5xl tracking-[0.2em]">GOIA</p>
        <h1 className="mt-8 font-display text-3xl">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-ivory/70">{t.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="h-12 bg-ivory px-7 text-[0.72rem] tracking-[0.28em] text-ink uppercase">{t.retry}</button>
          <a href={`/${locale ?? "fr"}`} className="grid h-12 place-items-center border border-ivory/35 px-7 text-[0.72rem] tracking-[0.28em] uppercase">{t.home}</a>
        </div>
      </div>
    </section>
  );
}
