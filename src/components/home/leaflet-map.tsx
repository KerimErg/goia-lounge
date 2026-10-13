"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const pin = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#c9a46a;border:3px solid #0e0d0c;box-shadow:0 0 0 6px rgba(201,164,106,.25)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function LeafletMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} className="size-full" attributionControl>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <Marker position={[lat, lng]} icon={pin}><Popup>{label}</Popup></Marker>
    </MapContainer>
  );
}
