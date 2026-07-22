import React, { useState } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function VisitorRegister() {
  const [form, setForm]     = useState({ visitor_name: "", phone: "", kumbh_zone: "", party_size: "1" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const { showToast }       = useApp();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true);
    const res = await api.post("/visitor/register", { ...form, party_size: Number(form.party_size) });
    setLoading(false);
    if (!res || res.error) { setError(res?.error || "Registration failed"); return; }
    setResult(res);
    showToast(`✅ Token ${res.token_id} issued!`);
    setForm({ visitor_name: "", phone: "", kumbh_zone: "", party_size: "1" });
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>🎫 Visitor Registration</h2>
      <p style={{ color: "var(--text-3)", fontSize: "0.88rem", marginBottom: 24 }}>
        Register to get your QR food token. Our AI will assign you the nearest food center and a time slot to avoid queues.
      </p>

      {/* Workflow steps banner */}
      <div className="workflow-steps">
        {["Register & Get QR", "AI Predicts Demand", "Smart Slot Allocated", "Scan & Get Food", "Give Feedback"].map((s, i) => (
          <div key={i} className={`workflow-step ${i === 0 ? "active" : i < 1 ? "done" : ""}`}>
            <div className="ws-num">{i + 1}</div>
            <div className="ws-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col">
          <div className="card">
            <h3 style={{ marginBottom: 18, fontSize: "1rem" }}>📝 Enter Your Details</h3>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="field form-full">
                  <label>Your Name</label>
                  <input required value={form.visitor_name} onChange={e => set("visitor_name", e.target.value)} placeholder="e.g. Ramesh Sharma" />
                </div>
                <div className="field form-full">
                  <label>WhatsApp Number <span style={{ fontWeight: 400, textTransform: "none" }}>(optional — token sent via WhatsApp)</span></label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="e.g. 9800012345" />
                </div>
                <div className="field">
                  <label>Your Kumbh Zone</label>
                  <select value={form.kumbh_zone} onChange={e => set("kumbh_zone", e.target.value)}>
                    <option value="">-- Select Zone --</option>
                    <option>Zone A - Sangam</option>
                    <option>Zone B - Ganga</option>
                    <option>Zone C - Tent City</option>
                    <option>Zone D - Yamuna</option>
                    <option>Zone E - Outer Camp</option>
                  </select>
                </div>
                <div className="field">
                  <label>Party Size (people)</label>
                  <input required type="number" min="1" max="20" value={form.party_size} onChange={e => set("party_size", e.target.value)} />
                </div>
                <div className="form-full">
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 11 }}>
                    {loading ? "Allocating…" : "🎫 Get My Food Token"}
                  </button>
                </div>
              </div>
            </form>
            {error && <div className="error-msg mt-12">{error}</div>}
          </div>
        </div>

        <div className="col" style={{ maxWidth: 340 }}>
          {result ? (
            <div className="card qr-token-card">
              <div className="qr-token-header">
                <span className="qr-token-badge">✅ Token Issued</span>
              </div>
              <div className="qr-code-box">
                <div className="qr-code-inner">
                  <div className="qr-pattern">
                    {/* Visual QR representation */}
                    <div className="qr-corner tl" /><div className="qr-corner tr" /><div className="qr-corner bl" />
                    <div className="qr-token-id">{result.token_id}</div>
                  </div>
                </div>
              </div>
              <div className="qr-details">
                <div className="qr-row"><span>👤 Name</span><strong>{result.visitor_name}</strong></div>
                <div className="qr-row"><span>👥 Party</span><strong>{result.party_size} people</strong></div>
                <div className="qr-row highlight"><span>📍 Food Center</span><strong>{result.food_center}</strong></div>
                <div className="qr-row highlight"><span>⏰ Time Slot</span><strong>{result.time_slot}</strong></div>
                {result.kumbh_zone && <div className="qr-row"><span>🗺️ Zone</span><strong>{result.kumbh_zone}</strong></div>}
              </div>
              <div className="qr-instruction">
                Show this token at <strong>{result.food_center}</strong> between <strong>{result.time_slot}</strong>
              </div>
              {result.whatsapp_sent && (
                <div className="success-msg" style={{ marginTop: 10, fontSize: "0.8rem" }}>
                  📱 Token details sent to your WhatsApp!
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: 14, fontSize: "0.95rem" }}>🧠 How AI Allocates</h3>
              {[
                { icon: "📊", text: "Analyses current crowd load across all 6 food centers" },
                { icon: "⏰", text: "Picks the least-busy time slot in the next 3 hours" },
                { icon: "📍", text: "Prefers the center closest to your Kumbh zone" },
                { icon: "⚖️", text: "Balances 50 visitors per slot to eliminate queues" },
              ].map(s => (
                <div key={s.icon} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                  <p style={{ fontSize: "0.83rem", color: "var(--text-2)", lineHeight: 1.5 }}>{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
