import React, { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { api } from "../api";
import { useApp } from "../App";

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [impact, setImpact]   = useState(null);
  const [ngos, setNgos]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { showToast, refresh } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    const [s, n, imp] = await Promise.all([
      api.get("/stats"),
      api.get("/ngos"),
      api.get("/impact"),
    ]);
    if (s)   setStats(s);
    if (n)   setNgos(n);
    if (imp) setImpact(imp);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const seedDemo = async () => {
    setSeeding(true);
    const res = await api.post("/seed", {});
    if (res?.message) {
      showToast("Kumbh demo data loaded — 6 camp NGOs added!");
      load();
    } else {
      showToast("Failed to load demo data", "error");
    }
    setSeeding(false);
  };

  if (loading) return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span>Loading Kumbh dashboard...</span>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <h2>🪔 Kumbh Mela Food Dashboard</h2>
        <button className="btn btn-secondary" onClick={seedDemo} disabled={seeding}>
          {seeding ? "Loading..." : "⚡ Load Kumbh Demo Data"}
        </button>
      </div>

      {/* Kumbh Live Impact Banner */}
      {impact && impact.meals_saved_at_kumbh > 0 && (
        <div className="kumbh-impact-banner">
          <span className="banner-title">🪔 Live Impact</span>
          <span>🍛 <strong>{impact.meals_saved_at_kumbh}</strong> meals saved</span>
          <span>🌿 <strong>{impact.co2_saved_kg} kg</strong> CO₂ saved</span>
          <span>💧 <strong>{impact.water_saved_litres}L</strong> water saved</span>
          <span>🗺️ <strong>{impact.zones_covered}</strong> zones active</span>
          <span>🙏 <strong>{impact.pilgrims_served}</strong> pilgrims served</span>
        </div>
      )}

      {stats && (
        <div className="stats-grid">
          {[
            { icon: "🏛️", value: stats.total_ngos,           label: "Camps Connected"     },
            { icon: "🍛", value: stats.total_food_available,  label: "Food Available"      },
            { icon: "🙏", value: stats.total_people_to_feed,  label: "Pilgrims to Feed"    },
            { icon: "✅", value: stats.meals_redistributed,   label: "Meals Redistributed" },
            { icon: "🤝", value: stats.active_donations,      label: "Active Donations"    },
            { icon: "🚚", value: stats.completed_transfers,   label: "Transfers Done"      },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <span className="stat-icon">{s.icon}</span>
              <div className="value">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {ngos.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🪔</div>
            <p>No Kumbh camps registered yet</p>
            <small>Click "Load Kumbh Demo Data" to populate 6 real Prayagraj camp NGOs</small>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="section-header">
                <h2>🏕️ Camp Status</h2>
                <span style={{ fontSize: "0.8rem", color: "#718096" }}>{ngos.length} camps</span>
              </div>
              <table className="ngo-table">
                <thead>
                  <tr>
                    <th>Camp / NGO</th>
                    <th>Zone</th>
                    <th>Food</th>
                    <th>Pilgrims</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(n => {
                    const surplus = n.food_available > n.people_count;
                    const diff    = Math.abs(n.food_available - n.people_count);
                    return (
                      <tr key={n.ngo_name}>
                        <td><strong>{n.ngo_name}</strong></td>
                        <td style={{ fontSize: "0.78rem", color: "#718096" }}>{n.kumbh_zone || "—"}</td>
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

          <div className="col">
            <div className="card">
              <div className="section-header">
                <h2>📈 Food vs Pilgrim Need</h2>
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
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.85rem" }} />
                  <Legend wrapperStyle={{ fontSize: "0.82rem" }} />
                  <Bar dataKey="Food" fill="#40916c" radius={[5,5,0,0]} />
                  <Bar dataKey="Need" fill="#fc8181" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <p style={{ fontSize: "0.75rem", color: "#a0aec0", marginTop: 8, textAlign: "center" }}>
                Green above red = surplus &nbsp;|&nbsp; Red above green = deficit
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
