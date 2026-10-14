"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./leaflet-map"), { ssr: false, loading: () => <div className="size-full animate-pulse bg-ink-soft" /> });

/**
 * Plan d'accès OpenStreetMap, affiché directement : les tuiles passent par notre serveur
 * (/api/tiles), aucune donnée du visiteur n'est transmise à un tiers. Lien Google Maps en plus.
 */
export function VenueMap({ lat, lng, label, directionsText }: { lat: number; lng: number; label: string; directionsText: string }) {
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft lg:aspect-auto lg:h-full lg:min-h-[420px]">
      <LeafletMap lat={lat} lng={lng} label={label} />
      <a href={gmaps} target="_blank" rel="noopener" className="absolute right-3 bottom-8 z-[500] bg-ink/85 px-3 py-2 text-[0.62rem] tracking-[0.2em] text-ivory uppercase backdrop-blur-sm transition-colors hover:bg-ink">
        {directionsText} ↗
      </a>
    </div>
  );
}
