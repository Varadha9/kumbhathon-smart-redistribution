// Auth.js
// Login and signup screen — shown when no user is logged in.
// Supports two roles: "donor" (submits food) and "ngo" (receives food).
// NGO signup also collects location data for the AI matching engine.

import React, { useState } from "react";
import { api } from "../api";

export default function Auth({ onLogin }) {
  const [mode, setMode]           = useState("signin");  // "signin" or "signup"
  const [role, setRole]           = useState("donor");   // "donor" or "ngo"
  const [form, setForm]           = useState({});        // all form field values
  const [error, setError]         = useState("");        // error message to show
  const [loading, setLoading]     = useState(false);     // disable button while posting
  const [gpsLoading, setGpsLoading] = useState(false);  // loading state for GPS button

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // detectLocation — auto-fills lat/lng for NGO signup using browser GPS
  // NGOs need coordinates so the AI can calculate distances to them
  function detectLocation() {
    if (!navigator.geolocation) { setError("GPS not supported by your browser"); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        setGpsLoading(false);
      },
      () => { setError("Could not get location. Please enter manually."); setGpsLoading(false); }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Choose endpoint based on mode: signup creates account, signin checks credentials
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/signin";
      // For signin, only send email + password. For signup, send everything including role.
      const body = mode === "signup" ? { ...form, role } : { email: form.email, password: form.password };
      const res = await api.post(endpoint, body);

      if (!res) { setError("Cannot connect to backend. Make sure Flask server is running on port 5000."); return; }
      if (res.error) { setError(res.error); return; }

      // Save user to localStorage so they stay logged in after page refresh
      localStorage.setItem("user", JSON.stringify(res.user));
      onLogin(res.user);  // tell App.js the user is logged in
    } catch {
      setError("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🍛 SmartRedistribute</div>
        <p className="auth-tagline">Fighting hunger, one meal at a time</p>

        {/* Toggle between Sign In and Sign Up */}
        <div className="auth-tabs">
          <button className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Sign In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Extra fields shown only during signup */}
          {mode === "signup" && (
            <>
              {/* Role selector — determines what tabs the user sees after login */}
              <div className="role-selector">
                <button type="button" className={role === "donor" ? "active" : ""} onClick={() => setRole("donor")}>🍽️ Donor</button>
                <button type="button" className={role === "ngo"   ? "active" : ""} onClick={() => setRole("ngo")}>🏢 NGO</button>
              </div>

              <div className="field">
                <label>{role === "ngo" ? "NGO Name" : "Your Name"}</label>
                <input required onChange={e => set("name", e.target.value)} />
              </div>

              {/* NGO-specific fields — location data needed for AI distance matching */}
              {role === "ngo" && (
                <>
                  <div className="field">
                    <label>City / Location</label>
                    <input required onChange={e => set("location", e.target.value)} />
                  </div>
                  {/* GPS auto-detect button for NGO location */}
                  <button type="button" className="btn btn-secondary btn-sm gps-btn" onClick={detectLocation} disabled={gpsLoading}>
                    {gpsLoading ? "Detecting…" : "📍 Auto-detect My Location"}
                  </button>
                  {/* Show detected coordinates as confirmation */}
                  {form.latitude && form.longitude && (
                    <div className="info-msg" style={{fontSize:"0.8rem"}}>📍 {form.latitude}, {form.longitude}</div>
                  )}
                  {/* Manual lat/lng input as fallback */}
                  <div className="form-grid">
                    <div className="field">
                      <label>Latitude</label>
                      <input required type="number" step="any" value={form.latitude || ""} onChange={e => set("latitude", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Longitude</label>
                      <input required type="number" step="any" value={form.longitude || ""} onChange={e => set("longitude", e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className="field">
                <label>Contact Number</label>
                <input onChange={e => set("contact", e.target.value)} />
              </div>
            </>
          )}

          {/* Email and password — required for both signin and signup */}
          <div className="field">
            <label>Email</label>
            <input required type="email" onChange={e => set("email", e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input required type="password" onChange={e => set("password", e.target.value)} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle link between signin and signup modes */}
        <p className="auth-switch">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}
