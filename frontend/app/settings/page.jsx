// app/settings/page.jsx — Settings ( "/settings" )
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  // Simple toggle states — stored in component state (demo only, not persisted)
  const [notifications, setNotifications] = useState(true);
  const [showBalance,   setShowBalance]   = useState(true);
  const [biometrics,    setBiometrics]    = useState(false);
  const [darkMode,      setDarkMode]      = useState(false);
  const [txAlerts,      setTxAlerts]      = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Settings" showBack />

        <div className="settings-page">

          <p className="settings-section-label">Preferences</p>
          <div className="settings-group">
            <SettingRow label="Push Notifications" icon="fa-solid fa-bell"
              value={notifications} onChange={setNotifications} />
            <SettingRow label="Show Balance on Dashboard" icon="fa-solid fa-eye"
              value={showBalance} onChange={setShowBalance} />
            <SettingRow label="Transaction Alerts" icon="fa-solid fa-comment-dollar"
              value={txAlerts} onChange={setTxAlerts} />
            <SettingRow label="Dark Mode" icon="fa-solid fa-moon"
              value={darkMode} onChange={setDarkMode} last />
          </div>

          <p className="settings-section-label">Security</p>
          <div className="settings-group">
            <SettingRow label="Biometric Login" icon="fa-solid fa-fingerprint"
              value={biometrics} onChange={setBiometrics} last />
          </div>

          <p className="settings-section-label">Account</p>
          <div className="settings-group">
            <SettingLink label="Change Password"   icon="fa-solid fa-lock"        href="/profile" />
            <SettingLink label="Manage Limits"     icon="fa-solid fa-sliders"     href="/manage-transfer-limits" last />
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>

        </div>
      </main>

      <style>{`
        .settings-page { padding:16px; max-width:540px; }
        .settings-section-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#888; letter-spacing:0.5px; padding:12px 0 6px; }
        .settings-group { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.07); margin-bottom:20px; }
        .setting-row { display:flex; align-items:center; gap:14px; padding:14px 16px; border-bottom:1px solid #f5f5f5; }
        .setting-row.last { border-bottom:none; }
        .setting-icon { width:36px; height:36px; border-radius:8px; background:#fff0f0; color:#c8102e; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
        .setting-label { flex:1; font-size:14px; font-weight:500; color:#1a1a1a; }
        /* Toggle switch */
        .toggle { position:relative; width:44px; height:24px; flex-shrink:0; }
        .toggle input { opacity:0; width:0; height:0; }
        .toggle-slider {
          position:absolute; inset:0; background:#ddd; border-radius:24px;
          cursor:pointer; transition:background 0.2s;
        }
        .toggle-slider::before {
          content:""; position:absolute; width:18px; height:18px;
          border-radius:50%; background:#fff; left:3px; top:3px;
          transition:transform 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2);
        }
        .toggle input:checked + .toggle-slider { background:#c8102e; }
        .toggle input:checked + .toggle-slider::before { transform:translateX(20px); }
        /* Setting link row */
        .setting-link { display:flex; align-items:center; gap:14px; padding:14px 16px; border-bottom:1px solid #f5f5f5; text-decoration:none; color:inherit; }
        .setting-link.last { border-bottom:none; }
        .setting-link-chevron { color:#ccc; font-size:13px; margin-left:auto; }

        .logout-btn { width:100%; padding:13px; border:2px solid #c8102e; background:#fff; color:#c8102e; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.15s; }
        .logout-btn:hover { background:#c8102e; color:#fff; }
      `}</style>
    </div>
  );
}

// Reusable toggle row
function SettingRow({ label, icon, value, onChange, last }) {
  return (
    <div className={`setting-row ${last ? "last" : ""}`}>
      <div className="setting-icon"><i className={icon}></i></div>
      <span className="setting-label">{label}</span>
      <label className="toggle">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

// Reusable link row
function SettingLink({ label, icon, href, last }) {
  const router = useRouter();
  return (
    <button className={`setting-link ${last ? "last" : ""}`} onClick={() => router.push(href)}>
      <div className="setting-icon"><i className={icon}></i></div>
      <span className="setting-label">{label}</span>
      <i className="fa-solid fa-chevron-right setting-link-chevron"></i>
    </button>
  );
}

function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
