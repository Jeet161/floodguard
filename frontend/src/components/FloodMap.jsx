import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, LayersControl, Polyline } from "react-leaflet";
import L from "leaflet";
import { RISK_COLORS } from "../utils/format";
import { api } from "../services/api";

// ── Custom SVG pin factory ─────────────────────────────────────────────────────
function makeSvgIcon(fillColor, size = 28) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.35}" viewBox="0 0 24 32">
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${fillColor}" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M12 1C7.03 1 3 5.03 3 10c0 7 9 21 9 21s9-14 9-21c0-4.97-4.03-9-9-9z"
            fill="${fillColor}" filter="url(#shadow)" />
      <circle cx="12" cy="10" r="4" fill="white" fill-opacity="0.9"/>
    </svg>
  `;
  return new L.DivIcon({
    html: svg,
    className: "",
    iconSize: [size, size * 1.35],
    iconAnchor: [size / 2, size * 1.35],
    popupAnchor: [0, -(size * 1.35)],
  });
}

// Service icons as emoji-free SVG circles
function makePinIcon(bgColor = "#1F2A3F", symbol = "●") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r="12" fill="${bgColor}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <text x="13" y="17" text-anchor="middle" font-size="12" fill="white" font-family="sans-serif">${symbol}</text>
    </svg>
  `;
  return new L.DivIcon({
    html: svg,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
  });
}

const SERVICE_ICONS = {
  hospital:       makePinIcon("#EF4444", "H"),
  police:         makePinIcon("#3B82F6", "P"),
  fire_station:   makePinIcon("#F97316", "F"),
  shelter:        makePinIcon("#8B5CF6", "S"),
  assembly_point: makePinIcon("#2FA8E0", "A"),
};

// ── Map helpers ────────────────────────────────────────────────────────────────
function Recenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.flyTo([lat, lon], 12, { duration: 1.2, easeLinearity: 0.25 });
  }, [lat, lon, map]);
  return null;
}

function RouteFitter({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (routes && routes.shortest && routes.floodSafe) {
      const points = [
        ...routes.shortest.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
        ...routes.floodSafe.geometry.coordinates.map(([lon, lat]) => [lat, lon])
      ];
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routes, map]);
  return null;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function FloodMap({ location, risk, routes, height = "480px" }) {
  const [importantLocations, setImportantLocations] = useState([]);

  useEffect(() => {
    if (!location) return;
    api
      .getImportantLocations(location.latitude, location.longitude)
      .then(setImportantLocations)
      .catch(() => setImportantLocations([]));
  }, [location?.latitude, location?.longitude]);

  const center    = location ? [location.latitude, location.longitude] : [26.9124, 75.7873];
  const riskColor = risk ? RISK_COLORS[risk.risk_level] : "#2FA8E0";
  const mainIcon  = makeSvgIcon(riskColor, 30);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/[0.06] shadow-card"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={location ? 12 : 6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Risk Zone">
            {location && risk && (
              <Circle
                center={[location.latitude, location.longitude]}
                radius={Math.max(1500, (risk.risk_score || 0) * 60)}
                pathOptions={{
                  color: riskColor,
                  fillColor: riskColor,
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: "6 4",
                }}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Services">
            <>
              {importantLocations.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.latitude, p.longitude]}
                  icon={SERVICE_ICONS[p.type] ?? makePinIcon("#2A374F", "?")}
                >
                  <Popup>
                    <strong className="font-semibold">{p.name}</strong>
                    <br />
                    <span className="text-xs capitalize text-slate-400">
                      {p.type.replace("_", " ")}
                    </span>
                  </Popup>
                </Marker>
              ))}
            </>
          </LayersControl.Overlay>
        </LayersControl>

        {/* Selected location or custom route origin marker */}
        {routes && routes.origin ? (
          <Marker position={[routes.origin.lat, routes.origin.lng]} icon={mainIcon}>
            <Popup>
              <strong className="font-semibold">Start: {routes.origin.name}</strong>
            </Popup>
          </Marker>
        ) : (
          location && (
            <Marker position={[location.latitude, location.longitude]} icon={mainIcon}>
              <Popup>
                <strong className="font-semibold">{location.name}</strong>
                {risk && (
                  <>
                    <br />
                    <span className="text-xs" style={{ color: riskColor }}>
                      {risk.risk_level} · {Math.round(risk.risk_score)}/100
                    </span>
                  </>
                )}
              </Popup>
            </Marker>
          )
        )}

        {/* Evacuation Route Polylines */}
        {routes && routes.shortest && (
          <Polyline
            positions={routes.shortest.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
            pathOptions={{ color: "#3B82F6", weight: 3, dashArray: "5 5", opacity: 0.7 }}
          />
        )}

        {routes && routes.floodSafe && (
          <Polyline
            positions={routes.floodSafe.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
            pathOptions={{ color: "#10B981", weight: 4.5, opacity: 0.9 }}
          />
        )}

        {routes && routes.destination && (
          <Marker
            position={[routes.destination.lat, routes.destination.lng]}
            icon={makeSvgIcon("#EF4444", 26)}
          >
            <Popup>
              <strong className="font-semibold">Destination</strong>
              <br />
              <span className="text-xs text-slate-400">{routes.destination.name}</span>
            </Popup>
          </Marker>
        )}

        <Recenter lat={location?.latitude} lon={location?.longitude} />
        <RouteFitter routes={routes} />
      </MapContainer>
    </div>
  );
}
