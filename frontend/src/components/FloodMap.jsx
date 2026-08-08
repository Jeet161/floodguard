import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import { RISK_COLORS } from "../utils/format";
import { api } from "../services/api";

// Default Leaflet marker icons don't load correctly with bundlers - fix via CDN URLs.
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const IMPORTANT_ICONS = {
  hospital: "🏥", police: "🚓", fire_station: "🚒", shelter: "🏠", assembly_point: "📍",
};

function Recenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.flyTo([lat, lon], 12, { duration: 1 });
  }, [lat, lon, map]);
  return null;
}

export default function FloodMap({ location, risk, height = "480px" }) {
  const [importantLocations, setImportantLocations] = useState([]);

  useEffect(() => {
    if (!location) return;
    api
      .getImportantLocations(location.latitude, location.longitude)
      .then(setImportantLocations)
      .catch(() => setImportantLocations([]));
  }, [location?.latitude, location?.longitude]);

  const center = location ? [location.latitude, location.longitude] : [26.9124, 75.7873]; // Jaipur fallback
  const riskColor = risk ? RISK_COLORS[risk.risk_level] : "#2FA8E0";

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700 shadow-card" style={{ height }}>
      <MapContainer center={center} zoom={location ? 12 : 6} style={{ height: "100%", width: "100%" }} zoomControl={true}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Dark Map">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light Map">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Flood Risk Zone">
            {location && risk && (
              <Circle
                center={[location.latitude, location.longitude]}
                radius={Math.max(1500, (risk.risk_score || 0) * 60)}
                pathOptions={{ color: riskColor, fillColor: riskColor, fillOpacity: 0.15, weight: 2 }}
              />
            )}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Important Locations">
            <>
              {importantLocations.map((p) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]} icon={defaultIcon}>
                  <Popup>
                    <span className="font-medium">{IMPORTANT_ICONS[p.type] || "📍"} {p.name}</span>
                    <br />
                    <span className="text-xs capitalize">{p.type.replace("_", " ")}</span>
                  </Popup>
                </Marker>
              ))}
            </>
          </LayersControl.Overlay>
        </LayersControl>

        {location && (
          <Marker position={[location.latitude, location.longitude]} icon={defaultIcon}>
            <Popup>
              <span className="font-semibold">{location.name}</span>
              {risk && (
                <>
                  <br />
                  Risk: <strong style={{ color: riskColor }}>{risk.risk_level}</strong> ({risk.risk_score}/100)
                </>
              )}
            </Popup>
          </Marker>
        )}

        <Recenter lat={location?.latitude} lon={location?.longitude} />
      </MapContainer>
    </div>
  );
}
