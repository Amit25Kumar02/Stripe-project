/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef } from "react";
import L, { Map as LeafletMap, Circle as LeafletCircle, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  restaurants: { latitude: number; longitude: number; name: string }[];
  center: { lat: number; lng: number } | null;
  radius: number;
  onMapClick: (lat: number, lng: number) => void;
  manualSearchMode: boolean;
  setManualSearchMode: (mode: boolean) => void;
}

export default function Map({
  restaurants,
  center,
  radius,
  onMapClick,
  manualSearchMode,
  setManualSearchMode,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const circleRef = useRef<LeafletCircle | null>(null);
  const manualMarkerRef = useRef<LeafletMarker | null>(null);
  const restaurantMarkersRef = useRef<LeafletMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create custom icon instances for red and blue markers using remote URLs
    const redIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const blueIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    
    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [29.1492, 75.7217],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Add map click listener for manual search mode
    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (manualSearchMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
        setManualSearchMode(false); // Disable manual mode after a click
      }
    };
    map.on("click", clickHandler);

    return () => {
      map.off("click", clickHandler);
    };
  }, [manualSearchMode, onMapClick, setManualSearchMode]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    // Create custom icon instances for red and blue markers using remote URLs
    const redIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const blueIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Clear old layers
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (manualMarkerRef.current) {
      map.removeLayer(manualMarkerRef.current);
      manualMarkerRef.current = null;
    }
    restaurantMarkersRef.current.forEach(marker => map.removeLayer(marker));
    restaurantMarkersRef.current = [];

    // Add new circle and marker for the center location (red pin)
    if (center) {
      if (radius > 0) {
        const circle = L.circle([center.lat, center.lng], {
          color: "#3b82f6", // blue-500
          fillColor: "#60a5fa", // blue-400
          fillOpacity: 0.2,
          radius: radius * 1000, // convert km to meters
        }).addTo(map);
        circleRef.current = circle;
        map.fitBounds(circle.getBounds());
      } else {
        map.setView([center.lat, center.lng], 13);
      }
      
      const mainMarker = L.marker([center.lat, center.lng], { icon: redIcon }).addTo(map);
      manualMarkerRef.current = mainMarker;
      mainMarker.bindPopup("<b>Your Location</b>").openPopup();

    } else {
      // Fit to restaurant bounds if no specific center is given
      if (restaurants.length > 0) {
        const bounds = L.latLngBounds(
          restaurants.map((r) => [r.latitude, r.longitude]) as [number, number][]
        );
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    // Add restaurant markers (blue pins)
    restaurants.forEach((restaurant) => {
      const marker = L.marker([restaurant.latitude, restaurant.longitude], { icon: blueIcon })
        .addTo(map)
        .bindPopup(`<b>${restaurant.name}</b>`);
      restaurantMarkersRef.current.push(marker);
    });

  }, [restaurants, center, radius]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl border border-gray-300"
    />
  );
}