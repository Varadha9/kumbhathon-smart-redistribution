import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [seeded, setSeeded] = useState(false);

  const load = () => {
    api.get("/stats").then(setStats);
    api.get("/ngos").then(setNgos);
  };

  useEffect(() => { load(); }, []);

  const seedDemo = async () => {
    await api.post("/seed", {});
    setSeeded(true);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2>📊 Dashboard</h2>
        <button className="btn btn-secondary seed-btn" onClick={seedDemo}>
          {seeded ? "✅ Demo Data Loaded" : "Load Demo Data"}
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="value">{stats.total_ngos}</div><div className="label">NGOs Connected</div></div>
          <div className="stat-card"><div className="value">{stats.total_food_available}</div><div className="label">Food Available (plates)</div></div>
          <div className="stat-card"><div className="value">{stats.total_people_to_feed}</div><div className="label">People to Feed</div></div>
          <div className="stat-card"><div className="value">{stats.meals_redistributed}</div><div className="label">Meals Redistributed</div></div>
          <div className="stat-card"><div className="value">{stats.active_donations}</div><div className="label">Active Donations</div></div>
          <div className="stat-card"><div className="value">{stats.completed_transfers}</div><div className="label">Completed Transfers</div></div>
        </div>
      )}

      {ngos.length > 0 && (
        <div className="row">
          <div className="col">
            <div className="card">
              <h2>🏢 NGO Status</h2>
              <table className="ngo-table">
                <thead>
                  <tr><th>NGO</th><th>Location</th><th>Food</th><th>People</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {ngos.map(n => (
                    <tr key={n.ngo_name}>
                      <td>{n.ngo_name}</td>
                      <td>{n.location}</td>
                      <td>{n.food_available}</td>
                      <td>{n.people_count}</td>
                      <td>
                        {n.food_available > n.people_count
                          ? <span className="surplus">✅ Surplus</span>
                          : <span className="deficit">⚠️ Deficit</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col">
            <div className="card">
              <h2>📈 Food vs Need</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ngos.map(n => ({ name: n.ngo_name.split(" ")[0], Food: n.food_available, Need: n.people_count }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Food" fill="#40916c" radius={[4,4,0,0]} />
                  <Bar dataKey="Need" fill="#fc8181" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
