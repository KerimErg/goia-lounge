import { NextResponse } from "next/server";

/**
 * Relais des tuiles OpenStreetMap par notre serveur : le navigateur du visiteur ne contacte
 * jamais OpenStreetMap (son adresse IP n'est pas transmise), donc la carte peut s'afficher
 * directement, sans consentement. Limité à la région de Kehl / Strasbourg, et mis en cache
 * 30 jours (CDN Vercel) pour respecter la politique d'usage des tuiles OSM.
 */
const BBOX = { west: 7.6, east: 8.0, south: 48.45, north: 48.7 };
const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

export async function GET(_req: Request, { params }: { params: Promise<{ z: string; x: string; y: string }> }) {
  const p = await params;
  const z = Number(p.z), x = Number(p.x), y = Number(p.y.replace(/\.png$/, ""));
  if (![z, x, y].every(Number.isInteger) || z < 11 || z > 18) return new NextResponse(null, { status: 404 });
  if (x < lon2x(BBOX.west, z) || x > lon2x(BBOX.east, z) || y < lat2y(BBOX.north, z) || y > lat2y(BBOX.south, z)) {
    return new NextResponse(null, { status: 404 });
  }
  const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {
    headers: { "User-Agent": "GOIA-Lounge-website/1.0 (map on venue contact page)" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  }).catch(() => null);
  if (!res?.ok) return new NextResponse(null, { status: 502 });
  return new NextResponse(await res.arrayBuffer(), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable" },
  });
}
