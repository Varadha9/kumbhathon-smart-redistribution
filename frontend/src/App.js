import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import Donate from "./components/Donate";
import NGOMap from "./components/NGOMap";
import RegisterNGO from "./components/RegisterNGO";
import "./App.css";

const TABS = ["Dashboard", "Alerts", "Donate", "Map", "Register NGO"];

export default function App() {
  const [tab, setTab] = useState("Dashboard");

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🍛 SmartRedistribute</div>
        <nav>
          {TABS.map(t => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
      </header>
      <main className="main">
        {tab === "Dashboard" && <Dashboard />}
        {tab === "Alerts" && <Alerts />}
        {tab === "Donate" && <Donate />}
        {tab === "Map" && <NGOMap />}
        {tab === "Register NGO" && <RegisterNGO />}
      </main>
    </div>
  );
}
