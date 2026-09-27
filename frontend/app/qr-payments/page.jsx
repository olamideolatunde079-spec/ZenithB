// app/qr-payments/page.jsx — QR Payments ( "/qr-payments" )
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function QRPaymentsPage() {
  const [loading,  setLoading]  = useState(true);
  const [amount,   setAmount]   = useState("");
  const [step,     setStep]     = useState("scan"); // "scan" | "pay" | "success"
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
        <PageHeader title="QR Payments" showBack />
        <div className="qr-page">

          {step === "scan" && (
            <>
              <div className="qr-box">
                {/* Simulated QR code using CSS grid pattern */}
                <div className="qr-demo-code">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <p className="qr-hint">Point your camera at a QR code to pay</p>
              </div>
              <div className="qr-divider"><span>or pay by amount</span></div>
              <div className="form-field">
                <label>Amount (₦)</label>
                <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={() => { if(amount) setStep("pay"); }}>
                <i className="fa-solid fa-qrcode"></i> Continue
              </button>
            </>
          )}

          {step === "pay" && (
            <div className="qr-confirm card">
              <p className="qr-confirm-label">You are about to pay</p>
              <p className="qr-confirm-amount">₦{Number(amount).toLocaleString()}</p>
              <p className="qr-confirm-sub">Demo Merchant — Zenith POS Terminal</p>
              <button className="btn-primary" style={{marginTop:20}} onClick={() => setStep("success")}>
                <i className="fa-solid fa-check"></i> Confirm Payment
              </button>
              <button className="btn-secondary" style={{marginTop:10}} onClick={() => setStep("scan")}>Cancel</button>
            </div>
          )}

          {step === "success" && (
            <div className="qr-success">
              <div className="qr-success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <h2>Payment Successful!</h2>
              <p>₦{Number(amount).toLocaleString()} sent to Demo Merchant.</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={() => { setStep("scan"); setAmount(""); }}>
                <i className="fa-solid fa-plus"></i> New Payment
              </button>
            </div>
          )}

        </div>
      </main>
      <style>{`
        .qr-page { padding:24px 16px; max-width:420px; }
        .qr-box { text-align:center; margin-bottom:24px; }
        .qr-demo-code { width:180px; height:180px; border:3px solid #c8102e; border-radius:12px; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; color:#c8102e; font-size:100px; }
        .qr-hint { font-size:13px; color:#888; }
        .qr-divider { display:flex; align-items:center; gap:10px; margin:16px 0; color:#bbb; font-size:12px; }
        .qr-divider::before,.qr-divider::after { content:""; flex:1; height:1px; background:#e4e4e4; }
        .qr-confirm { text-align:center; padding:28px 20px; }
        .qr-confirm-label { font-size:13px; color:#888; margin-bottom:6px; }
        .qr-confirm-amount { font-size:32px; font-weight:700; color:#c8102e; }
        .qr-confirm-sub { font-size:13px; color:#555; margin-top:4px; }
        .qr-success { text-align:center; padding:40px 20px; }
        .qr-success-icon { font-size:60px; color:#28a745; margin-bottom:16px; }
        .qr-success h2 { font-size:20px; font-weight:700; margin-bottom:6px; }
        .qr-success p  { font-size:14px; color:#555; }
      `}</style>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
