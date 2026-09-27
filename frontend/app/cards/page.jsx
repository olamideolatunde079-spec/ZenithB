// app/cards/page.jsx — Cards Page ( "/cards" )
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

// Demo card data — fictional details only
const DEMO_CARD = {
  type:   "Visa Debit",
  name:   "ADEBAYO OLAMIDE",
  number: "**** **** **** 4582",
  expiry: "08/27",
  frozen: false,
};

export default function CardsPage() {
  const [card,    setCard]    = useState(DEMO_CARD);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState("");
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  function toggleFreeze() {
    setCard((c) => ({ ...c, frozen: !c.frozen }));
    setMsg(card.frozen ? "Card unfrozen successfully." : "Card frozen successfully.");
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="My Cards" showBack />

        <div className="cards-page">

          {msg && <div className="success-banner"><i className="fa-solid fa-circle-check"></i> {msg}</div>}

          {/* Visual card */}
          <div className={`demo-card ${card.frozen ? "frozen" : ""}`}>
            <div className="dc-top">
              <span className="dc-bank">Zenith Bank</span>
              {card.frozen && <span className="dc-frozen-badge">FROZEN</span>}
            </div>
            <p className="dc-number">{card.number}</p>
            <div className="dc-bottom">
              <div>
                <p className="dc-sub">Card Holder</p>
                <p className="dc-val">{card.name}</p>
              </div>
              <div>
                <p className="dc-sub">Expires</p>
                <p className="dc-val">{card.expiry}</p>
              </div>
              <p className="dc-type">{card.type}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="card-actions">
            <button className="card-action-btn">
              <i className="fa-solid fa-eye"></i>
              <span>View Details</span>
            </button>
            <button className="card-action-btn" onClick={toggleFreeze}>
              <i className={`fa-solid ${card.frozen ? "fa-lock-open" : "fa-lock"}`}></i>
              <span>{card.frozen ? "Unfreeze" : "Freeze"} Card</span>
            </button>
            <button className="card-action-btn">
              <i className="fa-solid fa-rotate"></i>
              <span>Request New</span>
            </button>
          </div>

          <p className="demo-note">
            <i className="fa-solid fa-shield-halved"></i> Demo mode — no real card operations are performed.
          </p>
        </div>
      </main>

      <style>{`
        .cards-page { padding: 20px 16px; max-width: 480px; }
        .success-banner {
          background:#e6f9ed; color:#28a745; border:1px solid #c3e6cb;
          border-radius:6px; padding:10px 14px; margin-bottom:16px;
          font-size:13px; display:flex; align-items:center; gap:8px;
        }
        .demo-card {
          background: linear-gradient(135deg,#c8102e 0%,#8b0a1e 100%);
          border-radius:16px; padding:22px 20px; color:#fff;
          margin-bottom:24px; position:relative; overflow:hidden;
          box-shadow:0 6px 20px rgba(200,16,46,0.35);
          min-height:170px; display:flex; flex-direction:column; justify-content:space-between;
        }
        .demo-card.frozen { filter:grayscale(0.6); opacity:0.85; }
        .dc-top { display:flex; justify-content:space-between; align-items:center; }
        .dc-bank { font-size:15px; font-weight:700; }
        .dc-frozen-badge {
          background:rgba(255,255,255,0.25); border-radius:4px;
          padding:2px 8px; font-size:11px; font-weight:700; letter-spacing:1px;
        }
        .dc-number { font-size:20px; letter-spacing:3px; font-weight:600; margin:14px 0; }
        .dc-bottom { display:flex; align-items:flex-end; gap:24px; }
        .dc-sub { font-size:10px; opacity:0.7; text-transform:uppercase; margin-bottom:2px; }
        .dc-val { font-size:13px; font-weight:600; }
        .dc-type { margin-left:auto; font-size:20px; font-weight:800; font-style:italic; opacity:0.85; }

        .card-actions { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; }
        .card-action-btn {
          background:#fff; border:1px solid #e4e4e4; border-radius:10px;
          padding:16px 8px; display:flex; flex-direction:column;
          align-items:center; gap:8px; font-size:12px; font-weight:500;
          color:#333; cursor:pointer; transition:border-color 0.15s;
        }
        .card-action-btn i { font-size:20px; color:#c8102e; }
        .card-action-btn:hover { border-color:#c8102e; }

        .demo-note { font-size:12px; color:#aaa; text-align:center; line-height:1.5; }
        .demo-note i { margin-right:4px; color:#28a745; }
      `}</style>
    </div>
  );
}

function LoadingLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>
      </main>
    </div>
  );
}
