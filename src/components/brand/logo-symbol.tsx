import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";

/**
 * Le tracé du logo (≈ 15 Ko) n'est envoyé qu'une fois : <LogoSymbol /> est posé dans le layout,
 * et chaque <Logo /> le réutilise par référence (<use>). Couleur = couleur du texte.
 */
export function LogoSymbol() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <symbol id="goia-logo" viewBox={LOGO_VIEWBOX}>
        <path d={LOGO_PATH} fill="currentColor" fillRule="evenodd" />
      </symbol>
    </svg>
  );
}
