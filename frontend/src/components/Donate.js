import React, { useState } from "react";
import { api } from "../api";

export default function Donate() {
  const [form, setForm] = useState({
    donor_name: "", food_quantity: "", food_type: "Veg",
    latitude: "", longitude: "", expiry_hours: "2"
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      pos => { set("latitude", pos.coords.latitude.toFixed(4)); set("longitude", pos.coords.longitude.toFixed(4)); },
      () => setError("Location access denied. Enter manually.")
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setResult(null);
    const res = await api.post("/donate", {
      ...form,
      food_quantity: Number(form.food_quantity),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      expiry_hours: Number(form.expiry_hours)
    });
    if (res.error) setError(res.error);
    else setResult(res);
  };

  return (
    <div>
      <h2>🍛 Donate Food</h2>
      <div className="card">
        <form onSubmit={submit}>
          <div>
            <label>Donor Name / Event</label>
            <input required value={form.donor_name} onChange={e => set("donor_name", e.target.value)} placeholder="e.g. Sharma Wedding" />
          </div>
          <div>
            <label>Food Quantity (plates)</label>
            <input required type="number" min="1" value={form.food_quantity} onChange={e => set("food_quantity", e.target.value)} placeholder="e.g. 50" />
          </div>
          <div>
            <label>Food Type</label>
            <select value={form.food_type} onChange={e => set("food_type", e.target.value)}>
              <option>Veg</option>
              <option>Non-Veg</option>
              <option>Mixed</option>
            </select>
          </div>
          <div>
            <label>Use Within (hours)</label>
            <input type="number" min="1" max="24" value={form.expiry_hours} onChange={e => set("expiry_hours", e.target.value)} />
          </div>
          <div>
            <label>Location</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input required value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="Latitude" />
              <input required value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="Longitude" />
              <button type="button" className="btn btn-secondary" onClick={useMyLocation}>📍 Auto</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Submit Donation</button>
        </form>

        {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}
        {result && (
          <div className="success-msg" style={{ marginTop: 12 }}>
            ✅ Donation submitted! {result.matched_ngo
              ? `Matched with: ${result.matched_ngo}`
              : "No NGO matched yet — will be assigned soon."}
          </div>
        )}
      </div>
    </div>
  );
}
