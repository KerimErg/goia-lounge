"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false, loading: () => <div className="size-full animate-pulse bg-espresso" /> });

/** Carte OpenStreetMap chargée seulement après accord (DSGVO : l'IP est transmise aux serveurs de tuiles). */
export function VenueMap({ lat, lng, label, consentText, loadText }: { lat: number; lng: number; label: string; consentText: string; loadText: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-ivory/10 bg-espresso lg:aspect-auto lg:h-full lg:min-h-[420px]">
      {show ? (
        <LeafletMap lat={lat} lng={lng} label={label} />
      ) : (
        <div className="bg-marble flex size-full flex-col items-center justify-center gap-5 p-8 text-center">
          <MapPin className="size-7 text-brass" aria-hidden />
          <p className="max-w-xs text-sm text-sand/85">{consentText}</p>
          <Button type="button" variant="outline" size="lux" onClick={() => setShow(true)}>{loadText}</Button>
        </div>
      )}
    </div>
  );
}
