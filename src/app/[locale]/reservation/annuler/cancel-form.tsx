"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** Confirmation d'annulation (lien de l'e-mail). */
export function CancelForm({ reference, token, cancelHours, instagram }: { reference: string; token: string; cancelHours: number; instagram: string | null }) {
  const t = useTranslations("cancelPage");
  const [state, setState] = useState<"ask" | "sending" | "done" | "already" | "tooLate" | "notFound" | "error">("ask");
  async function cancel() {
    setState("sending");
    const res = await fetch("/api/reservations/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: reference, t: token }) }).catch(() => null);
    const j = await res?.json().catch(() => ({}));
    if (res?.ok) setState(j?.already ? "already" : "done");
    else setState(j?.error === "tooLate" ? "tooLate" : res?.status === 404 ? "notFound" : "error");
  }
  if (state === "ask" || state === "sending")
    return (
      <div className="text-center">
        <p className="text-lg">{t("confirmQ")}</p>
        <div className="mt-8 grid gap-3 sm:flex sm:justify-center">
          <Button size="lux" onClick={cancel} disabled={state === "sending"}>{t("cancel")}</Button>
          <Button asChild size="lux" variant="outline"><Link href="/">{t("keep")}</Link></Button>
        </div>
      </div>
    );
  return (
    <p className="text-center text-lg">
      {state === "tooLate" ? <>{t("tooLate", { h: cancelHours })}{instagram && <> <a href={instagram} target="_blank" rel="noopener" className="underline">@goia.kehl</a></>}</> : t(state)}
    </p>
  );
}
