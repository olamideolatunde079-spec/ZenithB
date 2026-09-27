// app/alerts/page.jsx — Alerts ( "/alerts" )
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

// Demo alert data
const DEMO_ALERTS = [
  { id:1, type:"success", title:"Transfer Successful", body:"Your transfer of ₦50,000 to Chukwu Emmanuel was completed.", time:"Today, 10:32 AM", icon:"fa-solid fa-circle-check" },
  { id:2, type:"info",    title:"Statement Ready",     body:"Your September 2026 account statement is ready to download.", time:"Yesterday, 3:15 PM", icon:"fa-solid fa-file-lines" },
  { id:3, type:"warning", title:"Login Detected",      body:"A new login was detected from Lagos, Nigeria.", time:"Sep 22, 2026", icon:"fa-solid fa-shield-halved" },
  { id:4, type:"success", title:"Airtime Purchase",    body:"₦2,000 MTN airtime was sent to 08012345678.", time:"Sep 21, 2026", icon:"fa-solid fa-mobile-screen" },
  { id:5, type:"info",    title:"DSTV Payment",        body:"Your DSTV subscription of ₦7,200 was processed.", time:"Sep 18, 2026", icon:"fa-solid fa-tv" },
];

const COLOURS = { success:"#28a745", info:"#3b82f6", warning:"#f59e0b", error:"#c8102e" };

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts,  setAlerts]  = useState(DEMO_ALERTS);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  function dismiss(id) {
    setAlerts((a) => a.filter((x) => x.id !== id));
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Alerts" showBack />

        <div className="alerts-page">
          {alerts.length === 0 ? (
            <div className="alerts-empty">
              <i className="fa-solid fa-bell-slash" style={{fontSize:40,color:"#ddd",display:"block",marginBottom:10}}></i>
              No alerts right now.
            </div>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className="alert-card">
                <div className="alert-icon-wrap" style={{background: COLOURS[a.type]+"22", color: COLOURS[a.type]}}>
                  <i className={a.icon}></i>
                </div>
                <div className="alert-body">
                  <p className="alert-title">{a.title}</p>
                  <p className="alert-text">{a.body}</p>
                  <p className="alert-time">{a.time}</p>
                </div>
                <button className="alert-dismiss" onClick={() => dismiss(a.id)} aria-label="Dismiss">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <style>{`
        .alerts-page { padding:12px 16px; max-width:540px; }
        .alert-card { display:flex; align-items:flex-start; gap:12px; background:#fff; border-radius:10px; padding:14px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .alert-icon-wrap { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .alert-body { flex:1; min-width:0; }
        .alert-title { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:3px; }
        .alert-text  { font-size:13px; color:#555; line-height:1.4; }
        .alert-time  { font-size:11px; color:#aaa; margin-top:4px; }
        .alert-dismiss { background:none; border:none; color:#ccc; cursor:pointer; font-size:14px; padding:2px; flex-shrink:0; }
        .alert-dismiss:hover { color:#888; }
        .alerts-empty { text-align:center; padding:50px 20px; color:#aaa; font-size:14px; }
      `}</style>
    </div>
  );
}

function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
