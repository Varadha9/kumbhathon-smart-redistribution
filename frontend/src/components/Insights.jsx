import React, { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { api } from "../api";
import { useApp } from "../App";

const COLORS = ["#40916c", "#e8590c", "#1971c2", "#e67700", "#c92a2a", "#7048e8"];

export default function Insights() {
  const [data, setData]       = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenId, setTokenId] = useState("");
  const [fbForm, setFbForm]   = useState({ rating: 5, food_quality: "Good", wait_time: "< 5 min", comment: "" });
  const [fbResult, setFbResult] = useState(null);
  const [fbError, setFbError] = useState("");
  const { refresh, showToast } = useApp();

  const load = useCallback(async () => {
    setLoading(true);
    const [ins, fbs] = await Promise.all([
      api.get("/visitor/insights"),
      api.get("/visitor/feedbacks"),
    ]);
    if (ins) setData(ins);
    if (fbs) setFeedbacks(fbs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  async function submitFeedback(e) {
    e.preventDefault();
    setFbError(""); setFbResult(null);
    if (!tokenId.trim()) { setFbError("Enter your token ID"); return; }
    const res = await api.post("/visitor/feedback", {
      token_id: tokenId.trim().toUpperCase(),
      ...fbForm,
      rating: Number(fbForm.rating),
    });
    if (!res || res.error) { setFbError(res?.error || "Failed"); return; }
    setFbResult(res);
    showToast("🙏 Thank you for your feedback!");
    setTokenId(""); setFbForm({ rating: 5, food_quality: "Good", wait_time: "< 5 min", comment: "" });
    load();
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /><span>Loading insights...</span></div>;

  const cs = data?.crowd_stats || {};
  const perCenter = cs.per_center || {};

  const centerChartData = Object.entries(perCenter).map(([name, count]) => ({
    name: name.split(" ").slice(0, 2).join(" "),
    Visitors: count,
  }));

  const ratingData = Object.entries(data?.rating_distribution || {}).map(([label, count]) => ({
    name: label, value: Number(count),
  }));

  const qualityData = Object.entries(data?.quality_distribution || {}).map(([label, count]) => ({
    name: label, value: Number(count),
  }));

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>🧠 AI Insights & Feedback</h2>
      <p style={{ color: "var(--text-3)", fontSize: "0.88rem", marginBottom: 24 }}>
        Real-time crowd analytics, food quality feedback, and waste reduction insights.
      </p>

      <div className="workflow-steps">
        {["Register & Get QR", "AI Predicts Demand", "Smart Slot Allocated", "Scan & Get Food", "Give Feedback"].map((s, i) => (
          <div key={i} className={`workflow-step ${i === 4 ? "active" : "done"}`}>
            <div className="ws-num">{i < 4 ? "✓" : i + 1}</div>
            <div className="ws-label">{s}</div>
          </div>
        ))}
      </div>

      {/* Key metrics */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: "🎫", value: cs.total_registered || 0,   label: "Registered" },
          { icon: "✅", value: cs.total_served || 0,        label: "Served" },
          { icon: "⏳", value: cs.total_pending || 0,       label: "Pending" },
          { icon: "🍛", value: cs.total_meals_served || 0,  label: "Meals Served" },
          { icon: "⚠️", value: data?.waste_meals_estimate || 0, label: "Waste Estimate" },
          { icon: "⭐", value: data?.avg_rating ? `${data.avg_rating}/5` : "—", label: "Avg Rating" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <div className="value">{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Crowd load per center */}
        <div className="col">
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: "0.95rem" }}>📊 Crowd Load per Center</h3>
            {centerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={centerChartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.82rem" }} />
                  <Bar dataKey="Visitors" fill="var(--accent)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <div className="empty-icon">📊</div>
                <p>No data yet</p>
                <small>Register visitors to see crowd distribution</small>
              </div>
            )}
            <div className="info-msg" style={{ marginTop: 12, fontSize: "0.78rem" }}>
              ⚡ Demand multiplier: <strong>{cs.demand_multiplier}x</strong> — AI adjusts slot capacity in real-time
            </div>
          </div>
        </div>

        {/* Rating distribution */}
        <div className="col">
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: "0.95rem" }}>⭐ Feedback Ratings</h3>
            {ratingData.some(r => r.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={ratingData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                    {ratingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: "32px 0" }}>
                <div className="empty-icon">⭐</div>
                <p>No feedback yet</p>
                <small>Visitors can submit feedback after being served</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Food quality + wait time */}
      {(qualityData.length > 0 || feedbacks.length > 0) && (
        <div className="row">
          <div className="col">
            <div className="card">
              <h3 style={{ marginBottom: 14, fontSize: "0.95rem" }}>🍛 Food Quality Breakdown</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {qualityData.map((q, i) => (
                  <div key={q.name} style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)", padding: "12px 18px", textAlign: "center"
                  }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: COLORS[i % COLORS.length] }}>{q.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 700 }}>{q.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card">
              <h3 style={{ marginBottom: 14, fontSize: "0.95rem" }}>💬 Recent Comments</h3>
              {feedbacks.filter(f => f.comment).slice(-4).reverse().map(f => (
                <div key={f.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ color: "#f59e0b" }}>{"⭐".repeat(f.rating)}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{f.food_center?.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>{f.comment}</p>
                </div>
              ))}
              {feedbacks.filter(f => f.comment).length === 0 && (
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>No comments yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback form */}
      <div className="card" style={{ marginTop: 8 }}>
        <h3 style={{ marginBottom: 4, fontSize: "1rem" }}>📝 Submit Your Feedback</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: 18 }}>Already been served? Tell us how it was.</p>
        <form onSubmit={submitFeedback}>
          <div className="form-grid">
            <div className="field">
              <label>Your Token ID</label>
              <input value={tokenId} onChange={e => setTokenId(e.target.value.toUpperCase())} placeholder="KA-00001" />
            </div>
            <div className="field">
              <label>Rating</label>
              <select value={fbForm.rating} onChange={e => setFbForm(f => ({ ...f, rating: e.target.value }))}>
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Poor</option>
                <option value="1">⭐ Very Poor</option>
              </select>
            </div>
            <div className="field">
              <label>Food Quality</label>
              <select value={fbForm.food_quality} onChange={e => setFbForm(f => ({ ...f, food_quality: e.target.value }))}>
                <option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option>
              </select>
            </div>
            <div className="field">
              <label>Wait Time</label>
              <select value={fbForm.wait_time} onChange={e => setFbForm(f => ({ ...f, wait_time: e.target.value }))}>
                <option>{"< 5 min"}</option><option>5-10 min</option><option>{"> 10 min"}</option>
              </select>
            </div>
            <div className="field form-full">
              <label>Comment (optional)</label>
              <input value={fbForm.comment} onChange={e => setFbForm(f => ({ ...f, comment: e.target.value }))} placeholder="Any suggestions to improve?" />
            </div>
            <div className="form-full">
              <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", padding: "10px 24px" }}>
                🙏 Submit Feedback
              </button>
            </div>
          </div>
        </form>
        {fbError  && <div className="error-msg mt-12">{fbError}</div>}
        {fbResult && <div className="success-msg mt-12">🙏 {fbResult.message}</div>}
      </div>
    </div>
  );
}
