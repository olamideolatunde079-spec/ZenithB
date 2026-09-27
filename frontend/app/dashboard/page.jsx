// dashboard/page.jsx — Dashboard Page ( "/dashboard" )
// ============================================================
// Main screen after login. Shows:
//   1. Greeting with user's name
//   2. Account balance card (hide/show toggle)
//   3. Quick action buttons
//   4. 5 most recent transactions
//
// Icons use Font Awesome (loaded via CDN in layout.tsx).
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [profile,      setProfile]      = useState(null);
  const [account,      setAccount]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  // showBalance: true = visible, false = hidden with dots
  const [showBalance,  setShowBalance]  = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const router = useRouter();

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const token = session.access_token;

      // Fetch account info and recent transactions at the same time
      const [accountRes, txRes] = await Promise.all([
        fetch(`${API_URL}/api/account`,            { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/transactions?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!accountRes.ok) throw new Error("Could not load account.");
      if (!txRes.ok)      throw new Error("Could not load transactions.");

      const accountData = await accountRes.json();
      const txData      = await txRes.json();

      setProfile(accountData.profile);
      setAccount(accountData.account);
      setTransactions(txData.transactions || []);

    } catch (err) {
      setError("Unable to load dashboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency", currency: "NGN", minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  function getFirstName(fullName) {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-screen">
            <i className="fa-solid fa-circle-notch fa-spin"></i> Loading...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="dashboard-inner">

          {error && <div className="dash-error">{error}</div>}

          {/* ---- Greeting ---- */}
          <div className="greeting">
            <p className="greeting-sub">Good day,</p>
            <h1 className="greeting-name">
              {getFirstName(profile?.full_name)}
              <i className="fa-solid fa-hand-wave greeting-wave"></i>
            </h1>
          </div>

          {/* ---- Balance Card ---- */}
          <div className="balance-card">
            <div className="balance-card-top">
              <div>
                <p className="balance-label">
                  <i className="fa-solid fa-wallet"></i> Available Balance
                </p>
                <p className="balance-account-type">{account?.account_type}</p>
              </div>
              {/* Toggle show/hide balance */}
              <button
                className="balance-toggle"
                onClick={() => setShowBalance(!showBalance)}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                <i className={`fa-solid ${showBalance ? "fa-eye-slash" : "fa-eye"}`}></i>
                {showBalance ? " Hide" : " Show"}
              </button>
            </div>

            <p className="balance-amount">
              {showBalance ? formatCurrency(account?.balance || 0) : "₦ ••••••••"}
            </p>

            <p className="balance-account-number">
              <i className="fa-solid fa-credit-card"></i>{" "}
              {account?.account_number || "—"}
            </p>
          </div>

          {/* ---- Quick Actions ---- */}
          <p className="section-title">Quick Actions</p>
          <div className="quick-actions">
            <Link href="/transfers" className="quick-action-btn">
              <i className="fa-solid fa-paper-plane qa-icon"></i>
              <span>Transfer</span>
            </Link>
            <Link href="/airtime" className="quick-action-btn">
              <i className="fa-solid fa-mobile-screen qa-icon"></i>
              <span>Airtime</span>
            </Link>
            <Link href="/bills" className="quick-action-btn">
              <i className="fa-solid fa-bolt qa-icon"></i>
              <span>Bills</span>
            </Link>
            <Link href="/transactions" className="quick-action-btn">
              <i className="fa-solid fa-list qa-icon"></i>
              <span>History</span>
            </Link>
          </div>

          {/* ---- Recent Transactions ---- */}
          <div className="section-header">
            <p className="section-title" style={{ marginBottom: 0 }}>
              Recent Transactions
            </p>
            <Link href="/transactions" className="see-all-link">
              See all <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="no-transactions">
              <i className="fa-solid fa-inbox" style={{ fontSize: 28, marginBottom: 8, display: "block", color: "#ccc" }}></i>
              No transactions yet.
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className={`tx-icon ${tx.type}`}>
                    <i className={`fa-solid ${tx.type === "credit" ? "fa-arrow-down" : "fa-arrow-up"}`}></i>
                  </div>
                  <div className="tx-details">
                    <p className="tx-description">{tx.description}</p>
                    <p className="tx-date">{formatDate(tx.created_at)}</p>
                  </div>
                  <p className={`tx-amount ${tx.type}`}>
                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        .main-content {
          margin-left: 220px;
          flex: 1;
          padding: 32px 24px;
          padding-bottom: 80px;
        }
        .dashboard-inner { max-width: 640px; }

        .loading-screen {
          padding: 60px 20px;
          text-align: center;
          color: #888;
          font-size: 15px;
        }
        .dash-error {
          background: #fff5f5;
          color: #c8102e;
          border: 1px solid #ffcccc;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .greeting { margin-bottom: 24px; }
        .greeting-sub { font-size: 14px; color: #888; margin-bottom: 2px; }
        .greeting-name {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .greeting-wave { color: #f59e0b; font-size: 22px; }

        /* Balance card */
        .balance-card {
          background: linear-gradient(135deg, #c8102e 0%, #8b0a1e 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(200,16,46,0.30);
        }
        .balance-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .balance-label { font-size: 13px; opacity: 0.8; margin-bottom: 2px; }
        .balance-label i { margin-right: 5px; }
        .balance-account-type { font-size: 12px; opacity: 0.65; }
        .balance-toggle {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .balance-toggle:hover { background: rgba(255,255,255,0.3); }
        .balance-amount {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }
        .balance-account-number { font-size: 13px; opacity: 0.7; }
        .balance-account-number i { margin-right: 5px; }

        /* Section titles */
        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #444;
          margin-bottom: 14px;
          display: block;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .see-all-link {
          font-size: 13px;
          color: #c8102e;
          text-decoration: none;
          font-weight: 500;
        }
        .see-all-link i { font-size: 11px; margin-left: 3px; }

        /* Quick actions */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        .quick-action-btn {
          background: white;
          border-radius: 12px;
          padding: 18px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #333;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .quick-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.10);
        }
        .qa-icon { font-size: 22px; color: #c8102e; }

        /* Transactions */
        .transaction-list {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
        }
        .transaction-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .transaction-item:last-child { border-bottom: none; }
        .tx-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .tx-icon.credit { background-color: #e6f9ed; color: #28a745; }
        .tx-icon.debit  { background-color: #fff0f0; color: #c8102e; }
        .tx-details { flex: 1; min-width: 0; }
        .tx-description {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tx-date { font-size: 12px; color: #999; margin-top: 2px; }
        .tx-amount { font-size: 14px; font-weight: 600; flex-shrink: 0; }
        .tx-amount.credit { color: #28a745; }
        .tx-amount.debit  { color: #c8102e; }
        .no-transactions {
          background: white;
          border-radius: 12px;
          padding: 32px 20px;
          text-align: center;
          color: #999;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px 16px 90px; }
          .quick-actions { gap: 8px; }
          .balance-amount { font-size: 26px; }
        }
      `}</style>
    </div>
  );
}
