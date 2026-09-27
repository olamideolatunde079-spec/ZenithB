// app/forex/page.jsx — Forex Page ( "/forex" )
// Shows demo exchange rates. Static data — no live API.
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

// Demo exchange rates (NGN per 1 unit of foreign currency)
// Clearly labelled as demo values
const RATES = [
  { currency: "USD", flag: "🇺🇸", name: "US Dollar",       buy: 1545.00, sell: 1558.00 },
  { currency: "GBP", flag: "🇬🇧", name: "British Pound",   buy: 1962.00, sell: 1980.00 },
  { currency: "EUR", flag: "🇪🇺", name: "Euro",            buy: 1665.00, sell: 1678.00 },
  { currency: "CAD", flag: "🇨🇦", name: "Canadian Dollar", buy: 1118.00, sell: 1128.00 },
  { currency: "CHF", flag: "🇨🇭", name: "Swiss Franc",     buy: 1720.00, sell: 1735.00 },
  { currency: "JPY", flag: "🇯🇵", name: "Japanese Yen",    buy:   10.20, sell:   10.50 },
  { currency: "AED", flag: "🇦🇪", name: "UAE Dirham",      buy:  420.00, sell:  428.00 },
];

export default function ForexPage() {
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

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Forex Rates" showBack />

        <div className="forex-page">
          <p className="forex-note">
            <i className="fa-solid fa-circle-info"></i> Demo rates only — not for real transactions.
          </p>

          {/* Column headers */}
          <div className="forex-header-row">
            <span className="fh-currency">Currency</span>
            <span className="fh-rate">Buy (₦)</span>
            <span className="fh-rate">Sell (₦)</span>
          </div>

          {/* Rate rows */}
          {RATES.map((r) => (
            <div key={r.currency} className="forex-row">
              <div className="forex-currency-col">
                <span className="forex-flag">{r.flag}</span>
                <div>
                  <p className="forex-code">{r.currency}</p>
                  <p className="forex-name">{r.name}</p>
                </div>
              </div>
              <span className="forex-rate">{r.buy.toFixed(2)}</span>
              <span className="forex-rate sell">{r.sell.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        .forex-page { padding: 0 0 20px; }
        .forex-note {
          font-size:12px; color:#888; padding:10px 16px;
          display:flex; align-items:center; gap:6px;
          border-bottom:1px solid #f0f0f0;
        }
        .forex-note i { color:#f59e0b; }
        .forex-header-row {
          display:grid; grid-template-columns:1fr 90px 90px;
          padding:10px 16px; background:#f8f8f8;
          border-bottom:1px solid #e4e4e4;
          font-size:11px; font-weight:700; color:#888; text-transform:uppercase;
        }
        .fh-rate { text-align:right; }
        .forex-row {
          display:grid; grid-template-columns:1fr 90px 90px;
          padding:14px 16px; background:#fff;
          border-bottom:1px solid #f0f0f0;
          align-items:center;
        }
        .forex-currency-col { display:flex; align-items:center; gap:12px; }
        .forex-flag { font-size:22px; }
        .forex-code { font-size:14px; font-weight:700; color:#1a1a1a; }
        .forex-name { font-size:11px; color:#888; margin-top:1px; }
        .forex-rate { font-size:13px; font-weight:600; color:#1a1a1a; text-align:right; }
        .forex-rate.sell { color:#c8102e; }
      `}</style>
    </div>
  );
}

function LoadingLayout() {
  return (
    <div className="app-layout"><Navbar />
      <main className="main-content">
        <div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>
      </main>
    </div>
  );
}
