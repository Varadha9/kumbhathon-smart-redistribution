import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import Donate from "./components/Donate";
import NGOMap from "./components/NGOMap";
import RegisterNGO from "./components/RegisterNGO";
import History from "./components/History";
import "./App.css";

// Global context for toast notifications and refresh trigger
export const AppContext = createContext();

const TABS = [
  { id: "Dashboard", icon: "📊" },
  { id: "Alerts",    icon: "🔔" },
  { id: "Donate",    icon: "🍛" },
  { id: "Map",       icon: "🗺️" },
  { id: "History",   icon: "📋" },
  { id: "Register",  icon: "🏢" },
];

export default function App() {
  const [tab, setTab]         = useState("Dashboard");
  const [toast, setToast]     = useState(null);
  const [online, setOnline]   = useState(null); // null=checking, true=up, false=down
  const [refresh, setRefresh] = useState(0);

  // Check backend connectivity on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const triggerRefresh = useCallback(() => setRefresh(r => r + 1), []);

  return (
    <AppContext.Provider value={{ showToast, triggerRefresh, refresh }}>
      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🍛</span>
            <span>SmartRedistribute</span>
          </div>
          <nav>
            {TABS.map(t => (
              <button
                key={t.id}
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                <span className="tab-label">{t.id}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Backend status banner */}
        {online === false && (
          <div className="status-banner error">
            ⚠️ Backend is offline — start Flask server on port 5000 to use the app.
          </div>
        )}
        {online === true && (
          <div className="status-banner success">
            ✅ Connected to backend
          </div>
        )}

        {/* Toast notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        )}

        <main className="main">
          {tab === "Dashboard" && <Dashboard />}
          {tab === "Alerts"    && <Alerts />}
          {tab === "Donate"    && <Donate />}
          {tab === "Map"       && <NGOMap />}
          {tab === "History"   && <History />}
          {tab === "Register"  && <RegisterNGO />}
        </main>

        <footer className="footer">
          Built with ❤️ for Kumbhathon &nbsp;|&nbsp; Fighting hunger, one meal at a time 🍛
        </footer>
      </div>
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
