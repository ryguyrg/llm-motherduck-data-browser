'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapLocation {
  lat: number;
  lng: number;
  label: string;
  value: number;
  details?: Record<string, string | number>;
}

export interface MapSpec {
  title: string;
  data: MapLocation[];
  center?: [number, number];
  zoom?: number;
  valueLabel?: string;
}

interface ChatMapProps {
  spec: MapSpec;
}

export default function ChatMap({ spec }: ChatMapProps) {
  const { title, data, center, zoom, valueLabel = 'Value' } = spec;

  useEffect(() => {
    // Fix for leaflet icon issue in Next.js
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Calculate center from data if not provided
  const mapCenter: [number, number] = center || (data.length > 0
    ? [
        data.reduce((sum, loc) => sum + loc.lat, 0) / data.length,
        data.reduce((sum, loc) => sum + loc.lng, 0) / data.length,
      ]
    : [39.8283, -98.5795]); // Default to center of USA

  // Calculate appropriate zoom based on data spread
  const mapZoom = zoom || 4;

  // Calculate radius based on value relative to max
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const getRadius = (value: number) => Math.min(Math.max((value / maxValue) * 25, 6), 35);

  return (
    <div className="chat-map">
      {title && <div className="chat-map-title">{title}</div>}
      <div className="chat-map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((location, index) => (
            <CircleMarker
              key={index}
              center={[location.lat, location.lng]}
              radius={getRadius(location.value)}
              fillColor="#FFDE00"
              color="#383838"
              weight={2}
              fillOpacity={0.8}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <strong style={{ fontSize: '14px' }}>{location.label}</strong>
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <div style={{ display: 'grid', gap: '4px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#718096' }}>{valueLabel}:</span>
                      <strong>{typeof location.value === 'number'
                        ? location.value.toLocaleString()
                        : location.value}</strong>
                    </div>
                    {location.details && Object.entries(location.details).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#718096' }}>{key}:</span>
                        <span>{typeof val === 'number' ? val.toLocaleString() : val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
