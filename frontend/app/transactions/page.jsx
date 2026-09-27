// transactions/page.jsx — Transactions Page ( "/transactions" )
// ============================================================
// Full transaction history with search, filter, and detail modal.
// Icons use Font Awesome (loaded via CDN in layout.tsx).
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx,   setSelectedTx]   = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filter,       setFilter]       = useState("all");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const router = useRouter();

  useEffect(() => { loadTransactions(); }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const response = await fetch(`${API_URL}/api/transactions?limit=100`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!response.ok) throw new Error("Could not load transactions.");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError("Unable to load transactions. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }

  // Filter list by search text and type tab — recalculated on every render
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

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

  function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
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
        <div className="page-inner">

          <h1 className="page-title">Transactions</h1>
          {error && <div className="error-box">{error}</div>}

          {/* ---- Search bar ---- */}
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* ---- Filter tabs ---- */}
          <div className="filter-tabs">
            <button className={`filter-tab ${filter === "all"    ? "active" : ""}`} onClick={() => setFilter("all")}>
              <i className="fa-solid fa-bars-staggered"></i> All
            </button>
            <button className={`filter-tab ${filter === "credit" ? "active" : ""}`} onClick={() => setFilter("credit")}>
              <i className="fa-solid fa-arrow-down"></i> Money In
            </button>
            <button className={`filter-tab ${filter === "debit"  ? "active" : ""}`} onClick={() => setFilter("debit")}>
              <i className="fa-solid fa-arrow-up"></i> Money Out
            </button>
          </div>

          <p className="results-count">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
          </p>

          {/* ---- Transaction list ---- */}
          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-inbox" style={{ fontSize: 30, display: "block", marginBottom: 10, color: "#ccc" }}></i>
              {searchQuery ? "No transactions match your search." : "No transactions yet."}
            </div>
          ) : (
            <div className="transaction-list">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="transaction-row"
                  onClick={() => setSelectedTx(tx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedTx(tx)}
                >
                  <div className={`tx-icon ${tx.type}`}>
                    <i className={`fa-solid ${tx.type === "credit" ? "fa-arrow-down" : "fa-arrow-up"}`}></i>
                  </div>
                  <div className="tx-info">
                    <p className="tx-desc">{tx.description}</p>
                    <p className="tx-meta">
                      {formatDate(tx.created_at)}
                      <span className={`tx-badge ${tx.status}`}>{tx.status}</span>
                    </p>
                  </div>
                  <div className="tx-right">
                    <p className={`tx-amount ${tx.type}`}>
                      {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <i className="fa-solid fa-chevron-right tx-chevron"></i>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* ---- Transaction Detail Modal ---- */}
      {selectedTx && (
        <div className="modal-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h2 className="modal-title">Transaction Details</h2>
              <button className="modal-close" onClick={() => setSelectedTx(null)} aria-label="Close">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className={`modal-amount-block ${selectedTx.type}`}>
              <p className="modal-amount-label">
                <i className={`fa-solid ${selectedTx.type === "credit" ? "fa-arrow-down" : "fa-arrow-up"}`}></i>
                {" "}{selectedTx.type === "credit" ? "Money Received" : "Money Sent"}
              </p>
              <p className="modal-amount">
                {selectedTx.type === "credit" ? "+" : "-"}{formatCurrency(selectedTx.amount)}
              </p>
            </div>

            <div className="modal-details">
              <div className="modal-row">
                <span className="modal-row-label"><i className="fa-solid fa-align-left"></i> Description</span>
                <span className="modal-row-value">{selectedTx.description}</span>
              </div>
              <div className="modal-row">
                <span className="modal-row-label"><i className="fa-solid fa-calendar"></i> Date & Time</span>
                <span className="modal-row-value">{formatDateTime(selectedTx.created_at)}</span>
              </div>
              <div className="modal-row">
                <span className="modal-row-label"><i className="fa-solid fa-circle-check"></i> Status</span>
                <span className={`modal-status ${selectedTx.status}`}>
                  {selectedTx.status.charAt(0).toUpperCase() + selectedTx.status.slice(1)}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-row-label"><i className="fa-solid fa-tag"></i> Type</span>
                <span className="modal-row-value">
                  {selectedTx.type === "credit" ? "Credit (Money In)" : "Debit (Money Out)"}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-row-label"><i className="fa-solid fa-hashtag"></i> Reference</span>
                <span className="modal-row-value modal-ref">{selectedTx.reference || "—"}</span>
              </div>
            </div>

            <button className="modal-done-btn" onClick={() => setSelectedTx(null)}>
              Done
            </button>

          </div>
        </div>
      )}

      <style>{`
        .app-layout { display: flex; min-height: 100vh; background-color: #f5f5f5; }
        .main-content { margin-left: 220px; flex: 1; padding: 32px 24px 80px; }
        .page-inner { max-width: 680px; }
        .page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px; }
        .loading-screen { padding: 60px 20px; text-align: center; color: #888; }
        .error-box {
          background: #fff5f5; color: #c8102e;
          border: 1px solid #ffcccc; border-radius: 8px;
          padding: 12px 16px; margin-bottom: 20px; font-size: 14px;
        }

        /* Search */
        .search-bar { position: relative; margin-bottom: 16px; }
        .search-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #aaa; pointer-events: none;
        }
        .search-bar input {
          width: 100%; padding: 12px 40px 12px 42px;
          font-size: 15px; border: 1.5px solid #e0e0e0;
          border-radius: 8px; background: white; outline: none;
          transition: border-color 0.2s; color: #1a1a1a;
        }
        .search-bar input:focus { border-color: #c8102e; }
        .search-clear {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; color: #aaa; cursor: pointer; padding: 4px;
        }

        /* Filter tabs */
        .filter-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .filter-tab {
          padding: 8px 16px; border-radius: 20px;
          border: 1.5px solid #e0e0e0; background: white;
          font-size: 13px; font-weight: 500; color: #666;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .filter-tab.active { background: #c8102e; border-color: #c8102e; color: white; }

        .results-count { font-size: 13px; color: #999; margin-bottom: 12px; }

        /* Transaction list */
        .transaction-list {
          background: white; border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden;
        }
        .transaction-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-bottom: 1px solid #f0f0f0;
          cursor: pointer; transition: background-color 0.15s;
        }
        .transaction-row:last-child { border-bottom: none; }
        .transaction-row:hover { background-color: #fafafa; }

        .tx-icon {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .tx-icon.credit { background: #e6f9ed; color: #28a745; }
        .tx-icon.debit  { background: #fff0f0; color: #c8102e; }

        .tx-info { flex: 1; min-width: 0; }
        .tx-desc {
          font-size: 14px; font-weight: 500; color: #1a1a1a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tx-meta {
          font-size: 12px; color: #999; margin-top: 3px;
          display: flex; align-items: center; gap: 8px;
        }
        .tx-badge {
          font-size: 11px; font-weight: 500;
          padding: 2px 8px; border-radius: 10px;
        }
        .tx-badge.success { background: #e6f9ed; color: #28a745; }
        .tx-badge.pending { background: #fff8e1; color: #f59e0b; }
        .tx-badge.failed  { background: #fff0f0; color: #c8102e; }

        .tx-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .tx-amount { font-size: 14px; font-weight: 600; }
        .tx-amount.credit { color: #28a745; }
        .tx-amount.debit  { color: #c8102e; }
        .tx-chevron { font-size: 12px; color: #ccc; }

        .empty-state {
          background: white; border-radius: 12px; padding: 40px 20px;
          text-align: center; color: #999; font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: flex-end;
          justify-content: center; z-index: 200; padding: 16px;
        }
        .modal-card {
          background: white; border-radius: 16px;
          width: 100%; max-width: 480px; overflow: hidden;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-header {
          display: flex; justify-content: space-between;
          align-items: center; padding: 20px 20px 0;
        }
        .modal-title { font-size: 17px; font-weight: 700; color: #1a1a1a; }
        .modal-close {
          background: #f0f0f0; border: none; width: 30px; height: 30px;
          border-radius: 50%; cursor: pointer; color: #555;
          display: flex; align-items: center; justify-content: center;
        }
        .modal-amount-block { text-align: center; padding: 24px 20px 20px; }
        .modal-amount-block.credit { background: #f0fff4; }
        .modal-amount-block.debit  { background: #fff5f5; }
        .modal-amount-label { font-size: 13px; color: #888; margin-bottom: 6px; }
        .modal-amount { font-size: 28px; font-weight: 700; }
        .modal-amount-block.credit .modal-amount { color: #28a745; }
        .modal-amount-block.debit  .modal-amount { color: #c8102e; }

        .modal-details { padding: 4px 20px 8px; }
        .modal-row {
          display: flex; justify-content: space-between;
          align-items: flex-start; padding: 12px 0;
          border-bottom: 1px solid #f5f5f5; gap: 16px;
        }
        .modal-row:last-child { border-bottom: none; }
        .modal-row-label { font-size: 13px; color: #888; flex-shrink: 0; }
        .modal-row-label i { margin-right: 5px; }
        .modal-row-value { font-size: 14px; font-weight: 500; color: #1a1a1a; text-align: right; }
        .modal-ref { font-family: monospace; font-size: 13px; color: #555; }
        .modal-status {
          font-size: 13px; font-weight: 600;
          padding: 3px 10px; border-radius: 10px;
        }
        .modal-status.success { background: #e6f9ed; color: #28a745; }
        .modal-status.pending { background: #fff8e1; color: #f59e0b; }
        .modal-status.failed  { background: #fff0f0; color: #c8102e; }

        .modal-done-btn {
          width: calc(100% - 40px); margin: 4px 20px 20px;
          padding: 13px; background: #c8102e; color: white;
          border: none; border-radius: 8px;
          font-size: 15px; font-weight: 600; cursor: pointer;
        }
        .modal-done-btn:hover { background: #a00d25; }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px 16px 90px; }
          .modal-backdrop { padding: 0; }
          .modal-card { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
        }
      `}</style>
    </div>
  );
}
