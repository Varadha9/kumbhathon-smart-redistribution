import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import Dashboard       from "./components/Dashboard";
import Alerts          from "./components/Alerts";
import Donate          from "./components/Donate";
import NGOMap          from "./components/NGOMap";
import RegisterNGO     from "./components/RegisterNGO";
import History         from "./components/History";
import Volunteer       from "./components/Volunteer";
import Pricing         from "./components/Pricing";
import VisitorRegister from "./components/VisitorRegister";
import ScanServe       from "./components/ScanServe";
import Insights        from "./components/Insights";
import Auth            from "./components/Auth";
import "./App.css";

export const AppContext = createContext();

const ALL_TABS = [
  { id: "Dashboard", icon: "📊", roles: ["ngo", "donor", "admin"] },
  { id: "Register",  icon: "🎫", roles: ["ngo", "donor", "admin"] },
  { id: "Scan",      icon: "📷", roles: ["ngo", "admin"] },
  { id: "Insights",  icon: "🧠", roles: ["ngo", "donor", "admin"] },
  { id: "Alerts",    icon: "🔔", roles: ["ngo", "admin"] },
  { id: "Donate",    icon: "🍛", roles: ["donor", "admin"] },
  { id: "Map",       icon: "🗺️", roles: ["ngo", "donor", "admin"] },
  { id: "Volunteer", icon: "🚴", roles: ["ngo", "admin"] },
  { id: "History",   icon: "📋", roles: ["ngo", "donor", "admin"] },
  { id: "Pricing",   icon: "💼", roles: ["ngo", "donor", "admin"] },
  { id: "NGO Mgmt",  icon: "🏢", roles: ["admin"] },
];

export default function App() {
  const [tab, setTab]         = useState("Dashboard");
  const [toast, setToast]     = useState(null);
  const [online, setOnline]   = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  useEffect(() => {
    fetch("/api/stats")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast     = useCallback((msg, type = "success") => setToast({ msg, type }), []);
  const triggerRefresh = useCallback(() => setRefresh(r => r + 1), []);

  function handleLogin(u) {
    setUser(u);
    setTab(u.role === "donor" ? "Donate" : "Dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  const TABS = ALL_TABS.filter(t => t.roles.includes(user.role));

  return (
    <AppContext.Provider value={{ showToast, triggerRefresh, refresh, user, setTab }}>
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🪔</span>
            <span>KumbhAnna</span>
            <span className="logo-sub">Kumbh Mela Food Network</span>
          </div>
          <nav>
            {TABS.map(t => (
              <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.id}</span>
              </button>
            ))}
          </nav>
          <div className="header-user">
            <span className="user-badge">
              {user.role === "ngo" ? "🏢" : user.role === "admin" ? "🛡️" : "🍽️"} {user.name}
            </span>
            <button className="btn btn-sm btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {online === false && (
          <div className="status-banner error">
            ⚠️ Backend offline — start Spring Boot on port 8080 to use the app.
          </div>
        )}
        {online === true && (
          <div className="status-banner success">
            ✅ Connected to KumbhAnna backend
          </div>
        )}

        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        )}

        <main className="main">
          {tab === "Dashboard"  && <Dashboard />}
          {tab === "Register"   && <VisitorRegister />}
          {tab === "Scan"       && <ScanServe />}
          {tab === "Insights"   && <Insights />}
          {tab === "Alerts"     && <Alerts />}
          {tab === "Donate"     && <Donate />}
          {tab === "Map"        && <NGOMap />}
          {tab === "Volunteer"  && <Volunteer />}
          {tab === "History"    && <History />}
          {tab === "Pricing"    && <Pricing />}
          {tab === "NGO Mgmt"   && <RegisterNGO />}
        </main>

        <footer className="footer">
          🪔 KumbhAnna — Built for Kumbhathon &nbsp;|&nbsp; Feeding every pilgrim at Kumbh Mela 2025 🍛
        </footer>
      </div>
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
