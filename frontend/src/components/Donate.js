// Donate.js
// Form for donors (restaurants, events, canteens) to submit surplus food.
// After submission, the backend auto-matches the donation to the nearest deficit NGO.

import React, { useState } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function Donate() {
  // Form state — holds all input field values
  const [form, setForm] = useState({
    donor_name:    "",
    food_quantity: "",
    food_type:     "Veg",
    latitude:      "",
    longitude:     "",
    expiry_hours:  "2"
  });
  const [result, setResult]     = useState(null);   // response from backend after submission
  const [error, setError]       = useState("");     // error message to show user
  const [loading, setLoading]   = useState(false);  // disable submit button while posting
  const [locating, setLocating] = useState(false);  // show loading on GPS button
  const { showToast } = useApp();

  // Helper to update a single form field without overwriting others
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // useMyLocation — uses browser's Geolocation API to auto-fill lat/lng
  // This reduces friction for donors — they don't need to look up coordinates
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        // Success: fill in the coordinates from the browser
        set("latitude",  pos.coords.latitude.toFixed(4));
        set("longitude", pos.coords.longitude.toFixed(4));
        setLocating(false);
        showToast("Location detected successfully!");
      },
      () => {
        // Failure: user denied location access or GPS unavailable
        setError("Location access denied. Please enter coordinates manually.");
        setLocating(false);
      }
    );
  };

  // submit — sends the donation form to the backend
  // Backend will auto-match it to the nearest deficit NGO
  const submit = async (e) => {
    e.preventDefault();  // prevent page reload on form submit
    setError(""); setResult(null); setLoading(true);

    const res = await api.post("/donate", {
      ...form,
      food_quantity: Number(form.food_quantity),  // convert string inputs to numbers
      latitude:      Number(form.latitude),
      longitude:     Number(form.longitude),
      expiry_hours:  Number(form.expiry_hours)
    });

    setLoading(false);

    if (!res || res.error) {
      setError(res?.error || "Something went wrong. Try again.");
    } else {
      setResult(res);  // show the matched NGO name in the success message
      showToast("Donation submitted successfully!");
      // Reset form so donor can submit another donation
      setForm({ donor_name: "", food_quantity: "", food_type: "Veg", latitude: "", longitude: "", expiry_hours: "2" });
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>🍛 Donate Food</h2>
      <p style={{ color: "#718096", fontSize: "0.88rem", marginBottom: 20 }}>
        Submit surplus food from your event, restaurant, or canteen. Our AI will instantly match it to the nearest NGO in need.
      </p>

      <div className="row">
        {/* Left column: the donation form */}
        <div className="col">
          <div className="card">
            <form onSubmit={submit}>
              <div className="form-grid">

                {/* Donor name — identifies who is donating */}
                <div className="field form-full">
                  <label>Donor Name / Event</label>
                  <input
                    required
                    value={form.donor_name}
                    onChange={e => set("donor_name", e.target.value)}
                    placeholder="e.g. Sharma Wedding, Hotel Taj, School Canteen"
                  />
                </div>

                {/* Food quantity — number of plates/meals being donated */}
                <div className="field">
                  <label>Food Quantity (plates)</label>
                  <input
                    required type="number" min="1"
                    value={form.food_quantity}
                    onChange={e => set("food_quantity", e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>

                {/* Food type — helps NGOs know if it's suitable for their beneficiaries */}
                <div className="field">
                  <label>Food Type</label>
                  <select value={form.food_type} onChange={e => set("food_type", e.target.value)}>
                    <option>Veg</option>
                    <option>Non-Veg</option>
                    <option>Mixed</option>
                  </select>
                </div>

                {/* Expiry hours — how long the food is safe to eat */}
                <div className="field form-full">
                  <label>Use Within (hours)</label>
                  <input
                    type="number" min="1" max="24"
                    value={form.expiry_hours}
                    onChange={e => set("expiry_hours", e.target.value)}
                  />
                  <span className="form-hint">Food must be consumed within this time window</span>
                </div>

                {/* GPS location — used by AI to find the nearest NGO to this donor */}
                <div className="field form-full">
                  <label>Your Location</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      required value={form.latitude}
                      onChange={e => set("latitude", e.target.value)}
                      placeholder="Latitude (e.g. 18.5204)"
                    />
                    <input
                      required value={form.longitude}
                      onChange={e => set("longitude", e.target.value)}
                      placeholder="Longitude (e.g. 73.8567)"
                    />
                    {/* Auto-detect button — fills lat/lng using browser GPS */}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={useMyLocation}
                      disabled={locating}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {locating ? "Detecting..." : "📍 Auto-detect"}
                    </button>
                  </div>
                  <span className="form-hint">Used to find the nearest NGO to your location</span>
                </div>

                <div className="form-full">
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
                    {loading ? "Submitting..." : "🍛 Submit Donation"}
                  </button>
                </div>
              </div>
            </form>

            {/* Error message — shown if submission fails */}
            {error  && <div className="error-msg mt-12">{error}</div>}

            {/* Success message — shows which NGO was matched to this donation */}
            {result && (
              <div className="success-msg mt-12">
                <strong>✅ Donation submitted!</strong><br />
                {result.matched_ngo
                  ? <>Matched with: <strong>{result.matched_ngo}</strong> — they will collect the food shortly.</>
                  : "No NGO matched yet — you will be notified when one is assigned."}
              </div>
            )}
          </div>
        </div>

        {/* Right column: "How it works" info panel — helps donors understand the process */}
        <div className="col" style={{ maxWidth: 300 }}>
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: "0.95rem" }}>💡 How it works</h3>
            {[
              { step: "1", text: "Fill in your food details and location" },
              { step: "2", text: "AI finds the nearest NGO with a food deficit" },
              { step: "3", text: "NGO gets notified and confirms pickup" },
              { step: "4", text: "Food reaches people in need within minutes" },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <div style={{
                  background: "#40916c", color: "white",
                  borderRadius: "50%", width: 24, height: 24,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, flexShrink: 0
                }}>{s.step}</div>
                <p style={{ fontSize: "0.85rem", color: "#4a5568", lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Motivational message to encourage donors */}
          <div className="card" style={{ background: "#f0fff4", border: "1px solid #c6f6d5" }}>
            <p style={{ fontSize: "0.82rem", color: "#276749", lineHeight: 1.6 }}>
              🌱 Every plate donated prevents food waste and feeds someone in need.
              Together we can eliminate hunger one meal at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
