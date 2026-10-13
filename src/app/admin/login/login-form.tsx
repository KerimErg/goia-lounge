"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl") || "/admin";
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="w-full max-w-sm rounded-3xl border bg-card p-8 shadow-lift"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          const res = await signIn("credentials", {
            email: data.get("email"), password: data.get("password"), redirect: false,
          });
          if (res?.ok) router.push(callbackUrl.startsWith("/admin") ? callbackUrl : "/admin");
          else setError("Identifiants incorrects.");
        });
      }}
    >
      <p className="font-display text-4xl text-brass">GOIA</p>
      <h1 className="mt-1 text-2xl">Espace équipe</h1>
      <div className="mt-6 grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="username" required /></div>
        <div className="grid gap-2"><Label htmlFor="password">Mot de passe</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="mt-6 w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</Button>
    </form>
  );
}
