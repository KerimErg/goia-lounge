import localFont from "next/font/local";

/** Polices hébergées avec le site (aucun appel à Google Fonts : conforme DSGVO). */
export const display = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});

export const sans = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});
