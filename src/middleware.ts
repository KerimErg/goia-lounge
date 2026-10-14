import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * - /admin/* : réservé à l'équipe connectée (jeton NextAuth). Pas de Prisma ici :
 *   le middleware tourne en Edge sur Vercel.
 * - le reste du site : langue dans l'URL (/fr, /de, /en), français par défaut.
 */
const intl = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: req.nextUrl.protocol === "https:" });
    if (!token) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  return intl(req);
}

export const config = {
  // Tout sauf l'API, les fichiers internes de Next et les fichiers statiques (avec extension)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
