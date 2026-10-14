import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { OPERATOR } from "@/content/legal";
import { IMPRESSUM } from "@/content/legal-texts";

type L = keyof typeof IMPRESSUM;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: IMPRESSUM[(locale as L) in IMPRESSUM ? (locale as L) : "de"].title };
}

/** Impressum (§ 5 DDG, § 18 MStV). Données de l'exploitant : src/content/legal.ts */
export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = IMPRESSUM[(locale as L) in IMPRESSUM ? (locale as L) : "de"];
  const o = OPERATOR;
  return (
    <LegalPage title={t.title}>
      <h2>{t.law}</h2>
      <p>{o.company}<br />{o.legalForm}<br />{o.street}<br />{o.city}<br />{o.country}</p>
      <h2>{t.rep}</h2>
      <p>{o.representative}</p>
      <h2>{t.contact}</h2>
      <p>Telefon: {o.phone}<br />E-Mail: {o.email}</p>
      {o.register && (<><h2>{t.register}</h2><p>{o.register}</p></>)}
      {o.vatId && (<><h2>{t.vat}</h2><p>{o.vatId}</p></>)}
      <h2>{t.resp}</h2>
      <p>{o.representative}, {o.street}, {o.city}</p>
      <p className="mt-10">{t.dispute}</p>
      <p className="mt-4">{t.youth}</p>
    </LegalPage>
  );
}
