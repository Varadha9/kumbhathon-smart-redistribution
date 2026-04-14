import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function Alerts() {
  const [alerts, setAlerts]     = useState([]);
  const [confirmed, setConfirmed] = useState({});
  const [loading, setLoading]   = useState(true);
  const [confirming, setConfirming] = useState({});
  const { showToast, triggerRefresh, refresh } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get("/alerts");
    if (data) setAlerts(data);
    setLoading(false);
  }, []);

  // Auto-refresh when global refresh triggered (e.g. after seed)
  useEffect(() => { load(); }, [load, refresh]);

  const confirm = async (alert, idx) => {
    setConfirming(prev => ({ ...prev, [idx]: true }));
    const res = await api.post("/transfer/confirm", alert);
    if (res?.transfer) {
      setConfirmed(prev => ({ ...prev, [idx]: true }));
      showToast(`Transfer confirmed: ${alert.meals_to_transfer} meals from ${alert.from} to ${alert.to}`);
      triggerRefresh(); // refresh dashboard stats
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

  const pending   = alerts.filter((_, i) => !confirmed[i]);
  const doneCount = Object.keys(confirmed).length;

  return (
    <div>
      <div className="section-header">
        <h2>🔔 Redistribution Alerts</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {doneCount > 0 && (
            <span className="badge done">{doneCount} confirmed</span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* UX Principle: Inform user what the AI is doing */}
      {alerts.length > 0 && (
        <div className="info-msg mt-12" style={{ marginBottom: 16 }}>
          🧠 AI matched <strong>{alerts.length} surplus-deficit NGO pairs</strong> using nearest-distance matching.
          Confirm transfers to redistribute food instantly.
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>No redistribution needed right now</p>
            <small>All NGOs are balanced — or load demo data from Dashboard to see alerts</small>
          </div>
        </div>
      ) : (
        alerts.map((a, i) => (
          <div
            key={i}
            className={`alert-card ${confirmed[i] ? "confirmed" : a.urgency === "HIGH" ? "" : "medium"}`}
          >
            {/* UX Principle: Clear information hierarchy */}
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
            </div>
          </div>
        ))
      )}

      {/* UX Principle: Show progress — how many are left */}
      {alerts.length > 0 && pending.length === 0 && (
        <div className="success-msg mt-12">
          🎉 All transfers confirmed! Food is on its way to people who need it.
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
