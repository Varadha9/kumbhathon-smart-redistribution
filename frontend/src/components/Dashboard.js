// Dashboard.js
// The main overview screen — shows platform stats, NGO status table, and a bar chart.
// This is the first thing users see after logging in.

import React, { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { api } from "../api";
import { useApp } from "../App";

export default function Dashboard() {
  const [stats, setStats]     = useState(null);   // platform-wide numbers (total NGOs, meals, etc.)
  const [ngos, setNgos]       = useState([]);     // list of all registered NGOs
  const [loading, setLoading] = useState(true);   // show spinner while fetching
  const [seeding, setSeeding] = useState(false);  // show loading state on "Load Demo Data" button
  const { showToast, refresh } = useApp();        // global toast + refresh trigger from App.js

  // load() fetches both stats and NGO list in parallel (faster than sequential)
  const load = useCallback(async () => {
    setLoading(true);
    const [s, n] = await Promise.all([api.get("/stats"), api.get("/ngos")]);
    if (s) setStats(s);
    if (n) setNgos(n);
    setLoading(false);
  }, []);

  // Re-fetch data whenever the component mounts OR when a global refresh is triggered
  // (e.g. after a transfer is confirmed in the Alerts tab)
  useEffect(() => { load(); }, [load, refresh]);

  // seedDemo — loads 4 sample NGOs via the /seed API endpoint
  // Used for demo purposes so judges/users can see the app in action immediately
  const seedDemo = async () => {
    setSeeding(true);
    const res = await api.post("/seed", {});
    if (res?.message) {
      showToast("Demo data loaded — 4 NGOs added!");
      load();  // reload the dashboard to show the new NGOs
    } else {
      showToast("Failed to load demo data", "error");
    }
    setSeeding(false);
  };

  // Show spinner while data is loading
  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <h2>📊 Dashboard</h2>
        {/* Demo data button — seeds 4 NGOs so the app has data to show */}
        <button className="btn btn-secondary" onClick={seedDemo} disabled={seeding}>
          {seeding ? "Loading..." : "⚡ Load Demo Data"}
        </button>
      </div>

      {/* Stat cards — 6 key numbers shown at the top of the dashboard */}
      {stats && (
        <div className="stats-grid">
          {[
            { value: stats.total_ngos,           label: "NGOs Connected",      color: "#1b4332" },
            { value: stats.total_food_available,  label: "Food Available",      color: "#276749" },
            { value: stats.total_people_to_feed,  label: "People to Feed",      color: "#c05621" },
            { value: stats.meals_redistributed,   label: "Meals Redistributed", color: "#2b6cb0" },
            { value: stats.active_donations,      label: "Active Donations",    color: "#6b46c1" },
            { value: stats.completed_transfers,   label: "Transfers Done",      color: "#40916c" },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state — shown when no NGOs are registered yet */}
      {ngos.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <p>No NGOs registered yet</p>
            <small>Click "Load Demo Data" above to populate 4 sample NGOs and see the app in action</small>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Left column: NGO status table */}
          <div className="col">
            <div className="card">
              <div className="section-header">
                <h2>🏢 NGO Status</h2>
                <span style={{ fontSize: "0.8rem", color: "#718096" }}>{ngos.length} NGOs</span>
              </div>
              <table className="ngo-table">
                <thead>
                  <tr>
                    <th>NGO Name</th>
                    <th>Location</th>
                    <th>Food</th>
                    <th>People</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(n => {
                    const surplus = n.food_available > n.people_count;  // true = has extra food
                    const diff    = Math.abs(n.food_available - n.people_count);  // how much surplus/deficit
                    return (
                      <tr key={n.ngo_name}>
                        <td><strong>{n.ngo_name}</strong></td>
                        <td>{n.location}</td>
                        <td>{n.food_available}</td>
                        <td>{n.people_count}</td>
                        <td>
                          {/* Green pill for surplus, orange pill for deficit */}
                          <span className={`pill ${surplus ? "surplus" : "deficit"}`}>
                            {surplus ? "✅ +" : "⚠️ -"}{diff}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column: Bar chart comparing food available vs people to feed */}
          <div className="col">
            <div className="card">
              <div className="section-header">
                <h2>📈 Food vs Need</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  // Transform NGO data into chart format: { name, Food, Need }
                  data={ngos.map(n => ({
                    name: n.ngo_name.split(" ")[0],  // use first word of name to save space
                    Food: n.food_available,
                    Need: n.people_count
                  }))}
                  margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.85rem" }} />
                  <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                  <Bar dataKey="Food" fill="#40916c" radius={[5,5,0,0]} />  {/* green = food available */}
                  <Bar dataKey="Need" fill="#fc8181" radius={[5,5,0,0]} />  {/* red = people to feed */}
                </BarChart>
              </ResponsiveContainer>
              <p style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: 8, textAlign: "center" }}>
                Green bars above red = surplus &nbsp;|&nbsp; Red bars above green = deficit
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
