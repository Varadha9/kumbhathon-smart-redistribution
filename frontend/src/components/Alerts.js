// Alerts.js
// Shows AI-generated transfer suggestions — which NGO should send food to which.
// NGOs can confirm transfers here, which updates food counts on both sides.

import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function Alerts() {
  const [alerts, setAlerts]         = useState([]);   // list of AI-generated transfer suggestions
  const [confirmed, setConfirmed]   = useState({});   // tracks which alerts have been confirmed (by index)
  const [loading, setLoading]       = useState(true); // show spinner while fetching alerts
  const [confirming, setConfirming] = useState({});   // tracks which confirm button is in loading state
  const { showToast, triggerRefresh, refresh } = useApp();

  // Fetch alerts from the AI engine via /api/alerts
  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get("/alerts");
    if (data) setAlerts(data);
    setLoading(false);
  }, []);

  // Re-fetch alerts when component mounts or global refresh is triggered
  useEffect(() => { load(); }, [load, refresh]);

  // confirm — called when user clicks "Confirm Transfer" on an alert card
  const confirm = async (alert, idx) => {
    setConfirming(prev => ({ ...prev, [idx]: true }));  // show loading on this button

    // POST to /api/transfer/confirm — this updates food counts in the backend
    const res = await api.post("/transfer/confirm", alert);

    if (res?.transfer) {
      setConfirmed(prev => ({ ...prev, [idx]: true }));  // mark this alert as done
      showToast(`Transfer confirmed: ${alert.meals_to_transfer} meals from ${alert.from} to ${alert.to}`);
      triggerRefresh();  // tell Dashboard to reload its stats (meals redistributed count will increase)
    } else {
      showToast("Failed to confirm transfer", "error");
    }
    setConfirming(prev => ({ ...prev, [idx]: false }));
  };

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>Calculating redistribution alerts...</span>
    </div>
  );

  // Count how many alerts are still pending vs confirmed
  const pending   = alerts.filter((_, i) => !confirmed[i]);
  const doneCount = Object.keys(confirmed).length;

  return (
    <div>
      <div className="section-header">
        <h2>🔔 Redistribution Alerts</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Show confirmed count badge if any transfers are done */}
          {doneCount > 0 && (
            <span className="badge done">{doneCount} confirmed</span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* Explain to the user what the AI did to generate these alerts */}
      {alerts.length > 0 && (
        <div className="info-msg mt-12" style={{ marginBottom: 16 }}>
          🧠 AI matched <strong>{alerts.length} surplus-deficit NGO pairs</strong> using nearest-distance matching.
          Confirm transfers to redistribute food instantly.
        </div>
      )}

      {/* Empty state — shown when all NGOs are balanced or no data loaded */}
      {alerts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>No redistribution needed right now</p>
            <small>All NGOs are balanced — or load demo data from Dashboard to see alerts</small>
          </div>
        </div>
      ) : (
        // Render one card per alert
        alerts.map((a, i) => (
          <div
            key={i}
            // Card style changes based on: confirmed, HIGH urgency, or MEDIUM urgency
            className={`alert-card ${confirmed[i] ? "confirmed" : a.urgency === "HIGH" ? "" : "medium"}`}
          >
            <div className="alert-info">
              <h3>
                {confirmed[i] ? "✅ Transfer Completed" : "🔄 Transfer Suggested"}
              </h3>
              <p>
                Move <strong>{a.meals_to_transfer} meals</strong> from{" "}
                <strong>{a.from}</strong> → <strong>{a.to}</strong>
              </p>
              <p>📍 Distance: <strong>{a.distance_km} km</strong> &nbsp;|&nbsp; 🕐 Act fast to avoid food waste</p>
            </div>

            <div className="alert-actions">
              {/* Urgency badge — HIGH (red) or MEDIUM (yellow) or DONE (green) */}
              <span className={`badge ${confirmed[i] ? "done" : a.urgency.toLowerCase()}`}>
                {confirmed[i] ? "DONE" : a.urgency}
              </span>
              {/* Confirm button — hidden after transfer is confirmed */}
              {!confirmed[i] && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => confirm(a, i)}
                  disabled={confirming[i]}
                >
                  {confirming[i] ? "Confirming..." : "Confirm Transfer"}
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Success message when all transfers are confirmed */}
      {alerts.length > 0 && pending.length === 0 && (
        <div className="success-msg mt-12">
          🎉 All transfers confirmed! Food is on its way to people who need it.
        </div>
      )}
      {/* Progress counter — how many transfers are still pending */}
      {alerts.length > 0 && pending.length > 0 && (
        <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginTop: 8 }}>
          {pending.length} of {alerts.length} transfers pending confirmation
        </p>
      )}
    </div>
  );
}
