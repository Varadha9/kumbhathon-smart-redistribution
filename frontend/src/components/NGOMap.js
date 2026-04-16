// NGOMap.js
// Interactive map showing all NGOs as colored markers.
// Green marker = surplus NGO (has extra food)
// Red marker   = deficit NGO (needs more food)
// Uses Leaflet + OpenStreetMap (free, no API key needed).

import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../api";
import { useApp } from "../App";

// Fix for Leaflet's default marker icons not loading in React (known Leaflet + webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl:       require("leaflet/dist/images/marker-icon.png"),
  shadowUrl:     require("leaflet/dist/images/marker-shadow.png"),
});

// Custom green marker icon — used for surplus NGOs
const surplusIcon = new L.Icon({
  iconUrl:   "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Custom red marker icon — used for deficit NGOs
const deficitIcon = new L.Icon({
  iconUrl:   "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function NGOMap() {
  const [ngos, setNgos]       = useState([]);    // list of all NGOs to plot on map
  const [loading, setLoading] = useState(true);  // show spinner while fetching
  const { refresh }           = useApp();        // re-fetch when global refresh triggers

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get("/ngos");
    if (data) setNgos(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  // Center the map on the first NGO's location, or default to Pune if no NGOs
  const center = ngos.length > 0
    ? [ngos[0].latitude, ngos[0].longitude]
    : [18.5204, 73.8567];  // default: Pune city center

  // Count surplus and deficit NGOs for the legend
  const surplusCount = ngos.filter(n => n.food_available > n.people_count).length;
  const deficitCount = ngos.filter(n => n.food_available <= n.people_count).length;

  return (
    <div>
      <div className="section-header">
        <h2>🗺️ Live NGO Map</h2>
        <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {/* Legend — explains what green and red markers mean */}
      <div className="map-legend">
        <span>🟢 Surplus NGOs ({surplusCount})</span>
        <span>🔴 Deficit NGOs ({deficitCount})</span>
        <span style={{ color: "#a0aec0" }}>Click a marker for details</span>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /><span>Loading map...</span></div>
      ) : (
        <div className="map-container">
          {/* MapContainer — the Leaflet map wrapper */}
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
            {/* TileLayer — loads map tiles from OpenStreetMap (free, no API key) */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            />

            {/* Render one marker + circle per NGO */}
            {ngos.map(n => {
              const surplus = n.food_available > n.people_count;
              const diff    = Math.abs(n.food_available - n.people_count);
              return (
                <React.Fragment key={n.ngo_name}>
                  {/* Marker — green for surplus, red for deficit */}
                  <Marker
                    position={[n.latitude, n.longitude]}
                    icon={surplus ? surplusIcon : deficitIcon}
                  >
                    {/* Popup — shows NGO details when marker is clicked */}
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <strong style={{ fontSize: "0.95rem" }}>{n.ngo_name}</strong>
                        <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                        <p>📍 {n.location}</p>
                        <p>🍛 Food available: <strong>{n.food_available}</strong></p>
                        <p>👥 People to feed: <strong>{n.people_count}</strong></p>
                        <p>📞 {n.contact}</p>
                        <hr style={{ margin: "6px 0", borderColor: "#e2e8f0" }} />
                        {/* Show surplus/deficit status with color */}
                        <p style={{ color: surplus ? "#276749" : "#c53030", fontWeight: 700 }}>
                          {surplus ? `✅ Surplus: +${diff} meals` : `⚠️ Deficit: -${diff} meals`}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Circle — visual coverage area around each NGO (600m radius) */}
                  {/* Green circle for surplus, red circle for deficit */}
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

      {/* Empty state — shown when no NGOs are registered */}
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
