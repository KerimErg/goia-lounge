"use client";

/**
 * Consentement (DSGVO / TTDSG) : le site n'utilise aucun cookie publicitaire ni de mesure d'audience.
 * Seul service externe optionnel : la carte OpenStreetMap (transmet l'adresse IP au serveur de tuiles).
 * Le choix est gardé dans le navigateur (localStorage), jamais envoyé au serveur.
 */
export type Consent = { maps: boolean; decided: boolean };
const KEY = "goia-consent-v1";
const EVENT = "goia-consent";

export function readConsent(): Consent {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { decided: true, ...JSON.parse(raw) };
  } catch {}
  return { maps: false, decided: false };
}

export function writeConsent(c: { maps: boolean }) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onConsentChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

/** Rouvre le bandeau (lien « Cookies » du pied de page). */
export function reopenConsent() {
  try { localStorage.removeItem(KEY); } catch {}
  window.dispatchEvent(new CustomEvent(EVENT));
}
