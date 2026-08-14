import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axiosInstance from '../utils/axiosInstance';
import { Loader2 } from 'lucide-react';

// Fix Leaflet's default icon rendering issue mapping inside React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Pins
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically pan the map to a specific ping when clicked in the sidebar
function MapFlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 17, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

interface LocationPing {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
}

export default function DriverLocationHistory({ driverId }: { driverId: string }) {
  const [history, setHistory] = useState<LocationPing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedPoint, setFocusedPoint] = useState<[number, number] | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/admin/drivers/${driverId}/location-history`);
        // Safely extract whether backend wraps it in { history: [] } or just returns []
        const data = response.data.history || response.data;
        setHistory(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch driver location history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [driverId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', background: 'var(--input-bg)', borderRadius: '12px' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center', background: 'var(--input-bg)', borderRadius: '12px' }}>
        {error}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--input-bg)', borderRadius: '12px' }}>
        No tracking history available for this timeline.
      </div>
    );
  }

  const positions: [number, number][] = history.map(p => [p.latitude, p.longitude]);
  const startPoint = positions[0];
  const endPoint = positions[positions.length - 1];

  return (
    <div style={{ display: 'flex', height: '550px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
      {/* Sidebar - Location Pings List */}
      <div style={{ width: '280px', background: 'var(--input-bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>GPS Tracking Pings</span>
          <span className="badge" style={{ background: 'rgba(255,140,66,0.15)', color: 'var(--accent-primary)' }}>{history.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {history.map((ping, idx) => {
             const isStart = idx === 0;
             const isEnd = idx === history.length - 1;
             const isFocused = focusedPoint?.[0] === ping.latitude && focusedPoint?.[1] === ping.longitude;

             return (
              <div 
                key={idx} 
                onClick={() => setFocusedPoint([ping.latitude, ping.longitude])}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid var(--border)', 
                  cursor: 'pointer', 
                  background: isFocused ? 'rgba(255, 140, 66, 0.1)' : 'transparent',
                  borderLeft: isFocused ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {isStart && <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 'bold', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Start Point</div>}
                {isEnd && <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 'bold', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Last Known</div>}
                
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                  {new Date(ping.timestamp).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Speed: {ping.speed !== undefined ? `${ping.speed} km/h` : 'N/A'}</span>
                  <span style={{ opacity: 0.5 }}>{ping.latitude.toFixed(4)}, {ping.longitude.toFixed(4)}</span>
                </div>
              </div>
             );
          })}
        </div>
      </div>
      
      {/* Map Content */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={startPoint} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          {/* Use a sleek dark/light map depending on standard leaflet tiles (OSM is default standard) */}
          <TileLayer
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* The Route Path */}
          <Polyline positions={positions} color="var(--accent-primary)" weight={5} opacity={0.8} />
          
          {/* Start Marker */}
          {startPoint && (
            <Marker position={startPoint} icon={startIcon}>
              <Popup><strong>Start Point</strong><br/>{new Date(history[0].timestamp).toLocaleString()}</Popup>
            </Marker>
          )}
          
          {/* End Marker */}
          {endPoint && (startPoint[0] !== endPoint[0] || startPoint[1] !== endPoint[1]) && (
            <Marker position={endPoint} icon={endIcon}>
              <Popup><strong>Last Known Location</strong><br/>{new Date(history[history.length - 1].timestamp).toLocaleString()}</Popup>
            </Marker>
          )}

          {/* Dynamic Map Controller */}
          <MapFlyTo coords={focusedPoint} />
        </MapContainer>
      </div>
    </div>
  );
}
