import "./site-url"; // NEXTAUTH_URL nettoyée avant que NextAuth ne la lise
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "./prisma";

/** Connexion de l'équipe uniquement (les clients n'ont pas de compte). Repris du site location. */
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 12 * 3600 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: { email: { label: "E-mail", type: "email" }, password: { label: "Mot de passe", type: "password" } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

/** À appeler dans chaque page / action admin (double protection avec le middleware). */
export async function requireStaff(callbackUrl = "/admin") {
  const session = await getSession();
  if (!session?.user) redirect(`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}

export async function requireAdmin() {
  const user = await requireStaff();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}
