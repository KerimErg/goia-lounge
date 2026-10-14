import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Page introuvable (lien cassé, ancien produit…) : retour à l'accueil ou à la carte. */
export default async function NotFound() {
  const nav = await getTranslations("nav");
  return (
    <section className="grid min-h-[80dvh] place-items-center bg-ink px-6 pt-24 text-center text-ivory">
      <div>
        <p className="font-display text-7xl tracking-[0.2em] text-champagne">404</p>
        <h1 className="mt-6 font-display text-3xl">GOIA</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="grid h-12 place-items-center bg-ivory px-7 text-[0.72rem] tracking-[0.28em] text-ink uppercase">{nav("home")}</Link>
          <Link href="/carte" className="grid h-12 place-items-center border border-ivory/35 px-7 text-[0.72rem] tracking-[0.28em] uppercase">{nav("menu")}</Link>
        </div>
      </div>
    </section>
  );
}
