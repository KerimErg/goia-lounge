import type { Metadata } from "next";
import { Toaster } from "sonner";
import { fontVariables } from "../fonts";
import { LogoSymbol } from "@/components/brand/logo-symbol";
import "../globals.css";

export const metadata: Metadata = { title: "Admin · GOIA Lounge", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVariables}>
      <body className="min-h-dvh">
        <LogoSymbol />
        {children}
        <Toaster position="top-center" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}
