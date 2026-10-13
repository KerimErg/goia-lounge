import { getTranslations, setRequestLocale } from "next-intl/server";

/** Page provisoire (étape 1). L'accueil complet arrive à l'étape 2. */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-xs tracking-[0.35em] text-brass uppercase">Shisha Lounge · Kehl</p>
        <h1 className="mt-4 text-7xl text-brass-light sm:text-8xl">GOIA</h1>
        <p className="mt-6 text-muted-foreground">{t("comingSoon")}</p>
      </div>
    </main>
  );
}
