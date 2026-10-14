import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos libres de droits (voir public/images/CREDITS.md)
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Pages générées au déploiement depuis la base Neon : moins de requêtes en parallèle, et nouvel essai
    // si la base (en veille sur le plan gratuit) met du temps à répondre.
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 3,
  },
};

export default withNextIntl(nextConfig);
