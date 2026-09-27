// app/dubai-visa/page.jsx — Dubai Visa
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

export default function DubaiVisaPage() {
  const [loading, setLoading] = useState(true);
  const [step,    setStep]    = useState("info");
  const [name,    setName]    = useState("");
  const [passport,setPassport]= useState("");
  const [travel,  setTravel]  = useState("");
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
        <PageHeader title="Dubai Visa" showBack />
        <div className="form-page">
          {step === "info" && (
            <>
              <div className="visa-banner">
                <i className="fa-solid fa-passport visa-banner-icon"></i>
                <div>
                  <p className="visa-banner-title">Dubai Visa Assistance</p>
                  <p className="visa-banner-sub">Zenith Bank helps you process your UAE visit visa seamlessly.</p>
                </div>
              </div>
              <div className="visa-features">
                {[
                  ["fa-solid fa-clock","Fast Processing","2–5 business days"],
                  ["fa-solid fa-shield-halved","Secure","Bank-grade document handling"],
                  ["fa-solid fa-headset","Support","24/7 customer support"],
                ].map(([icon,title,sub]) => (
                  <div key={title} className="visa-feature">
                    <i className={icon}></i>
                    <div><p className="vf-title">{title}</p><p className="vf-sub">{sub}</p></div>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setStep("form")}>
                <i className="fa-solid fa-paper-plane"></i> Apply Now
              </button>
            </>
          )}

          {step === "form" && (
            <form className="card" onSubmit={(e) => { e.preventDefault(); setStep("success"); }}>
              <div className="form-field">
                <label><i className="fa-solid fa-user"></i> Full Name (as on passport)</label>
                <input placeholder="e.g. ADEBAYO OLAMIDE" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-passport"></i> Passport Number</label>
                <input placeholder="e.g. A12345678" value={passport} onChange={(e)=>setPassport(e.target.value)} required />
              </div>
              <div className="form-field">
                <label><i className="fa-solid fa-calendar-days"></i> Intended Travel Date</label>
                <input type="date" value={travel} onChange={(e)=>setTravel(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary"><i className="fa-solid fa-paper-plane"></i> Submit Application</button>
              <p className="form-note">Demo only — no real visa will be processed.</p>
            </form>
          )}

          {step === "success" && (
            <div className="success-card">
              <div className="success-icon"><i className="fa-solid fa-circle-check"></i></div>
              <h2>Application Submitted!</h2>
              <p>Your Dubai Visa application has been received. Our team will contact you within 2 business days with next steps.</p>
              <button className="btn-primary" style={{marginTop:24}} onClick={()=>router.push("/more")}><i className="fa-solid fa-house"></i> Back to Services</button>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .form-page { padding:16px; max-width:480px; }
        .visa-banner { display:flex; align-items:center; gap:16px; background:linear-gradient(135deg,#c8102e,#8b0a1e); border-radius:12px; padding:20px; color:#fff; margin-bottom:16px; }
        .visa-banner-icon { font-size:40px; flex-shrink:0; }
        .visa-banner-title { font-size:16px; font-weight:700; margin-bottom:4px; }
        .visa-banner-sub   { font-size:12px; opacity:0.85; line-height:1.4; }
        .visa-features { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
        .visa-feature { display:flex; align-items:center; gap:14px; background:#fff; border-radius:10px; padding:14px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .visa-feature i { font-size:22px; color:#c8102e; width:28px; text-align:center; flex-shrink:0; }
        .vf-title { font-size:14px; font-weight:600; color:#1a1a1a; }
        .vf-sub   { font-size:12px; color:#888; margin-top:2px; }
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
