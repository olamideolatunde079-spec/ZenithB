// app/open-account/page.jsx — Open Additional Account
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

const ACCOUNT_TYPES = ["Savings Account","Current Account","Domiciliary Account","Fixed Deposit","Kids Account"];

export default function OpenAccountPage() {
  const [loading, setLoading] = useState(true);
  const [step,    setStep]    = useState("form");
  const [acctType,setAcctType]= useState("");
  const [acctName,setAcctName]= useState("");
  const [phone,   setPhone]   = useState("");
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
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
    if (!acctType) { setError("Please select an account type."); return; }
    if (!acctName.trim()) { setError("Please enter a name for the account."); return; }
    setStep("success");
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Open Additional Account" showBack />
        <div className="form-page">
          {step === "form" ? (
            <form className="card" onSubmit={handleSubmit}>
              {error && <div className="error-box">{error}</div>}
              <div className="form-field">
                <label><i className="fa-solid fa-tag"></i> Account Type</label>
                <select value={acctType} onChange={(e)=>setAcctType(e.target.value)} required>
                  <option value="">Select type…</option>
                  {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-user"></i> Account Name</label>
                <input placeholder="e.g. Adebayo Olamide" value={acctName} onChange={(e)=>setAcctName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-mobile-screen"></i> Phone Number</label>
                <input type="tel" placeholder="08012345678" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-envelope"></i> Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary"><i className="fa-solid fa-paper-plane"></i> Submit Request</button>
              <p className="form-note">This is a demo form. No real account will be created.</p>
            </form>
          ) : (
            <SuccessCard title="Request Submitted!" body={`Your request to open a ${acctType} has been received. Our team will contact you within 2–3 business days.`} onBack={() => router.push("/more")} />
          )}
        </div>
      </main>
      <FormStyles />
    </div>
  );
}
function SuccessCard({ title, body, onBack }) {
  return (
    <div className="success-card">
      <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
      <h2>{title}</h2>
      <p>{body}</p>
      <button className="btn-primary" style={{marginTop:24}} onClick={onBack}><i className="fa-solid fa-house"></i> Back to Services</button>
    </div>
  );
}
function FormStyles() {
  return (
    <style>{`
      .form-page { padding:16px; max-width:480px; }
      .form-note { font-size:11px; color:#bbb; text-align:center; margin-top:10px; }
      .form-field label i { margin-right:6px; color:#c8102e; }
      .success-card { background:#fff; border-radius:12px; padding:40px 24px; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
      .success-icon { font-size:56px; color:#28a745; margin-bottom:14px; }
      .success-card h2 { font-size:20px; font-weight:700; margin-bottom:8px; }
      .success-card p  { font-size:14px; color:#555; line-height:1.5; }
    `}</style>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
