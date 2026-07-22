import React, { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tag: "For pilots & NGOs",
    color: "var(--green)",
    bg: "var(--green-s)",
    border: "var(--green-b)",
    features: [
      "Up to 5 NGO camps",
      "Zone-aware matching",
      "WhatsApp alerts (Twilio sandbox)",
      "Volunteer dispatch",
      "Basic impact dashboard",
      "Community support",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Camp Pro",
    price: "₹999",
    period: "per camp / month",
    tag: "For active NGOs",
    color: "var(--accent)",
    bg: "var(--accent-s)",
    border: "var(--accent-b)",
    features: [
      "Unlimited camps in your zone",
      "Priority matching algorithm",
      "Full WhatsApp notifications",
      "CO₂ & water impact certificates",
      "CSV export for reports",
      "Dedicated WhatsApp support",
      "Shahi Snan demand spike alerts",
    ],
    cta: "Start 14-Day Trial",
    highlight: true,
  },
  {
    name: "Authority / CSR",
    price: "₹49,999",
    period: "per event / season",
    tag: "For governments & corporates",
    color: "var(--blue)",
    bg: "var(--blue-s)",
    border: "var(--blue-b)",
    features: [
      "Unlimited NGOs across all zones",
      "White-label branding",
      "ESG impact report (PDF)",
      "Government API integration",
      "Dedicated onboarding manager",
      "SLA: 99.9% uptime guarantee",
      "Multi-event license (Hajj, Char Dham)",
      "Analytics dashboard + zone heatmaps",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const REVENUE_STREAMS = [
  {
    icon: "🏛️",
    title: "Government / Authority SaaS",
    desc: "Kumbh Mela Authority and state governments already spend crores on food logistics. A platform fee of ₹5–50L per event is a rounding error in their budget.",
    potential: "₹5L – ₹50L per event",
    timeline: "Year 1",
  },
  {
    icon: "🏢",
    title: "NGO Subscription",
    desc: "₹999–₹2,999/month per registered camp for premium features — analytics, priority matching, IoT integration, and dedicated support.",
    potential: "₹12K – ₹36K per NGO/year",
    timeline: "Year 1",
  },
  {
    icon: "🌿",
    title: "ESG Impact Certificates",
    desc: "Sell CO₂ offset certificates and ESG impact reports to corporate donors. The metrics we already track (meals saved, CO₂, water) are exactly what CSR teams need.",
    potential: "₹500 – ₹2,000 per certificate",
    timeline: "Year 2",
  },
  {
    icon: "🌍",
    title: "White-Label Licensing",
    desc: "The same engine works for Hajj (2M pilgrims), Char Dham Yatra, Pushkar Mela, and Tirupati. License the platform to event authorities globally.",
    potential: "₹10L – ₹1Cr per license",
    timeline: "Year 2–3",
  },
  {
    icon: "📊",
    title: "Data & Analytics",
    desc: "Anonymised food demand patterns across Kumbh zones are valuable to FMCG companies, government planners, and logistics firms.",
    potential: "₹2L – ₹10L per dataset",
    timeline: "Year 3",
  },
];

const MILESTONES = [
  { phase: "Phase 1", label: "Pilot", time: "Kumbh 2025", desc: "3–5 anchor NGOs (ISKCON, Sikh Gurudwaras). Prove the matching engine works with real data.", icon: "🌱" },
  { phase: "Phase 2", label: "Scale", time: "Post-Kumbh 2025", desc: "50+ NGOs, government partnership with Kumbh Mela Authority, launch Camp Pro subscription.", icon: "🚀" },
  { phase: "Phase 3", label: "Expand", time: "2026", desc: "Char Dham Yatra, Pushkar Mela. Flutter mobile app. IoT sensor integration.", icon: "🌍" },
  { phase: "Phase 4", label: "Platform", time: "2027", desc: "White-label for Hajj and international pilgrimages. ESG marketplace. Series A.", icon: "🏆" },
];

const MARKET = [
  { label: "Kumbh Mela pilgrims (2025)", value: "45 crore", icon: "🙏" },
  { label: "NGOs / camps at Kumbh", value: "10,000+", icon: "🏕️" },
  { label: "Meals cooked daily at Kumbh", value: "1 crore+", icon: "🍛" },
  { label: "Estimated food waste per day", value: "20–30%", icon: "♻️" },
  { label: "India pilgrim tourism market", value: "₹1.5L Cr", icon: "📈" },
  { label: "Global food waste SaaS TAM", value: "$1.2B", icon: "🌐" },
];

export default function Pricing() {
  const [activeStream, setActiveStream] = useState(null);

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 6 }}>
          💼 Business Model & Monetization
        </h2>
        <p style={{ color: "var(--text-3)", fontSize: "0.88rem", maxWidth: 640 }}>
          KumbhAnna is purpose-built for the world's largest human gathering — but the engine scales to every major pilgrimage globally.
          Here's how we turn social impact into a sustainable business.
        </p>
      </div>

      {/* Market Size */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 18 }}>📊 Market Opportunity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          {MARKET.map(m => (
            <div key={m.label} style={{
              background: "var(--bg)", borderRadius: "var(--r-md)", padding: "16px 18px",
              border: "1px solid var(--border)"
            }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-1)", letterSpacing: "-0.5px" }}>{m.value}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>💳 Pricing Tiers</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{
            background: plan.highlight ? plan.bg : "var(--surface)",
            border: `2px solid ${plan.highlight ? plan.color : "var(--border)"}`,
            borderRadius: "var(--r-lg)", padding: "24px 22px",
            position: "relative", boxShadow: plan.highlight ? "0 4px 20px rgba(232,89,12,.15)" : "var(--sh-xs)"
          }}>
            {plan.highlight && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: plan.color, color: "#fff", fontSize: "0.68rem", fontWeight: 700,
                padding: "3px 14px", borderRadius: 100, letterSpacing: "0.5px", whiteSpace: "nowrap"
              }}>MOST POPULAR</div>
            )}
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{plan.tag}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", marginBottom: 2 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: "2rem", fontWeight: 900, color: plan.color, letterSpacing: "-1px" }}>{plan.price}</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginBottom: 20 }}>{plan.period}</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.83rem", color: "var(--text-2)" }}>
                  <span style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className={`btn ${plan.highlight ? "btn-primary" : "btn-secondary"}`}
              style={{ width: "100%", justifyContent: "center", padding: "10px" }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Revenue Streams */}
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>💰 Revenue Streams</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {REVENUE_STREAMS.map((s, i) => (
          <div key={s.title}
            onClick={() => setActiveStream(activeStream === i ? null : i)}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--r-md)", padding: "16px 20px", cursor: "pointer",
              transition: "box-shadow .2s",
              boxShadow: activeStream === i ? "var(--sh-md)" : "var(--sh-xs)"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-1)" }}>{s.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 2 }}>Timeline: {s.timeline}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{
                  background: "var(--green-s)", color: "var(--green)", border: "1px solid var(--green-b)",
                  borderRadius: 100, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 700
                }}>{s.potential}</span>
                <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>{activeStream === i ? "▲" : "▼"}</span>
              </div>
            </div>
            {activeStream === i && (
              <p style={{ marginTop: 12, fontSize: "0.84rem", color: "var(--text-2)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                {s.desc}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>🗺️ Growth Roadmap</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 32 }}>
        {MILESTONES.map((m, i) => (
          <div key={m.phase} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r-md)", padding: "18px 20px", position: "relative"
          }}>
            <div style={{
              position: "absolute", top: 16, right: 16,
              background: "var(--bg)", borderRadius: "var(--r-sm)", padding: "2px 8px",
              fontSize: "0.65rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.4px"
            }}>{m.time}</div>
            <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{m.phase}</div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-1)", marginBottom: 8 }}>{m.label}</div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.55 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Moat */}
      <div className="card" style={{ background: "var(--text-1)", border: "none", color: "#fff" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "#fff" }}>🏰 Our Defensible Moat</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { icon: "⏰", title: "Kumbh-Specific Demand Intelligence", desc: "Time-of-day multipliers tuned to Snan rush and Aarti peaks. No generic food app has this." },
            { icon: "🗺️", title: "Zone-Aware Matching", desc: "Two-pass algorithm that mirrors real Kumbh logistics zone boundaries — not just nearest-neighbor." },
            { icon: "📱", title: "WhatsApp-First", desc: "NGO volunteers are on WhatsApp, not apps. Our notification layer meets them where they are." },
            { icon: "🤝", title: "Network Effects", desc: "Every new NGO that joins makes the matching engine more accurate for all existing NGOs." },
          ].map(m => (
            <div key={m.title} style={{ background: "rgba(255,255,255,.06)", borderRadius: "var(--r-md)", padding: "16px 18px" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff", marginBottom: 6 }}>{m.title}</div>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,.6)", lineHeight: 1.55 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
