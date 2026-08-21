import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 15px rgba(124,58,237,0.5)"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

/** Clickable map for selecting a location (used in CreateEvent) */
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EventMap({ lat, lng, title, height = 320, interactive = false, onLocationSelect }) {
  if (!lat || !lng) return null;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      style={{ height, width: '100%', borderRadius: 12, zIndex: 0 }}
      scrollWheelZoom={interactive}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {interactive && <ClickHandler onLocationSelect={onLocationSelect} />}
      <Marker position={[lat, lng]} icon={customIcon}>
        {title && <Popup><strong>{title}</strong></Popup>}
      </Marker>
    </MapContainer>
  );
}
