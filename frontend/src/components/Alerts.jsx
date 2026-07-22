import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function Alerts() {
  const [alerts, setAlerts]         = useState([]);
  const [confirmed, setConfirmed]   = useState({});
  const [loading, setLoading]       = useState(true);
  const [confirming, setConfirming] = useState({});
  const { showToast, triggerRefresh, refresh, setTab } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get("/alerts");
    if (data) setAlerts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const confirm = async (alert, idx) => {
    setConfirming(prev => ({ ...prev, [idx]: true }));
    const res = await api.post("/transfer/confirm", alert);
    if (res?.transfer) {
      setConfirmed(prev => ({ ...prev, [idx]: true }));
      showToast(`✅ ${alert.meals_to_transfer} meals: ${alert.from} → ${alert.to}`);
      triggerRefresh();
    } else {
      showToast("Failed to confirm transfer", "error");
    }
    setConfirming(prev => ({ ...prev, [idx]: false }));
  };

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>Calculating Kumbh redistribution alerts...</span>
    </div>
  );

  const pending   = alerts.filter((_, i) => !confirmed[i]);
  const doneCount = Object.keys(confirmed).length;

  // Show demand reason from first alert (all share same time window)
  const demandReason = alerts[0]?.demand_reason;

  return (
    <div>
      <div className="section-header">
        <h2>🔔 Kumbh Redistribution Alerts</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {doneCount > 0 && <span className="badge done">{doneCount} confirmed</span>}
          <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* Time-based demand prediction banner */}
      {demandReason && (
        <div className="info-msg" style={{ marginBottom: 16 }}>
          ⏰ <strong>Demand Prediction:</strong> {demandReason}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="info-msg" style={{ marginBottom: 16 }}>
          🧠 Smart Matching Engine found <strong>{alerts.length} transfer suggestions</strong> across Kumbh zones.
          Same-zone transfers are prioritised for faster delivery.
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>All Kumbh camps are balanced right now</p>
            <small>Load Kumbh demo data from Dashboard to see zone-aware alerts</small>
          </div>
        </div>
      ) : (
        alerts.map((a, i) => (
          <div
            key={i}
            className={`alert-card ${confirmed[i] ? "confirmed" : a.urgency === "CRITICAL" ? "critical" : a.urgency === "HIGH" ? "" : "medium"}`}
          >
            <div className="alert-info">
              <h3>
                {confirmed[i] ? "✅ Transfer Completed" : "🔄 Transfer Suggested"}
                {a.same_zone && !confirmed[i] && (
                  <span className="zone-match-badge">⚡ Same Zone</span>
                )}
              </h3>
              <p>
                Move <strong>{a.meals_to_transfer} meals</strong> from{" "}
                <strong>{a.from}</strong> → <strong>{a.to}</strong>
              </p>
              <p style={{ fontSize: "0.78rem", color: "#a0aec0" }}>
                📍 {a.from_zone} → {a.to_zone}
              </p>
              <p>📏 Distance: <strong>{a.distance_km} km</strong> &nbsp;|&nbsp; 🕐 Act fast to avoid food waste</p>
            </div>

            <div className="alert-actions">
              <span className={`badge ${confirmed[i] ? "done" : a.urgency.toLowerCase()}`}>
                {confirmed[i] ? "DONE" : a.urgency}
              </span>
              {!confirmed[i] && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => confirm(a, i)}
                  disabled={confirming[i]}
                >
                  {confirming[i] ? "Confirming..." : "Confirm Transfer"}
                </button>
              )}
              {confirmed[i] && setTab && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTab("Volunteer")}
                >
                  🚴 Assign Volunteer
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {alerts.length > 0 && pending.length === 0 && (
        <div className="success-msg mt-12">
          🎉 All transfers confirmed! Food is reaching pilgrims across Kumbh Mela zones.
        </div>
      )}
      {alerts.length > 0 && pending.length > 0 && (
        <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginTop: 8 }}>
          {pending.length} of {alerts.length} transfers pending confirmation
        </p>
      )}
    </div>
  );
}
