// airtime/page.jsx — Airtime Page ( "/airtime" )
// ============================================================
// Simulates buying airtime for any Nigerian network.
//
// Flow:
//   Step 1: "form"    — pick network, enter phone number + amount
//   Step 2: "confirm" — review before submitting
//   Step 3: "success" — shows confirmation
//
// Same 3-step pattern as the transfers page — once you
// understand one, you understand all of them.
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// The four networks from the spec, each with a brand colour
const NETWORKS = [
  { name: "MTN",     color: "#FFCC00", textColor: "#1a1a1a", icon: "fa-signal" },
  { name: "Airtel",  color: "#E8001D", textColor: "#ffffff", icon: "fa-signal" },
  { name: "Glo",     color: "#008000", textColor: "#ffffff", icon: "fa-signal" },
  { name: "9mobile", color: "#006B3F", textColor: "#ffffff", icon: "fa-signal" },
];

// Common airtime amounts for quick selection
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage() {
  const [step,        setStep]       = useState("form");
  const [network,     setNetwork]    = useState("");
  const [phone,       setPhone]      = useState("");
  const [amount,      setAmount]     = useState("");
  const [result,      setResult]     = useState(null);
  const [loading,     setLoading]    = useState(false);
  const [pageLoading, setPageLoading]= useState(true);
  const [error,       setError]      = useState("");

  const router = useRouter();

  useEffect(() => {
    // Just check the session — no extra data needed for airtime
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setPageLoading(false);
    }
    checkAuth();
  }, []);

  function handleReview(e) {
    e.preventDefault();
    setError("");

    if (!network)              { setError("Please select a network."); return; }
    if (!phone.trim())         { setError("Please enter a phone number."); return; }
    if (phone.length < 11)     { setError("Phone number must be 11 digits."); return; }
    if (!amount || Number(amount) < 50) { setError("Minimum airtime amount is ₦50."); return; }

    setStep("confirm");
  }

  async function handleConfirm() {
    try {
      setError("");
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // POST to our FastAPI /api/airtime endpoint
      const response = await fetch(`${API_URL}/api/airtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          network:      network,
          phone_number: phone,
          amount:       Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Airtime purchase failed. Please try again.");
        setStep("form");
        return;
      }

      setResult(data);
      setStep("success");

    } catch (err) {
      setError("Unable to complete request. Check your connection and try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  function handleNewPurchase() {
    setNetwork(""); setPhone(""); setAmount("");
    setResult(null); setError(""); setStep("form");
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency", currency: "NGN", minimumFractionDigits: 2,
    }).format(val);
  }

  const selectedNetwork = NETWORKS.find((n) => n.name === network);

  if (pageLoading) {
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

          {step !== "success" && (
            <div className="page-top">
              {step === "confirm" ? (
                <button className="back-btn" onClick={() => setStep("form")}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
              ) : (
                <Link href="/dashboard" className="back-btn">
                  <i className="fa-solid fa-arrow-left"></i> Back
                </Link>
              )}
              <h1 className="page-title">
                {step === "form" ? "Buy Airtime" : "Confirm Airtime"}
              </h1>
            </div>
          )}

          {error && (
            <div className="error-box">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          {/* ---- STEP 1: FORM ---- */}
          {step === "form" && (
            <form className="card" onSubmit={handleReview}>

              {/* Network selector — visual buttons not a plain dropdown */}
              <div className="form-field">
                <label>
                  <i className="fa-solid fa-tower-broadcast"></i> Select Network
                </label>
                <div className="network-grid">
                  {NETWORKS.map((net) => (
                    <button
                      key={net.name}
                      type="button"
                      className={`network-btn ${network === net.name ? "selected" : ""}`}
                      style={network === net.name
                        ? { backgroundColor: net.color, color: net.textColor, borderColor: net.color }
                        : {}}
                      onClick={() => setNetwork(net.name)}
                    >
                      <i className="fa-solid fa-signal"></i>
                      <span>{net.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="phone">
                  <i className="fa-solid fa-mobile-screen"></i> Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={11}
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  <i className="fa-solid fa-naira-sign"></i> Amount (₦)
                </label>
                {/* Quick amount chips */}
                <div className="quick-amounts">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`amount-chip ${amount === String(val) ? "selected" : ""}`}
                      onClick={() => setAmount(String(val))}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Or enter custom amount"
                  min="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-eye"></i> Review
              </button>
            </form>
          )}

          {/* ---- STEP 2: CONFIRM ---- */}
          {step === "confirm" && (
            <div className="card">

              <div className="confirm-amount-block"
                style={{ backgroundColor: selectedNetwork?.color + "22" }}
              >
                <p className="confirm-label">Airtime Amount</p>
                <p className="confirm-amount" style={{ color: selectedNetwork?.color !== "#FFCC00" ? selectedNetwork?.color : "#b8960a" }}>
                  {formatCurrency(Number(amount))}
                </p>
              </div>

              <div className="confirm-details">
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-tower-broadcast"></i> Network
                  </span>
                  <span className="confirm-row-value">{network}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-mobile-screen"></i> Phone
                  </span>
                  <span className="confirm-row-value">{phone}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-naira-sign"></i> Amount
                  </span>
                  <span className="confirm-row-value">{formatCurrency(Number(amount))}</span>
                </div>
              </div>

              <p className="confirm-disclaimer">
                <i className="fa-solid fa-shield-halved"></i>{" "}
                This is a simulated purchase. No real airtime will be sent.
              </p>

              <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                  : <><i className="fa-solid fa-bolt"></i> Confirm Purchase</>}
              </button>
            </div>
          )}

          {/* ---- STEP 3: SUCCESS ---- */}
          {step === "success" && (
            <div className="success-card">
              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2 className="success-title">Airtime Purchased!</h2>
              <p className="success-subtitle">{result?.message}</p>

              <div className="success-details">
                <div className="confirm-row">
                  <span className="confirm-row-label">Network</span>
                  <span className="confirm-row-value">{network}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Phone</span>
                  <span className="confirm-row-value">{phone}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Amount</span>
                  <span className="confirm-row-value success-amount">
                    {formatCurrency(Number(amount))}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">New Balance</span>
                  <span className="confirm-row-value">
                    {result?.new_balance !== undefined ? formatCurrency(result.new_balance) : "—"}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Reference</span>
                  <span className="confirm-row-value ref-code">{result?.reference || "—"}</span>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn-primary" onClick={handleNewPurchase}>
                  <i className="fa-solid fa-plus"></i> Buy Again
                </button>
                <Link href="/dashboard" className="btn-secondary">
                  <i className="fa-solid fa-house"></i> Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .app-layout  { display: flex; min-height: 100vh; background-color: #f5f5f5; }
        .main-content { margin-left: 220px; flex: 1; padding: 32px 24px 80px; }
        .page-inner  { max-width: 520px; }
        .loading-screen { padding: 60px 20px; text-align: center; color: #888; }

        .page-top { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .page-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0; }
        .back-btn {
          background: white; border: 1.5px solid #e0e0e0; border-radius: 8px;
          padding: 8px 14px; font-size: 13px; font-weight: 500; color: #444;
          cursor: pointer; text-decoration: none; display: flex; align-items: center;
          gap: 6px; transition: background 0.15s; flex-shrink: 0;
        }
        .back-btn:hover { background: #f5f5f5; }

        .error-box {
          background: #fff5f5; color: #c8102e; border: 1px solid #ffcccc;
          border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 14px;
        }
        .error-box i { margin-right: 6px; }

        .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }

        .form-field { margin-bottom: 20px; }
        .form-field label {
          display: block; font-size: 13px; font-weight: 500;
          color: #555; margin-bottom: 8px;
        }
        .form-field label i { margin-right: 6px; color: #c8102e; }
        .form-field input {
          width: 100%; padding: 12px 14px; font-size: 15px;
          border: 1.5px solid #ddd; border-radius: 8px; outline: none;
          color: #1a1a1a; transition: border-color 0.2s; background: white;
        }
        .form-field input:focus { border-color: #c8102e; }

        /* Network grid */
        .network-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .network-btn {
          padding: 12px 8px; border-radius: 10px; border: 2px solid #e0e0e0;
          background: white; cursor: pointer; display: flex; flex-direction: column;
          align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
          color: #444; transition: all 0.15s;
        }
        .network-btn i { font-size: 18px; }
        .network-btn:hover { border-color: #c8102e; }
        .network-btn.selected { border-width: 2px; }

        /* Quick amount chips */
        .quick-amounts { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .amount-chip {
          padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e0e0e0;
          background: white; font-size: 13px; font-weight: 500; color: #555;
          cursor: pointer; transition: all 0.15s;
        }
        .amount-chip:hover   { border-color: #c8102e; color: #c8102e; }
        .amount-chip.selected { background: #c8102e; border-color: #c8102e; color: white; }

        /* Confirm */
        .confirm-amount-block {
          text-align: center; border-radius: 10px;
          padding: 20px; margin-bottom: 20px;
        }
        .confirm-label  { font-size: 13px; color: #888; margin-bottom: 4px; }
        .confirm-amount { font-size: 30px; font-weight: 700; }
        .confirm-details { margin-bottom: 20px; }
        .confirm-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 0; border-bottom: 1px solid #f5f5f5; gap: 16px;
        }
        .confirm-row:last-child { border-bottom: none; }
        .confirm-row-label { font-size: 13px; color: #888; flex-shrink: 0; }
        .confirm-row-label i { margin-right: 5px; }
        .confirm-row-value { font-size: 14px; font-weight: 500; color: #1a1a1a; text-align: right; }
        .confirm-disclaimer {
          font-size: 12px; color: #aaa; text-align: center;
          margin-bottom: 20px; line-height: 1.5;
        }
        .confirm-disclaimer i { margin-right: 4px; color: #28a745; }

        /* Buttons */
        .btn-primary {
          width: 100%; padding: 13px; background: #c8102e; color: white;
          border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: background 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-primary:hover    { background: #a00d25; }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .btn-secondary {
          width: 100%; padding: 13px; background: white; color: #c8102e;
          border: 2px solid #c8102e; border-radius: 8px; font-size: 15px;
          font-weight: 600; cursor: pointer; text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: #c8102e; color: white; }

        /* Success */
        .success-card {
          background: white; border-radius: 12px; padding: 40px 24px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07); text-align: center;
        }
        .success-icon  { font-size: 56px; color: #28a745; margin-bottom: 16px; }
        .success-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
        .success-subtitle { font-size: 14px; color: #888; margin-bottom: 28px; }
        .success-details {
          background: #fafafa; border-radius: 10px;
          padding: 4px 16px; margin-bottom: 28px; text-align: left;
        }
        .success-amount { color: #28a745; }
        .ref-code { font-family: monospace; color: #555; font-size: 13px; }
        .success-actions { display: flex; flex-direction: column; gap: 12px; }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px 16px 90px; }
          .network-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
