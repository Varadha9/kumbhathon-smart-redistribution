import React, { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { api } from "../api";
import { useApp } from "../App";

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [ngos, setNgos]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { showToast, refresh } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    const [s, n] = await Promise.all([api.get("/stats"), api.get("/ngos")]);
    if (s) setStats(s);
    if (n) setNgos(n);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const seedDemo = async () => {
    setSeeding(true);
    const res = await api.post("/seed", {});
    if (res?.message) {
      showToast("Demo data loaded — 4 NGOs added!");
      load();
    } else {
      showToast("Failed to load demo data", "error");
    }
    setSeeding(false);
  };

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
        <button className="btn btn-secondary" onClick={seedDemo} disabled={seeding}>
          {seeding ? "Loading..." : "⚡ Load Demo Data"}
        </button>
      </div>

      {/* UX Principle: Visibility of system status — always show key numbers */}
      {stats && (
        <div className="stats-grid">
          {[
            { value: stats.total_ngos,           label: "NGOs Connected",       color: "#1b4332" },
            { value: stats.total_food_available,  label: "Food Available",       color: "#276749" },
            { value: stats.total_people_to_feed,  label: "People to Feed",       color: "#c05621" },
            { value: stats.meals_redistributed,   label: "Meals Redistributed",  color: "#2b6cb0" },
            { value: stats.active_donations,      label: "Active Donations",     color: "#6b46c1" },
            { value: stats.completed_transfers,   label: "Transfers Done",       color: "#40916c" },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="value" style={{ color: s.color }}>{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {ngos.length === 0 ? (
        /* UX Principle: Empty state with clear call-to-action */
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <p>No NGOs registered yet</p>
            <small>Click "Load Demo Data" above to populate 4 sample NGOs and see the app in action</small>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* UX Principle: Information Organization — table for structured data */}
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
                    const surplus = n.food_available > n.people_count;
                    const diff = Math.abs(n.food_available - n.people_count);
                    return (
                      <tr key={n.ngo_name}>
                        <td><strong>{n.ngo_name}</strong></td>
                        <td>{n.location}</td>
                        <td>{n.food_available}</td>
                        <td>{n.people_count}</td>
                        <td>
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

          {/* UX Principle: Use charts for quick visual comparison */}
          <div className="col">
            <div className="card">
              <div className="section-header">
                <h2>📈 Food vs Need</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={ngos.map(n => ({
                    name: n.ngo_name.split(" ")[0],
                    Food: n.food_available,
                    Need: n.people_count
                  }))}
                  margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.85rem" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                  <Bar dataKey="Food" fill="#40916c" radius={[5,5,0,0]} />
                  <Bar dataKey="Need" fill="#fc8181" radius={[5,5,0,0]} />
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
