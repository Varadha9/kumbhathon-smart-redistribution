// History.js
// Shows a log of all past activity — confirmed transfers and submitted donations.
// Useful for NGOs and donors to track what has happened on the platform.

import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function History() {
  const [transfers, setTransfers] = useState([]);  // all confirmed food transfers
  const [donations, setDonations] = useState([]);  // all submitted food donations
  const [tab, setTab]             = useState("transfers");  // which sub-tab is active
  const [loading, setLoading]     = useState(true);
  const { refresh }               = useApp();  // re-fetch when global refresh triggers

  // Fetch both transfers and donations in parallel
  const load = useCallback(async () => {
    setLoading(true);
    const [t, d] = await Promise.all([
      api.get("/history/transfers"),
      api.get("/history/donations")
    ]);
    if (t) setTransfers(t);
    if (d) setDonations(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  // fmt — formats an ISO timestamp into a readable date/time string
  // e.g. "2024-01-15T14:30:00" → "15 Jan 2024, 2:30 pm"
  const fmt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  if (loading) return (
    <div className="spinner-wrap"><div className="spinner" /><span>Loading history...</span></div>
  );

  return (
    <div>
      <div className="section-header">
        <h2>📋 Activity History</h2>
        <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {/* Sub-tab buttons to switch between Transfers and Donations history */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={`btn ${tab === "transfers" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("transfers")}
        >
          🔄 Transfers ({transfers.length})
        </button>
        <button
          className={`btn ${tab === "donations" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("donations")}
        >
          🍛 Donations ({donations.length})
        </button>
      </div>

      {/* Transfers tab — shows all confirmed NGO-to-NGO food transfers */}
      {tab === "transfers" && (
        <div className="card">
          {transfers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔄</div>
              <p>No transfers confirmed yet</p>
              <small>Go to Alerts tab and confirm a transfer to see it here</small>
            </div>
          ) : (
            <table className="ngo-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>From NGO</th>
                  <th>To NGO</th>
                  <th>Meals</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, i) => (
                  <tr key={t.id || i} className="history-row">
                    <td style={{ color: "#a0aec0" }}>{t.id || i + 1}</td>
                    <td>{t.from}</td>
                    <td>{t.to}</td>
                    <td><strong>{t.meals_to_transfer}</strong></td>
                    <td><span className="badge done">Completed</span></td>
                    <td><span className="history-time">{fmt(t.timestamp)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Donations tab — shows all food donations submitted by donors */}
      {tab === "donations" && (
        <div className="card">
          {donations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍛</div>
              <p>No donations submitted yet</p>
              <small>Go to Donate tab and submit a food donation to see it here</small>
            </div>
          ) : (
            <table className="ngo-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donor</th>
                  <th>Quantity</th>
                  <th>Type</th>
                  <th>Matched NGO</th>  {/* which NGO the AI matched this donation to */}
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d, i) => (
                  <tr key={d.id || i} className="history-row">
                    <td style={{ color: "#a0aec0" }}>{d.id || i + 1}</td>
                    <td>{d.donor_name}</td>
                    <td><strong>{d.food_quantity}</strong> plates</td>
                    <td>{d.food_type}</td>
                    {/* Show matched NGO name, or "Pending" if not yet matched */}
                    <td>{d.matched_ngo || <span style={{ color: "#a0aec0" }}>Pending</span>}</td>
                    <td>
                      {/* "matched" = green badge, "pending" = yellow badge */}
                      <span className={`badge ${d.status === "matched" ? "done" : "medium"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td><span className="history-time">{fmt(d.timestamp)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Summary stats at the bottom — total impact numbers */}
      {(transfers.length > 0 || donations.length > 0) && (
        <div className="card" style={{ background: "#f0fff4", border: "1px solid #c6f6d5" }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {/* Total meals moved across all confirmed transfers */}
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1b4332" }}>
                {transfers.reduce((s, t) => s + (t.meals_to_transfer || 0), 0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#718096", textTransform: "uppercase" }}>Total Meals Redistributed</div>
            </div>
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1b4332" }}>{transfers.length}</div>
              <div style={{ fontSize: "0.75rem", color: "#718096", textTransform: "uppercase" }}>Transfers Completed</div>
            </div>
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1b4332" }}>{donations.length}</div>
              <div style={{ fontSize: "0.75rem", color: "#718096", textTransform: "uppercase" }}>Donations Received</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
