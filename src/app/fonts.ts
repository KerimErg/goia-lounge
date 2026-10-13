import localFont from "next/font/local";

/*
 * Polices hébergées avec le site (aucun appel à Google Fonts : conforme DSGVO).
 * - Italiana : titres, proche des lettres fines du logo GOIA
 * - Jost : texte et petites capitales espacées (comme « HUQQA – LOUNGE »)
 * - Cormorant Garamond italique : accents, citations
 */
export const display = localFont({
  src: "../../node_modules/@fontsource/italiana/files/italiana-latin-400-normal.woff2",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

export const sans = localFont({
  src: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

export const accent = localFont({
  src: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2",
  variable: "--font-accent",
  weight: "300 700",
  style: "italic",
  display: "swap",
});

export const fontVariables = `${display.variable} ${sans.variable} ${accent.variable}`;
