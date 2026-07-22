import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { useApp } from "../App";

export default function ScanServe() {
  const [tokenId, setTokenId]   = useState("");
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [tokens, setTokens]     = useState([]);
  const [filter, setFilter]     = useState("all");
  const { showToast, refresh }  = useApp();
  const inputRef                = useRef(null);

  const loadTokens = useCallback(async () => {
    const data = await api.get("/visitor/tokens");
    if (data) setTokens(data);
  }, []);

  useEffect(() => { loadTokens(); }, [loadTokens, refresh]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function scan(e) {
    e.preventDefault();
    if (!tokenId.trim()) return;
    setError(""); setResult(null); setLoading(true);
    const res = await api.post("/visitor/scan", { token_id: tokenId.trim().toUpperCase() });
    setLoading(false);
    if (!res) { setError("Cannot connect to backend"); return; }
    if (res.error) { setError(res.error); setResult(res.token || null); return; }
    setResult(res);
    showToast(`✅ ${res.visitor_name} — ${res.party_size} meals served!`);
    setTokenId("");
    loadTokens();
    inputRef.current?.focus();
  }

  async function markNoShow(id) {
    const res = await api.post(`/visitor/no-show/${id}`, {});
    if (res?.message) { showToast("Marked as no-show"); loadTokens(); }
  }

  const filtered = tokens.filter(t => filter === "all" || t.status === filter);
  const pending  = tokens.filter(t => t.status === "pending").length;
  const served   = tokens.filter(t => t.status === "served").length;
  const noShow   = tokens.filter(t => t.status === "no_show").length;

  const fmt = iso => iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>📷 Scan & Serve</h2>
      <p style={{ color: "var(--text-3)", fontSize: "0.88rem", marginBottom: 24 }}>
        Scan visitor QR tokens to mark food as served. Type or scan the token ID below.
      </p>

      <div className="workflow-steps">
        {["Register & Get QR", "AI Predicts Demand", "Smart Slot Allocated", "Scan & Get Food", "Give Feedback"].map((s, i) => (
          <div key={i} className={`workflow-step ${i === 3 ? "active" : i < 3 ? "done" : ""}`}>
            <div className="ws-num">{i < 3 ? "✓" : i + 1}</div>
            <div className="ws-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="row">
        {/* Scanner */}
        <div className="col" style={{ maxWidth: 380 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: "1rem" }}>🔍 Scan Token</h3>
            <form onSubmit={scan}>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Token ID (e.g. KA-00001)</label>
                <input
                  ref={inputRef}
                  value={tokenId}
                  onChange={e => setTokenId(e.target.value.toUpperCase())}
                  placeholder="KA-00001"
                  style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: 2, textAlign: "center" }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !tokenId.trim()}
                style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: "1rem" }}>
                {loading ? "Checking…" : "✅ Mark as Served"}
              </button>
            </form>

            {error && (
              <div className="error-msg mt-12">
                ❌ {error}
                {result && (
                  <div style={{ marginTop: 8, fontSize: "0.8rem" }}>
                    Token: <strong>{result.token_id}</strong> — Status: <strong>{result.status}</strong>
                  </div>
                )}
              </div>
            )}

            {result && !error && (
              <div className="success-msg mt-12">
                <strong>✅ Food Served!</strong><br />
                <span style={{ fontSize: "0.85rem" }}>
                  {result.visitor_name} — Party of {result.party_size}<br />
                  Center: {result.food_center}<br />
                  Served at: {fmt(result.served_at)}
                </span>
              </div>
            )}
          </div>

          {/* Live stats */}
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: "0.95rem" }}>📊 Today's Stats</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Pending", value: pending, color: "var(--yellow)", bg: "var(--yellow-s)" },
                { label: "Served",  value: served,  color: "var(--green)",  bg: "var(--green-s)" },
                { label: "No Show", value: noShow,  color: "var(--text-3)", bg: "var(--surface-2)" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: "var(--r-md)", padding: "12px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Token list */}
        <div className="col">
          <div className="card">
            <div className="section-header">
              <h3 style={{ fontSize: "1rem" }}>🎫 All Tokens</h3>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "pending", "served", "no_show"].map(f => (
                  <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setFilter(f)}>
                    {f === "no_show" ? "No Show" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <div className="empty-icon">🎫</div>
                <p>No tokens yet</p>
                <small>Register visitors to see tokens here</small>
              </div>
            ) : (
              <table className="ngo-table">
                <thead>
                  <tr><th>Token</th><th>Visitor</th><th>Center</th><th>Slot</th><th>Party</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.slice().reverse().map(t => (
                    <tr key={t.token_id}>
                      <td><strong style={{ fontFamily: "monospace", letterSpacing: 1 }}>{t.token_id}</strong></td>
                      <td>{t.visitor_name}</td>
                      <td style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>{t.food_center?.split(" ").slice(0, 2).join(" ")}</td>
                      <td style={{ fontSize: "0.78rem" }}>{t.time_slot}</td>
                      <td style={{ textAlign: "center" }}>{t.party_size}</td>
                      <td>
                        <span className={`badge ${t.status === "served" ? "done" : t.status === "no_show" ? "" : "medium"}`}
                          style={t.status === "no_show" ? { background: "var(--surface-2)", color: "var(--text-3)" } : {}}>
                          {t.status === "served" ? "✅ Served" : t.status === "no_show" ? "No Show" : "⏳ Pending"}
                        </span>
                      </td>
                      <td>
                        {t.status === "pending" && (
                          <button className="btn btn-sm btn-secondary" onClick={() => markNoShow(t.token_id)}
                            style={{ fontSize: "0.7rem" }}>No Show</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
