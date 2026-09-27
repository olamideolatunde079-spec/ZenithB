// app/cheques/page.jsx — Cheques
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

const HISTORY = [
  { id:1, ref:"CHQ-00124", leaves:25, date:"Aug 05, 2026", status:"Delivered" },
  { id:2, ref:"CHQ-00089", leaves:50, date:"Mar 12, 2026", status:"Delivered" },
];

export default function ChequesPage() {
  const [loading, setLoading] = useState(true);
  const [step,    setStep]    = useState("home"); // "home"|"request"|"success"
  const [leaves,  setLeaves]  = useState("25");
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Cheques" showBack={step !== "home"} onBack={() => setStep("home")} />
        <div className="form-page">

          {step === "home" && (
            <>
              <button className="btn-primary" style={{marginBottom:20}} onClick={() => setStep("request")}>
                <i className="fa-solid fa-plus"></i> Request Cheque Book
              </button>
              <p className="section-title" style={{padding:"0 0 8px"}}>Cheque History</p>
              {HISTORY.map((h) => (
                <div key={h.id} className="cheque-row">
                  <div className="cheque-icon"><i className="fa-solid fa-money-check"></i></div>
                  <div className="cheque-info">
                    <p className="cheque-ref">{h.ref} &nbsp;·&nbsp; {h.leaves} leaves</p>
                    <p className="cheque-date">{h.date}</p>
                  </div>
                  <span className="cheque-status">{h.status}</span>
                </div>
              ))}
            </>
          )}

          {step === "request" && (
            <div className="card">
              <div className="form-field">
                <label><i className="fa-solid fa-layer-group"></i> Number of Leaves</label>
                <select value={leaves} onChange={(e)=>setLeaves(e.target.value)}>
                  <option value="25">25 leaves</option>
                  <option value="50">50 leaves</option>
                  <option value="100">100 leaves</option>
                </select>
              </div>
              <button className="btn-primary" onClick={() => setStep("success")}><i className="fa-solid fa-paper-plane"></i> Submit Request</button>
              <p className="form-note">Demo only — no real cheque book will be issued.</p>
            </div>
          )}

          {step === "success" && (
            <div className="success-card">
              <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <h2>Cheque Book Requested!</h2>
              <p>Your request for a {leaves}-leaf cheque book has been submitted. It will be ready for collection within 5 business days.</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={() => setStep("home")}><i className="fa-solid fa-arrow-left"></i> Back</button>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .form-page { padding:16px; max-width:480px; }
        .form-note { font-size:11px; color:#bbb; text-align:center; margin-top:10px; }
        .form-field label i { margin-right:6px; color:#c8102e; }
        .cheque-row { display:flex; align-items:center; gap:12px; background:#fff; border-radius:10px; padding:14px; margin-bottom:8px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .cheque-icon { width:40px; height:40px; border-radius:10px; background:#fff0f0; color:#c8102e; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .cheque-info { flex:1; }
        .cheque-ref  { font-size:14px; font-weight:600; color:#1a1a1a; }
        .cheque-date { font-size:12px; color:#888; margin-top:2px; }
        .cheque-status { font-size:11px; font-weight:600; background:#e6f9ed; color:#28a745; padding:3px 10px; border-radius:8px; }
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
