import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { OPERATOR } from "@/content/legal";
import { DATENSCHUTZ } from "@/content/legal-texts";

const UPDATED = "13.10.2026";
type L = keyof typeof DATENSCHUTZ;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: DATENSCHUTZ[(locale as L) in DATENSCHUTZ ? (locale as L) : "de"].title };
}

const fill = (s: string) => s
  .replaceAll("{operator}", `${OPERATOR.company}, ${OPERATOR.street}, ${OPERATOR.city}`)
  .replaceAll("{email}", OPERATOR.email)
  .replaceAll("{phone}", OPERATOR.phone)
  .replaceAll("{authority}", OPERATOR.supervisoryAuthority)
  .replaceAll("{retention}", String(OPERATOR.retentionMonths));

/** Datenschutzerklärung (le texte allemand fait foi). */
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const d = DATENSCHUTZ[(locale as L) in DATENSCHUTZ ? (locale as L) : "de"];
  return (
    <LegalPage title={d.title}>
      {d.sections.map(([h, p]) => (
        <section key={h}><h2>{h}</h2><p>{fill(p)}</p></section>
      ))}
      <p className="mt-12 text-sm text-ink/60">{d.updated} : {UPDATED}{locale !== "de" && " · Die deutsche Fassung ist maßgeblich."}</p>
    </LegalPage>
  );
}
