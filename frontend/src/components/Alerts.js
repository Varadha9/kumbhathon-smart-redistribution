import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [confirmed, setConfirmed] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/alerts").then(data => { setAlerts(data); setLoading(false); });
  }, []);

  const confirm = async (alert, idx) => {
    await api.post("/transfer/confirm", alert);
    setConfirmed(prev => ({ ...prev, [idx]: true }));
  };

  if (loading) return <div className="card">Loading alerts...</div>;

  return (
    <div>
      <h2>🔔 Redistribution Alerts</h2>
      {alerts.length === 0 && (
        <div className="card">
          <p>No redistribution needed right now. All NGOs are balanced! 🎉</p>
          <p style={{ marginTop: 8, fontSize: "0.85rem", color: "#718096" }}>Load demo data from Dashboard to see alerts.</p>
        </div>
      )}
      {alerts.map((a, i) => (
        <div key={i} className={`alert-card ${a.urgency === "HIGH" ? "" : "medium"}`}>
          <div className="alert-info">
            <h3>⚠️ Transfer Suggested</h3>
            <p>Move <strong>{a.meals_to_transfer} meals</strong> from <strong>{a.from}</strong> → <strong>{a.to}</strong></p>
            <p style={{ marginTop: 4 }}>📍 Distance: {a.distance_km} km</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className={`badge ${a.urgency.toLowerCase()}`}>{a.urgency}</span>
            {confirmed[i]
              ? <span className="success-msg">✅ Confirmed!</span>
              : <button className="btn btn-primary" onClick={() => confirm(a, i)}>Confirm Transfer</button>
            }
          </div>
        </div>
      ))}
    </div>
  );
}
