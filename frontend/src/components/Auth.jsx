import React, { useState } from "react";
import { api } from "../api";

export default function Auth({ onLogin }) {
  const [mode, setMode]             = useState("signin");
  const [role, setRole]             = useState("donor");
  const [form, setForm]             = useState({});
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/signin";
      const body = mode === "signup" ? { ...form, role } : { email: form.email, password: form.password };
      const res = await api.post(endpoint, body);

      if (!res) { setError("Cannot connect to backend. Make sure Spring Boot is running on port 8080."); return; }
      if (res.error) { setError(res.error); return; }

      localStorage.setItem("user", JSON.stringify(res.user));
      onLogin(res.user);
    } catch {
      setError("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🪔 Kumbh<span>Anna</span></div>
        <p className="auth-tagline">Smart Food Redistribution · Kumbh Mela 2025</p>

        <div className="auth-tabs">
          <button className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Sign In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="role-selector">
                <button type="button" className={role === "donor" ? "active" : ""} onClick={() => setRole("donor")}>🍽️ Donor</button>
                <button type="button" className={role === "ngo"   ? "active" : ""} onClick={() => setRole("ngo")}>🏢 NGO</button>
                <button type="button" className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>🛡️ Admin</button>
              </div>

              <div className="field">
                <label>{role === "ngo" ? "NGO Name" : "Your Name"}</label>
                <input required onChange={e => set("name", e.target.value)} />
              </div>

              {role === "ngo" && (
                <>
                  <div className="field">
                    <label>City / Location</label>
                    <input required onChange={e => set("location", e.target.value)} placeholder="e.g. Sangam Ghat, Prayagraj" />
                  </div>
                  <div className="field">
                    <label>Kumbh Zone / Sector</label>
                    <select onChange={e => set("kumbh_zone", e.target.value)}>
                      <option value="">-- Select Zone --</option>
                      <option>Zone A - Sangam</option>
                      <option>Zone B - Ganga</option>
                      <option>Zone C - Tent City</option>
                      <option>Zone D - Yamuna</option>
                      <option>Zone E - Outer Camp</option>
                    </select>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm gps-btn" onClick={detectLocation} disabled={gpsLoading}>
                    {gpsLoading ? "Detecting…" : "📍 Auto-detect My Location"}
                  </button>
                  {form.latitude && form.longitude && (
                    <div className="info-msg" style={{fontSize:"0.8rem"}}>📍 {form.latitude}, {form.longitude}</div>
                  )}
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

        <p className="auth-switch">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </span>
        </p>

        {/* Quick demo login hint for judges */}
        <div style={{marginTop:16, padding:"10px 14px", background:"var(--accent-s)", borderRadius:"var(--r-sm)", border:"1px solid var(--accent-b)"}}>
          <p style={{fontSize:"0.75rem", color:"var(--accent)", fontWeight:700, marginBottom:4}}>🎯 Demo Login</p>
          <p style={{fontSize:"0.75rem", color:"var(--text-2)"}}>admin@kumbhanna.in / admin123</p>
        </div>
      </div>
    </div>
  );
}
