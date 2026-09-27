// app/bank-statement/page.jsx — My Bank Statement
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function BankStatementPage() {
  const [loading,   setLoading]   = useState(true);
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate,   setEndDate]   = useState("2026-09-30");
  const [format,    setFormat]    = useState("PDF");
  const [requested, setRequested] = useState(false);
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
        <PageHeader title="Bank Statement" showBack />
        <div className="form-page">
          {!requested ? (
            <div className="card">
              <p className="stmt-info">
                <i className="fa-solid fa-circle-info"></i>
                Select a date range and format to generate your statement.
              </p>
              <div className="form-field">
                <label><i className="fa-solid fa-calendar-days"></i> From Date</label>
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-calendar-days"></i> To Date</label>
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-file"></i> Format</label>
                <select value={format} onChange={(e)=>setFormat(e.target.value)}>
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
              <button className="btn-primary" onClick={() => setRequested(true)}>
                <i className="fa-solid fa-download"></i> Download Statement
              </button>
              <p className="form-note">Demo only — a real PDF will not be generated.</p>
            </div>
          ) : (
            <div className="success-card">
              <div className="success-icon"><i className="fa-solid fa-file-arrow-down"></i></div>
              <h2>Statement Ready</h2>
              <p>Your {format} statement from {startDate} to {endDate} has been prepared.</p>
              <p style={{marginTop:8,fontSize:12,color:"#aaa"}}>(Demo — no file was actually generated)</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={() => setRequested(false)}>
                <i className="fa-solid fa-rotate-left"></i> New Request
              </button>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .form-page { padding:16px; max-width:480px; }
        .stmt-info { font-size:13px; color:#555; background:#f8f8f8; border-radius:6px; padding:10px 12px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .stmt-info i { color:#3b82f6; flex-shrink:0; }
        .form-note { font-size:11px; color:#bbb; text-align:center; margin-top:10px; }
        .form-field label i { margin-right:6px; color:#c8102e; }
        .success-card { background:#fff; border-radius:12px; padding:40px 24px; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .success-icon { font-size:56px; color:#3b82f6; margin-bottom:14px; }
        .success-card h2 { font-size:20px; font-weight:700; margin-bottom:8px; }
        .success-card p  { font-size:14px; color:#555; line-height:1.5; }
      `}</style>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
