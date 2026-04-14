import React, { useState, useEffect } from "react";
import { api } from "../api";

function RegisterForm() {
  const [form, setForm] = useState({ ngo_name: "", location: "", latitude: "", longitude: "", contact: "" });
  const [msg, setMsg] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post("/ngo/register", { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) });
    setMsg(res.error ? `❌ ${res.error}` : `✅ ${res.ngo.ngo_name} registered successfully!`);
  };

  return (
    <div className="card">
      <h2>🏢 Register New NGO</h2>
      <form onSubmit={submit}>
        <div><label>NGO Name</label><input required value={form.ngo_name} onChange={e => set("ngo_name", e.target.value)} placeholder="e.g. Helping Hands" /></div>
        <div><label>City / Location</label><input required value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Pune" /></div>
        <div><label>Latitude</label><input required type="number" step="any" value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="e.g. 18.5204" /></div>
        <div><label>Longitude</label><input required type="number" step="any" value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="e.g. 73.8567" /></div>
        <div><label>Contact Number</label><input required value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="e.g. 9800000001" /></div>
        <button type="submit" className="btn btn-primary">Register NGO</button>
      </form>
      {msg && <div className={msg.startsWith("✅") ? "success-msg" : "error-msg"} style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}

function UpdateForm({ ngos }) {
  const [form, setForm] = useState({ ngo_name: "", food_available: "", people_count: "" });
  const [msg, setMsg] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post("/ngo/update", {
      ngo_name: form.ngo_name,
      food_available: Number(form.food_available),
      people_count: Number(form.people_count)
    });
    setMsg(res.error ? `❌ ${res.error}` : `✅ ${res.ngo.ngo_name} updated!`);
  };

  return (
    <div className="card">
      <h2>📝 Update Food Data</h2>
      <form onSubmit={submit}>
        <div>
          <label>Select NGO</label>
          <select required value={form.ngo_name} onChange={e => set("ngo_name", e.target.value)}>
            <option value="">-- Select NGO --</option>
            {ngos.map(n => <option key={n.ngo_name} value={n.ngo_name}>{n.ngo_name}</option>)}
          </select>
        </div>
        <div><label>Food Available (plates)</label><input required type="number" min="0" value={form.food_available} onChange={e => set("food_available", e.target.value)} /></div>
        <div><label>People to Feed</label><input required type="number" min="0" value={form.people_count} onChange={e => set("people_count", e.target.value)} /></div>
        <button type="submit" className="btn btn-primary">Update</button>
      </form>
      {msg && <div className={msg.startsWith("✅") ? "success-msg" : "error-msg"} style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}

export default function RegisterNGO() {
  const [ngos, setNgos] = useState([]);
  useEffect(() => { api.get("/ngos").then(setNgos); }, []);

  return (
    <div className="row">
      <div className="col"><RegisterForm /></div>
      <div className="col"><UpdateForm ngos={ngos} /></div>
    </div>
  );
}
