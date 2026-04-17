// App.js
// Root component of the React app.
// Handles: user authentication state, tab navigation, toast notifications,
// backend connectivity check, and global context shared across all components.

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import Dashboard  from "./components/Dashboard";
import Alerts     from "./components/Alerts";
import Donate     from "./components/Donate";
import NGOMap     from "./components/NGOMap";
import RegisterNGO from "./components/RegisterNGO";
import History    from "./components/History";
import Auth       from "./components/Auth";
import "./App.css";

// AppContext — a global state container shared across all child components.
// Components use useApp() hook to access: showToast, triggerRefresh, refresh, user.
export const AppContext = createContext();

// Tab definitions — each tab has an id, icon, and which roles can see it.
// This controls role-based access: donors don't see Alerts, NGOs don't see Donate, etc.
const ALL_TABS = [
  { id: "Dashboard", icon: "📊", roles: ["ngo", "donor", "admin"] },  // everyone sees dashboard
  { id: "Alerts",    icon: "🔔", roles: ["ngo", "admin"] },           // only NGOs see alerts
  { id: "Donate",    icon: "🍛", roles: ["donor", "admin"] },         // only donors see donate
  { id: "Map",       icon: "🗺️", roles: ["ngo", "donor", "admin"] }, // everyone sees map
  { id: "History",   icon: "📋", roles: ["ngo", "donor", "admin"] }, // everyone sees history
  { id: "Register",  icon: "🏢", roles: ["admin"] },                  // only admin sees register
];

export default function App() {
  const [tab, setTab]         = useState("Dashboard");  // currently active tab
  const [toast, setToast]     = useState(null);         // toast notification message
  const [online, setOnline]   = useState(null);         // backend connectivity status
  const [refresh, setRefresh] = useState(0);            // increment to trigger data reload in child components
  const [user, setUser]       = useState(() => {
    // On page load, restore user from localStorage so they stay logged in after refresh
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  // Check if Flask backend is reachable when the app first loads
  useEffect(() => {
    fetch("http://localhost:5001/api/stats")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  // Auto-dismiss toast notification after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);  // cleanup timer if toast changes before 3s
  }, [toast]);

  // showToast — called by child components to show a success/error message
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  // triggerRefresh — called after a transfer/donation to reload data in all components
  const triggerRefresh = useCallback(() => setRefresh(r => r + 1), []);

  // After login, redirect donor to Donate tab, NGO to Dashboard
  function handleLogin(u) {
    setUser(u);
    setTab(u.role === "donor" ? "Donate" : "Dashboard");
  }

  // Logout — clear user from state and localStorage, show Auth screen
  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  // If no user is logged in, show the Auth (login/signup) screen
  if (!user) return <Auth onLogin={handleLogin} />;

  // Filter tabs based on the logged-in user's role
  const TABS = ALL_TABS.filter(t => t.roles.includes(user.role));

  return (
    // Provide global context to all child components
    <AppContext.Provider value={{ showToast, triggerRefresh, refresh, user }}>
      <div className="app">

        {/* Top navigation header with logo, tabs, and user info */}
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🍛</span>
            <span>SmartRedistribute</span>
          </div>
          <nav>
            {/* Render only the tabs this user's role is allowed to see */}
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
          <div className="header-user">
            <span className="user-badge">{user.role === "ngo" ? "🏢" : "🍽️"} {user.name}</span>
            <button className="btn btn-sm btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {/* Show a banner if backend is offline — helps with debugging */}
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

        {/* Toast notification — appears briefly after actions like confirm transfer */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </div>
        )}

        {/* Main content area — renders the active tab's component */}
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

// useApp — custom hook so any component can access the global context easily
// Usage: const { showToast, triggerRefresh, refresh, user } = useApp();
export function useApp() { return useContext(AppContext); }
