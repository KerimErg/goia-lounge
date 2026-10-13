"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onConsentChange, readConsent, writeConsent } from "@/lib/consent";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false, loading: () => <div className="size-full animate-pulse bg-ink-soft" /> });

/**
 * Carte OpenStreetMap. Affichée directement si le visiteur a accepté la carte dans le bandeau,
 * sinon après un clic (DSGVO : l'adresse IP est transmise aux serveurs de tuiles).
 */
export function VenueMap({ lat, lng, label, consentText, loadText }: { lat: number; lng: number; label: string; consentText: string; loadText: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const sync = () => setShow(readConsent().maps);
    sync();
    return onConsentChange(sync);
  }, []);
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft lg:aspect-auto lg:h-full lg:min-h-[420px]">
      {show ? (
        <LeafletMap lat={lat} lng={lng} label={label} />
      ) : (
        <div className="bg-marble flex size-full flex-col items-center justify-center gap-5 p-8 text-center">
          <MapPin className="size-7 text-ivory" aria-hidden />
          <p className="max-w-xs text-sm text-ivory/85">{consentText}</p>
          <Button type="button" variant="outline" size="lux" className="text-ivory" onClick={() => writeConsent({ maps: true })}>{loadText}</Button>
          <a href={gmaps} target="_blank" rel="noopener" className="text-xs tracking-[0.2em] text-ivory/70 uppercase underline underline-offset-4">Google Maps ↗</a>
        </div>
      )}
    </div>
  );
}
