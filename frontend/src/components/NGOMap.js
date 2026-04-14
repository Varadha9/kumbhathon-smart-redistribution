import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const surplusIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const deficitIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function NGOMap() {
  const [ngos, setNgos] = useState([]);

  useEffect(() => { api.get("/ngos").then(setNgos); }, []);

  const center = ngos.length > 0
    ? [ngos[0].latitude, ngos[0].longitude]
    : [18.5204, 73.8567];

  return (
    <div>
      <h2>🗺️ NGO Map</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 16, fontSize: "0.85rem" }}>
        <span>🟢 Surplus NGO</span>
        <span>🔴 Deficit NGO</span>
      </div>
      <div className="map-container">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors' />
          {ngos.map(n => {
            const surplus = n.food_available > n.people_count;
            return (
              <React.Fragment key={n.ngo_name}>
                <Marker position={[n.latitude, n.longitude]} icon={surplus ? surplusIcon : deficitIcon}>
                  <Popup>
                    <strong>{n.ngo_name}</strong><br />
                    📍 {n.location}<br />
                    🍛 Food: {n.food_available} plates<br />
                    👥 People: {n.people_count}<br />
                    {surplus
                      ? <span style={{ color: "green" }}>✅ Surplus: {n.food_available - n.people_count}</span>
                      : <span style={{ color: "red" }}>⚠️ Deficit: {n.people_count - n.food_available}</span>}
                  </Popup>
                </Marker>
                <Circle center={[n.latitude, n.longitude]}
                  radius={500}
                  color={surplus ? "#40916c" : "#e53e3e"}
                  fillOpacity={0.1} />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
      {ngos.length === 0 && <p style={{ marginTop: 12, color: "#718096" }}>Load demo data from Dashboard to see NGOs on map.</p>}
    </div>
  );
}
