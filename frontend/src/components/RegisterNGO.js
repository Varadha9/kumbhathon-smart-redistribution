import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { useApp } from "../App";

function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ ngo_name: "", location: "", latitude: "", longitude: "", contact: "" });
  const [msg, setMsg]   = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast }   = useApp();
  const set = (k, v)    => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    const res = await api.post("/ngo/register", {
      ...form,
      latitude:  Number(form.latitude),
      longitude: Number(form.longitude)
    });
    setLoading(false);
    if (res?.error) {
      setMsg(`error:${res.error}`);
    } else {
      setMsg(`success:${res.ngo.ngo_name} registered successfully!`);
      showToast(`${res.ngo.ngo_name} added to the network!`);
      setForm({ ngo_name: "", location: "", latitude: "", longitude: "", contact: "" });
      onSuccess();
    }
  };

  const [type, text] = msg ? msg.split(/:(.+)/) : ["", ""];

  return (
    <div className="card">
      <h2 style={{ marginBottom: 6 }}>🏢 Register New NGO</h2>
      <p style={{ fontSize: "0.83rem", color: "#718096", marginBottom: 18 }}>
        Add your NGO to the network so the AI can match food donations to your location.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="field form-full">
            <label>NGO Name</label>
            <input required value={form.ngo_name} onChange={e => set("ngo_name", e.target.value)} placeholder="e.g. Helping Hands Foundation" />
          </div>
          <div className="field form-full">
            <label>City / Location</label>
            <input required value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Pune, Maharashtra" />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input required type="number" step="any" value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="e.g. 18.5204" />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input required type="number" step="any" value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="e.g. 73.8567" />
          </div>
          <div className="field form-full">
            <label>Contact Number</label>
            <input required value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="e.g. 9800000001" />
            <span className="form-hint">Used for coordination during food transfers</span>
          </div>
          <div className="form-full">
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 11 }}>
              {loading ? "Registering..." : "Register NGO"}
            </button>
          </div>
        </div>
      </form>
      {text && (
        <div className={`${type === "success" ? "success-msg" : "error-msg"} mt-12`}>{text}</div>
      )}
    </div>
  );
}

function UpdateForm({ ngos }) {
  const [form, setForm] = useState({ ngo_name: "", food_available: "", people_count: "" });
  const [msg, setMsg]   = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast }   = useApp();
  const set = (k, v)    => setForm(f => ({ ...f, [k]: v }));

  // UX Principle: Pre-fill current values when NGO is selected
  const handleSelect = (name) => {
    set("ngo_name", name);
    const ngo = ngos.find(n => n.ngo_name === name);
    if (ngo) {
      set("food_available", ngo.food_available);
      set("people_count",   ngo.people_count);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    const res = await api.post("/ngo/update", {
      ngo_name:       form.ngo_name,
      food_available: Number(form.food_available),
      people_count:   Number(form.people_count)
    });
    setLoading(false);
    if (res?.error) {
      setMsg(`error:${res.error}`);
    } else {
      setMsg(`success:${res.ngo.ngo_name} updated successfully!`);
      showToast(`${res.ngo.ngo_name} food data updated!`);
    }
  };

  const selected = ngos.find(n => n.ngo_name === form.ngo_name);
  const [type, text] = msg ? msg.split(/:(.+)/) : ["", ""];

  return (
    <div className="card">
      <h2 style={{ marginBottom: 6 }}>📝 Update Food Data</h2>
      <p style={{ fontSize: "0.83rem", color: "#718096", marginBottom: 18 }}>
        Update your current food stock and number of people to feed. The AI uses this to generate alerts.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="field form-full">
            <label>Select NGO</label>
            <select required value={form.ngo_name} onChange={e => handleSelect(e.target.value)}>
              <option value="">-- Select your NGO --</option>
              {ngos.map(n => <option key={n.ngo_name} value={n.ngo_name}>{n.ngo_name} ({n.location})</option>)}
            </select>
          </div>

          {/* UX Principle: Show current values as context */}
          {selected && (
            <div className="field form-full">
              <div className="info-msg" style={{ fontSize: "0.82rem" }}>
                Current: <strong>{selected.food_available}</strong> food plates &nbsp;|&nbsp;
                <strong>{selected.people_count}</strong> people to feed &nbsp;|&nbsp;
                <span style={{ color: selected.food_available > selected.people_count ? "#276749" : "#c53030", fontWeight: 600 }}>
                  {selected.food_available > selected.people_count ? "✅ Surplus" : "⚠️ Deficit"}
                </span>
              </div>
            </div>
          )}

          <div className="field">
            <label>Food Available (plates)</label>
            <input required type="number" min="0" value={form.food_available} onChange={e => set("food_available", e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>People to Feed</label>
            <input required type="number" min="0" value={form.people_count} onChange={e => set("people_count", e.target.value)} placeholder="0" />
          </div>
          <div className="form-full">
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: 11 }}>
              {loading ? "Updating..." : "Update Food Data"}
            </button>
          </div>
        </div>
      </form>
      {text && (
        <div className={`${type === "success" ? "success-msg" : "error-msg"} mt-12`}>{text}</div>
      )}
    </div>
  );
}

export default function RegisterNGO() {
  const [ngos, setNgos] = useState([]);
  const { refresh }     = useApp();

  const load = useCallback(async () => {
    const data = await api.get("/ngos");
    if (data) setNgos(data);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  return (
    <div>
      <div className="section-header">
        <h2>🏢 NGO Management</h2>
      </div>
      <div className="row">
        <div className="col"><RegisterForm onSuccess={load} /></div>
        <div className="col"><UpdateForm ngos={ngos} /></div>
      </div>
    </div>
  );
}
