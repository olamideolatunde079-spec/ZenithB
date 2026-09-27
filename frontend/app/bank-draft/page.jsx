// app/bank-draft/page.jsx — Bank Draft Request
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function BankDraftPage() {
  const [loading,  setLoading]  = useState(true);
  const [step,     setStep]     = useState("form");
  const [amount,   setAmount]   = useState("");
  const [beneName, setBeneName] = useState("");
  const [purpose,  setPurpose]  = useState("");
  const [error,    setError]    = useState("");
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
    e.preventDefault(); setError("");
    if (!amount || Number(amount) < 1000) { setError("Minimum amount is ₦1,000."); return; }
    if (!beneName.trim()) { setError("Enter the beneficiary name."); return; }
    setStep("success");
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Bank Draft Request" showBack />
        <div className="form-page">
          {step === "form" ? (
            <form className="card" onSubmit={handleSubmit}>
              {error && <div className="error-box">{error}</div>}
              <div className="form-field">
                <label><i className="fa-solid fa-naira-sign"></i> Amount (₦)</label>
                <input type="number" placeholder="e.g. 100000" min="1000" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-user"></i> Beneficiary Name</label>
                <input placeholder="Name on the draft" value={beneName} onChange={(e)=>setBeneName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-pen"></i> Purpose (optional)</label>
                <input placeholder="e.g. Property Purchase" value={purpose} onChange={(e)=>setPurpose(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary"><i className="fa-solid fa-paper-plane"></i> Submit Request</button>
              <p className="form-note">Demo only — no real draft will be issued.</p>
            </form>
          ) : (
            <div className="success-card">
              <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <h2>Draft Request Received!</h2>
              <p>A bank draft of ₦{Number(amount).toLocaleString()} in favour of {beneName} has been requested. Collection is ready within 1 business day.</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={()=>router.push("/more")}><i className="fa-solid fa-house"></i> Back to Services</button>
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
