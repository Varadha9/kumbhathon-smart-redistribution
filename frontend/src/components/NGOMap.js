import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api";
import { useApp } from "../App";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:       require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),
});

const surplusIcon = new L.Icon({
  iconUrl:   "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const deficitIcon = new L.Icon({
  iconUrl:   "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function NGOMap() {
  const [ngos, setNgos]       = useState([]);
  const [loading, setLoading] = useState(true);
  const { refresh }           = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get("/ngos");
    if (data) setNgos(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const center = ngos.length > 0
    ? [ngos[0].latitude, ngos[0].longitude]
    : [18.5204, 73.8567];

  const surplusCount = ngos.filter(n => n.food_available > n.people_count).length;
  const deficitCount = ngos.filter(n => n.food_available <= n.people_count).length;

  return (
    <div>
      <div className="section-header">
        <h2>🗺️ Live NGO Map</h2>
        <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {/* UX Principle: Legend for visual encoding */}
      <div className="map-legend">
        <span>🟢 Surplus NGOs ({surplusCount})</span>
        <span>🔴 Deficit NGOs ({deficitCount})</span>
        <span style={{ color: "#a0aec0" }}>Click a marker for details</span>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span>Loading map...</span></div>
      ) : (
        <div className="map-container">
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            />
            {ngos.map(n => {
              const surplus = n.food_available > n.people_count;
              const diff    = Math.abs(n.food_available - n.people_count);
              return (
                <React.Fragment key={n.ngo_name}>
                  <Marker
                    position={[n.latitude, n.longitude]}
                    icon={surplus ? surplusIcon : deficitIcon}
                  >
                    {/* UX Principle: Popup shows all relevant info in one place */}
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <strong style={{ fontSize: "0.95rem" }}>{n.ngo_name}</strong>
                        <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                        <p>📍 {n.location}</p>
                        <p>🍛 Food available: <strong>{n.food_available}</strong></p>
                        <p>👥 People to feed: <strong>{n.people_count}</strong></p>
                        <p>📞 {n.contact}</p>
                        <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                        <p style={{ color: surplus ? "#276749" : "#c53030", fontWeight: 700 }}>
                          {surplus ? `✅ Surplus: +${diff} meals` : `⚠️ Deficit: -${diff} meals`}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  {/* UX Principle: Radius circles show coverage area visually */}
                  <Circle
                    center={[n.latitude, n.longitude]}
                    radius={600}
                    color={surplus ? "#40916c" : "#e53e3e"}
                    fillOpacity={0.08}
                    weight={1.5}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      )}

      {ngos.length === 0 && !loading && (
        <div className="card mt-16">
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <p>No NGOs on the map yet</p>
            <small>Go to Dashboard and click "Load Demo Data" to see NGOs on the map</small>
          </div>
        </div>
      )}
    </div>
  );
}
