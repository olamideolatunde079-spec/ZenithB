// app/request-loan/page.jsx — Request Loan
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

const LOAN_TYPES = ["Personal Loan","Business Loan","Mortgage","Auto Loan","Student Loan","Asset Finance"];
const PURPOSES   = ["Business Expansion","Medical","Education","Home Renovation","Travel","Other"];

export default function RequestLoanPage() {
  const [loading,   setLoading]   = useState(true);
  const [step,      setStep]      = useState("form");
  const [loanType,  setLoanType]  = useState("");
  const [amount,    setAmount]    = useState("");
  const [purpose,   setPurpose]   = useState("");
  const [duration,  setDuration]  = useState("");
  const [error,     setError]     = useState("");
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!loanType) { setError("Select a loan type."); return; }
    if (!amount || Number(amount) < 10000) { setError("Minimum loan amount is ₦10,000."); return; }
    if (!purpose) { setError("Select a purpose."); return; }
    setStep("success");
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Request Loan" showBack />
        <div className="form-page">
          {step === "form" ? (
            <form className="card" onSubmit={handleSubmit}>
              {error && <div className="error-box">{error}</div>}
              <div className="form-field">
                <label><i className="fa-solid fa-tag"></i> Loan Type</label>
                <select value={loanType} onChange={(e)=>setLoanType(e.target.value)} required>
                  <option value="">Select type…</option>
                  {LOAN_TYPES.map((t)=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-naira-sign"></i> Amount (₦)</label>
                <input type="number" placeholder="e.g. 500000" min="10000" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-bullseye"></i> Purpose</label>
                <select value={purpose} onChange={(e)=>setPurpose(e.target.value)} required>
                  <option value="">Select purpose…</option>
                  {PURPOSES.map((p)=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-calendar"></i> Duration (months)</label>
                <input type="number" placeholder="e.g. 12" min="1" max="240" value={duration} onChange={(e)=>setDuration(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary"><i className="fa-solid fa-paper-plane"></i> Submit Request</button>
              <p className="form-note">Demo only — no real loan will be processed.</p>
            </form>
          ) : (
            <div className="success-card">
              <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <h2>Loan Request Received!</h2>
              <p>Your {loanType} request of ₦{Number(amount).toLocaleString()} has been submitted. Our team will review and contact you within 3–5 business days.</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={() => router.push("/more")}><i className="fa-solid fa-house"></i> Back to Services</button>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .form-page { padding:16px; max-width:480px; }
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
