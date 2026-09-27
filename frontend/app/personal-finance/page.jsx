// app/personal-finance/page.jsx — Personal Finance Manager
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

// Demo data — all fictional
const INCOME   = 375000;
const EXPENSES = 67700;
const BALANCE  = INCOME - EXPENSES;

// Spending categories with CSS bar widths
const CATEGORIES = [
  { name:"Transfers",   amount:50000, pct:74, color:"#c8102e" },
  { name:"Utilities",   amount: 8500, pct:13, color:"#f59e0b" },
  { name:"Airtime",     amount: 2000, pct: 3, color:"#3b82f6" },
  { name:"Subscriptions",amount:7200, pct:11, color:"#8b5cf6" },
];

export default function PersonalFinancePage() {
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

  function fmt(n) {
    return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",minimumFractionDigits:0}).format(n);
  }

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Personal Finance" showBack />

        <div className="pf-page">

          {/* Summary cards */}
          <div className="pf-summary">
            <div className="pf-card income">
              <p className="pf-card-label"><i className="fa-solid fa-arrow-down"></i> Income</p>
              <p className="pf-card-value">{fmt(INCOME)}</p>
            </div>
            <div className="pf-card expense">
              <p className="pf-card-label"><i className="fa-solid fa-arrow-up"></i> Expenses</p>
              <p className="pf-card-value">{fmt(EXPENSES)}</p>
            </div>
          </div>

          <div className="pf-balance-card">
            <p className="pf-balance-label">Net Balance (September 2026)</p>
            <p className="pf-balance-value">{fmt(BALANCE)}</p>
          </div>

          {/* Spending breakdown */}
          <p className="pf-section">Spending Breakdown</p>
          <div className="pf-categories">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="pf-cat-row">
                <div className="pf-cat-info">
                  <span className="pf-cat-dot" style={{background:c.color}}></span>
                  <span className="pf-cat-name">{c.name}</span>
                  <span className="pf-cat-amount">{fmt(c.amount)}</span>
                </div>
                <div className="pf-bar-bg">
                  <div className="pf-bar-fill" style={{width:`${c.pct}%`, background:c.color}}></div>
                </div>
              </div>
            ))}
          </div>

          <p className="pf-note">Based on demo data for September 2026.</p>
        </div>
      </main>

      <style>{`
        .pf-page { padding:16px; max-width:540px; }
        .pf-summary { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .pf-card { background:#fff; border-radius:10px; padding:16px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .pf-card-label { font-size:12px; color:#888; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
        .pf-card.income .pf-card-label i { color:#28a745; }
        .pf-card.expense .pf-card-label i { color:#c8102e; }
        .pf-card-value { font-size:15px; font-weight:700; color:#1a1a1a; }
        .pf-balance-card { background:linear-gradient(135deg,#c8102e,#8b0a1e); border-radius:12px; padding:20px; color:#fff; margin-bottom:20px; }
        .pf-balance-label { font-size:12px; opacity:0.8; margin-bottom:6px; }
        .pf-balance-value { font-size:24px; font-weight:700; }
        .pf-section { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:12px; }
        .pf-categories { background:#fff; border-radius:10px; padding:16px; box-shadow:0 1px 4px rgba(0,0,0,0.07); margin-bottom:16px; }
        .pf-cat-row { margin-bottom:14px; }
        .pf-cat-row:last-child { margin-bottom:0; }
        .pf-cat-info { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
        .pf-cat-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .pf-cat-name { flex:1; font-size:13px; font-weight:500; color:#1a1a1a; }
        .pf-cat-amount { font-size:13px; font-weight:600; color:#555; }
        .pf-bar-bg { height:6px; background:#f0f0f0; border-radius:3px; overflow:hidden; }
        .pf-bar-fill { height:100%; border-radius:3px; transition:width 0.4s ease; }
        .pf-note { font-size:11px; color:#bbb; text-align:center; }
      `}</style>
    </div>
  );
}

function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
