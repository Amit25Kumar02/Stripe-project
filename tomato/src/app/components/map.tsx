"use client";

import React, { useEffect, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  restaurants: { latitude: number; longitude: number; name: string }[];
}

export default function Map({ restaurants }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // ✅ Fix default marker icons (Next.js issue)
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // Blue pin
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [29.1492, 75.7217], // Default center (Hisar, Haryana)
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Remove old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    restaurants.forEach((restaurant) => {
      L.marker([restaurant.latitude, restaurant.longitude])
        .addTo(map)
        .bindPopup(`<b>${restaurant.name}</b>`);
    });

    // Auto-fit to markers
    if (restaurants.length > 0) {
      const bounds = L.latLngBounds(
        restaurants.map((r) => [r.latitude, r.longitude]) as [number, number][]
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [restaurants]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl border border-gray-300"
    />
  );
}
