import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function Volunteer() {
  const [transfers, setTransfers]   = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [form, setForm]             = useState({ transfer_id: "", volunteer_name: "", volunteer_phone: "", from_ngo: "", to_ngo: "", meals: "" });
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState({});
  const { showToast, refresh }      = useApp();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    const [t, v] = await Promise.all([
      api.get("/history/transfers"),
      api.get("/volunteer/list"),
    ]);
    if (t) setTransfers(t);
    if (v) setVolunteers(v);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  // When a transfer is selected from dropdown, auto-fill from/to/meals
  const handleTransferSelect = (idx) => {
    const t = transfers[parseInt(idx)];
    if (!t) { set("transfer_id", ""); return; }
    setForm(f => ({
      ...f,
      transfer_id: t.id || idx,
      from_ngo:    t.from  || "",
      to_ngo:      t.to    || "",
      meals:       t.meals_to_transfer || "",
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await api.post("/volunteer/assign", {
      ...form,
      meals: Number(form.meals),
    });
    setSubmitting(false);
    if (res?.error) {
      showToast(res.error, "error");
    } else {
      showToast(`🚴 ${form.volunteer_name} dispatched to deliver ${form.meals} meals!`);
      setForm({ transfer_id: "", volunteer_name: "", volunteer_phone: "", from_ngo: "", to_ngo: "", meals: "" });
      load();
    }
  };

  const markDelivered = async (id) => {
    setCompleting(prev => ({ ...prev, [id]: true }));
    const res = await api.post("/volunteer/complete", { id });
    if (res?.assignment) {
      showToast("✅ Delivery marked as complete!");
      load();
    } else {
      showToast("Failed to update", "error");
    }
    setCompleting(prev => ({ ...prev, [id]: false }));
  };

  const fmt = (iso) => iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const dispatched  = volunteers.filter(v => v.status === "dispatched");
  const delivered   = volunteers.filter(v => v.status === "delivered");

  if (loading) return (
    <div className="spinner-wrap"><div className="spinner" /><span>Loading volunteer dispatch...</span></div>
  );

  return (
    <div>
      <div className="section-header">
        <h2>🚴 Volunteer Dispatch</h2>
        <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      <div className="info-msg" style={{ marginBottom: 20 }}>
        📱 When a volunteer is assigned, <strong>WhatsApp messages</strong> are automatically sent to the volunteer and the receiving camp with pickup/delivery details.
      </div>

      <div className="row">
        {/* Left: Assign form */}
        <div className="col">
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: "1rem" }}>➕ Assign Volunteer to Transfer</h3>
            <form onSubmit={submit}>
              <div className="form-grid">

                <div className="field form-full">
                  <label>Select Confirmed Transfer</label>
                  <select
                    required
                    value={form.transfer_id}
                    onChange={e => handleTransferSelect(e.target.value)}
                  >
                    <option value="">-- Select a transfer --</option>
                    {transfers.map((t, i) => (
                      <option key={i} value={i}>
                        #{t.id} — {t.from} → {t.to} ({t.meals_to_transfer} meals)
                      </option>
                    ))}
                  </select>
                  {transfers.length === 0 && (
                    <span className="form-hint">No confirmed transfers yet — confirm a transfer in the Alerts tab first</span>
                  )}
                </div>

                {form.from_ngo && (
                  <div className="field form-full">
                    <div className="info-msg" style={{ fontSize: "0.82rem" }}>
                      📦 Pickup: <strong>{form.from_ngo}</strong> &nbsp;→&nbsp; 📬 Deliver to: <strong>{form.to_ngo}</strong> &nbsp;|&nbsp; 🍛 <strong>{form.meals} meals</strong>
                    </div>
                  </div>
                )}

                <div className="field form-full">
                  <label>Volunteer Name</label>
                  <input
                    required
                    value={form.volunteer_name}
                    onChange={e => set("volunteer_name", e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div className="field form-full">
                  <label>Volunteer Phone (WhatsApp)</label>
                  <input
                    required
                    value={form.volunteer_phone}
                    onChange={e => set("volunteer_phone", e.target.value)}
                    placeholder="e.g. 9800012345"
                  />
                  <span className="form-hint">WhatsApp dispatch message will be sent to this number</span>
                </div>

                <div className="form-full">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !form.transfer_id}
                    style={{ width: "100%", justifyContent: "center", padding: 11 }}
                  >
                    {submitting ? "Dispatching..." : "🚴 Dispatch Volunteer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Live dispatch board */}
        <div className="col">
          <div className="card">
            <div className="section-header">
              <h3 style={{ fontSize: "1rem" }}>📋 Live Dispatch Board</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge" style={{ background: "#feebc8", color: "#c05621" }}>{dispatched.length} active</span>
                <span className="badge done">{delivered.length} delivered</span>
              </div>
            </div>

            {volunteers.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <div className="empty-icon">🚴</div>
                <p>No volunteers dispatched yet</p>
                <small>Assign a volunteer to a confirmed transfer to see them here</small>
              </div>
            ) : (
              <div>
                {volunteers.slice().reverse().map(v => (
                  <div key={v.id} className={`volunteer-card ${v.status}`}>
                    <div className="volunteer-info">
                      <div className="volunteer-name">
                        🚴 <strong>{v.volunteer_name}</strong>
                        <span className={`badge ${v.status === "delivered" ? "done" : "medium"}`} style={{ marginLeft: 8 }}>
                          {v.status === "delivered" ? "✅ Delivered" : "🔄 En Route"}
                        </span>
                      </div>
                      <div className="volunteer-route">
                        📦 {v.from_ngo} → 📬 {v.to_ngo}
                      </div>
                      <div className="volunteer-meta">
                        🍛 {v.meals} meals &nbsp;|&nbsp; 📞 {v.volunteer_phone} &nbsp;|&nbsp; 🕐 {fmt(v.timestamp)}
                      </div>
                      {v.delivered_at && (
                        <div className="volunteer-meta" style={{ color: "#276749" }}>
                          ✅ Delivered at {fmt(v.delivered_at)}
                        </div>
                      )}
                    </div>
                    {v.status === "dispatched" && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => markDelivered(v.id)}
                        disabled={completing[v.id]}
                      >
                        {completing[v.id] ? "..." : "✅ Mark Delivered"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
