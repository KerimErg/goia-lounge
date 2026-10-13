/**
 * Médias de l'accueil.
 *
 * VIDÉO DU HERO : déposez les fichiers dans public/videos/ puis renseignez les chemins ici.
 * - landscape : 16:9 ou 3:2 pour ordinateur (1920 px, H.264, 6–10 s en boucle, sans son, ≤ 4 Mo)
 * - portrait  : 9:16 ou 4:5 pour téléphone (1080 px de large, ≤ 3 Mo) — sinon la version paysage est recadrée
 * - poster    : image affichée pendant le chargement (et si l'utilisateur réduit les animations)
 * Tant qu'aucune vidéo n'est renseignée, l'arche du hero affiche la photo avec une fumée en WebGL.
 */
export type HeroVideo = { landscape: { mp4: string; webm?: string }; portrait?: { mp4: string; webm?: string } };

export const HERO_MEDIA: { poster: string; inset: string; video: HeroVideo | null } = {
  // Photos de la carte officielle (nettes) : arche principale + médaillon
  poster: "/images/menu/mojito-framboise.jpg",
  inset: "/images/menu/chicha-classique.jpg",
  video: null,
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
