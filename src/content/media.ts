/**
 * Médias de l'accueil.
 *
 * VIDÉO DU HERO (public/videos/) : la vidéo de la terrasse (à partir de 4 s), sans son, en boucle —
 * MP4 H.264 1080 × 1920 (ordinateur), WebM VP9 en secours, et une version légère 720 × 1280 pour téléphone.
 * Elle remplit toute la largeur de la bannière (recadrée automatiquement selon l'écran).
 * - poster : première image, affichée pendant le chargement (et si l'utilisateur réduit les animations)
 * Sans vidéo (video: null), le hero affiche la photo floue avec une fumée en WebGL.
 */
export type HeroVideo = { mp4: string; webm?: string; mobile?: string };

export const HERO_MEDIA: { poster: string; posterPortrait: string; video: HeroVideo | null } = {
  poster: "/images/hero/poster.jpg",
  posterPortrait: "/images/hero/poster.jpg",
  video: { mobile: "/videos/hero-terrasse-mobile.mp4", webm: "/videos/hero-terrasse.webm", mp4: "/videos/hero-terrasse.mp4" },
};

/** Photos du lieu (fournies par le GOIA). À remplacer par les originaux haute définition, mêmes noms. */
export const PHOTOS = {
  smoke: "/images/goia/chicha-fumee-ambiance.jpg",
  table: "/images/goia/table-desserts-cocktails.jpg",
  amber: "/images/goia/chicha-cocktail-dessert.jpg",
  cheesecake: "/images/goia/cheesecake-speculoos.jpg",
  /** Fond flou pour la section réservation */
  tableBlur: "/images/goia/bg-table.jpg",
} as const;
