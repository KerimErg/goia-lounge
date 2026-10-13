import type { Metadata } from "next";
import { Toaster } from "sonner";
import { display, sans } from "../fonts";
import "../globals.css";

export const metadata: Metadata = { title: "Admin · GOIA Lounge", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster position="top-center" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}
