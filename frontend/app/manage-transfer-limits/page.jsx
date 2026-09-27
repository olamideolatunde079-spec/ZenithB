// app/manage-transfer-limits/page.jsx — Manage Transfer Limits
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

// Demo limit values
const DAILY_LIMIT = 2000000;
const USED_TODAY  = 50000;
const REMAINING   = DAILY_LIMIT - USED_TODAY;
const PCT_USED    = Math.round((USED_TODAY / DAILY_LIMIT) * 100);

export default function ManageTransferLimitsPage() {
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const [newLimit, setNewLimit] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const fmt = (n) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:0}).format(n);

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Transfer Limits" showBack />
        <div className="limits-page">

          {/* Limit summary cards */}
          <div className="limit-grid">
            <div className="limit-card">
              <p className="limit-label">Daily Limit</p>
              <p className="limit-value">{fmt(DAILY_LIMIT)}</p>
            </div>
            <div className="limit-card">
              <p className="limit-label">Used Today</p>
              <p className="limit-value used">{fmt(USED_TODAY)}</p>
            </div>
            <div className="limit-card full">
              <p className="limit-label">Remaining</p>
              <p className="limit-value remaining">{fmt(REMAINING)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="limit-progress-wrap">
            <div className="limit-progress-bg">
              <div className="limit-progress-fill" style={{width:`${PCT_USED}%`}}></div>
            </div>
            <p className="limit-progress-label">{PCT_USED}% of daily limit used</p>
          </div>

          {/* Request limit increase */}
          {!requested ? (
            <div className="card">
              <p className="limit-section-title">Request Limit Increase</p>
              <div className="form-field">
                <label><i className="fa-solid fa-naira-sign"></i> Requested Daily Limit (₦)</label>
                <input type="number" placeholder="e.g. 5000000" min={DAILY_LIMIT} value={newLimit} onChange={(e)=>setNewLimit(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => { if(newLimit) setRequested(true); }}>
                <i className="fa-solid fa-paper-plane"></i> Submit Request
              </button>
              <p className="form-note">Demo only — limits will not actually change.</p>
            </div>
          ) : (
            <div className="success-card">
              <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <h2>Request Submitted!</h2>
              <p>Your request to increase the limit to {fmt(Number(newLimit))} has been received. It will be reviewed within 24 hours.</p>
              <button className="btn-primary" style={{marginTop:20}} onClick={() => setRequested(false)}><i className="fa-solid fa-rotate-left"></i> New Request</button>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .limits-page { padding:16px; max-width:480px; }
        .limit-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
        .limit-card { background:#fff; border-radius:10px; padding:14px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .limit-card.full { grid-column:1/-1; }
        .limit-label { font-size:11px; text-transform:uppercase; color:#888; margin-bottom:4px; font-weight:600; }
        .limit-value { font-size:16px; font-weight:700; color:#1a1a1a; }
        .limit-value.used { color:#f59e0b; }
        .limit-value.remaining { color:#28a745; }
        .limit-progress-wrap { margin-bottom:20px; }
        .limit-progress-bg { height:8px; background:#f0f0f0; border-radius:4px; overflow:hidden; margin-bottom:6px; }
        .limit-progress-fill { height:100%; background:#c8102e; border-radius:4px; transition:width 0.4s; }
        .limit-progress-label { font-size:12px; color:#888; text-align:right; }
        .limit-section-title { font-size:14px; font-weight:700; margin-bottom:14px; color:#1a1a1a; }
        .form-note { font-size:11px; color:#bbb; text-align:center; margin-top:10px; }
        .form-field label i { margin-right:6px; color:#c8102e; }
        .success-card { background:#fff; border-radius:12px; padding:40px 24px; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .success-icon { font-size:56px; color:#28a745; margin-bottom:14px; }
        .success-card h2 { font-size:20px; font-weight:700; margin-bottom:8px; }
        .success-card p  { font-size:14px; color:#555; line-height:1.5; }
      `}</style>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
