// app/upcoming-payments/page.jsx — Upcoming Payments
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

const PAYMENTS = [
  { id:1, name:"DSTV Subscription",     amount:7200,  due:"Oct 01, 2026", status:"Due soon",  icon:"fa-solid fa-tv",           color:"#f59e0b" },
  { id:2, name:"Electricity Bill",       amount:12000, due:"Oct 05, 2026", status:"Upcoming",  icon:"fa-solid fa-bolt",         color:"#3b82f6" },
  { id:3, name:"Rent Payment",           amount:150000,due:"Oct 10, 2026", status:"Upcoming",  icon:"fa-solid fa-house",        color:"#8b5cf6" },
  { id:4, name:"Internet Subscription", amount:8500,  due:"Oct 15, 2026", status:"Upcoming",  icon:"fa-solid fa-wifi",         color:"#28a745" },
  { id:5, name:"Car Insurance",          amount:45000, due:"Nov 01, 2026", status:"Upcoming",  icon:"fa-solid fa-car",          color:"#555" },
];

export default function UpcomingPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const fmt = (n) => `₦${n.toLocaleString()}`;

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Upcoming Payments" showBack />
        <div className="up-page">
          {PAYMENTS.map((p) => (
            <div key={p.id} className="up-card">
              <div className="up-icon" style={{background:p.color+"18",color:p.color}}>
                <i className={p.icon}></i>
              </div>
              <div className="up-info">
                <p className="up-name">{p.name}</p>
                <p className="up-due"><i className="fa-regular fa-calendar"></i> {p.due}</p>
              </div>
              <div className="up-right">
                <p className="up-amount">{fmt(p.amount)}</p>
                <span className={`up-status ${p.status === "Due soon" ? "urgent" : ""}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style>{`
        .up-page { padding:12px 16px; max-width:540px; }
        .up-card { display:flex; align-items:center; gap:14px; background:#fff; border-radius:10px; padding:14px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .up-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .up-info { flex:1; min-width:0; }
        .up-name { font-size:14px; font-weight:600; color:#1a1a1a; }
        .up-due  { font-size:12px; color:#888; margin-top:2px; display:flex; align-items:center; gap:5px; }
        .up-right { text-align:right; }
        .up-amount { font-size:14px; font-weight:700; color:#1a1a1a; }
        .up-status { font-size:11px; font-weight:600; padding:2px 8px; border-radius:8px; background:#f0f0f0; color:#888; }
        .up-status.urgent { background:#fff3cd; color:#f59e0b; }
      `}</style>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
