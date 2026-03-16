"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Fix Leaflet default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapProperty {
  id: string;
  title: string;
  price: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  images: string[] | null;
  propertyType: string;
}

export default function MapComponent({
  properties,
}: {
  properties: MapProperty[];
}) {
  // Center on India by default, or first property
  const center: [number, number] =
    properties.length > 0
      ? [
          parseFloat(properties[0].latitude || "20.5937"),
          parseFloat(properties[0].longitude || "78.9629"),
        ]
      : [20.5937, 78.9629];

  return (
    <MapContainer
      center={center}
      zoom={properties.length > 0 ? 12 : 5}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((p) => (
        <Marker
          key={p.id}
          position={[
            parseFloat(p.latitude || "0"),
            parseFloat(p.longitude || "0"),
          ]}
        >
          <Popup>
            <div className="space-y-1 min-w-[180px]">
              <p className="font-semibold text-sm">{p.title}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {p.propertyType} · {p.city}
              </p>
              <p className="font-bold text-primary text-sm">
                ₹{Number(p.price).toLocaleString()}
              </p>
              <Link
                href={`/properties/${p.id}`}
                className="text-xs text-blue-600 hover:underline"
              >
                View Details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
