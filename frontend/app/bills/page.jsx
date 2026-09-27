// bills/page.jsx — Bills Payment Page ( "/bills" )
// ============================================================
// Simulates paying a utility bill.
//
// Flow:
//   Step 1: "form"    — pick bill type, enter customer/meter
//                       number and amount
//   Step 2: "confirm" — review before submitting
//   Step 3: "success" — shows confirmation
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// The bill categories from the spec
const BILL_TYPES = [
  {
    name: "Electricity",
    icon: "fa-bolt",
    color: "#f59e0b",
    label: "Meter Number",
    placeholder: "e.g. 45012345678",
    providers: ["IKEDC (Ikeja Electric)", "EKEDC (Eko Electric)", "AEDC (Abuja Electric)",
                "PHEDC (Port Harcourt Electric)", "EEDC (Enugu Electric)", "KEDCO (Kano Electric)"],
  },
  {
    name: "Cable TV",
    icon: "fa-tv",
    color: "#8b5cf6",
    label: "Smart Card / IUC Number",
    placeholder: "e.g. 7012345678",
    providers: ["DStv", "GOtv", "StarTimes", "Showmax"],
  },
  {
    name: "Internet",
    icon: "fa-wifi",
    color: "#3b82f6",
    label: "Account / Username",
    placeholder: "e.g. user@isp.com",
    providers: ["Spectranet", "Smile", "Swift Networks", "ipNX", "Tizeti"],
  },
];

export default function BillsPage() {
  const [step,          setStep]          = useState("select"); // "select" | "form" | "confirm" | "success"
  const [billType,      setBillType]      = useState(null);     // the full bill type object
  const [provider,      setProvider]      = useState("");
  const [customerNo,    setCustomerNo]    = useState("");
  const [amount,        setAmount]        = useState("");
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [error,         setError]         = useState("");

  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setPageLoading(false);
    }
    checkAuth();
  }, []);

  // When user picks a bill type, move to the form step
  function selectBillType(bt) {
    setBillType(bt);
    setProvider(bt.providers[0]); // default to first provider
    setStep("form");
  }

  function handleReview(e) {
    e.preventDefault();
    setError("");

    if (!provider)              { setError("Please select a provider."); return; }
    if (!customerNo.trim())     { setError(`Please enter your ${billType.label}.`); return; }
    if (!amount || Number(amount) < 100) { setError("Minimum bill payment is ₦100."); return; }

    setStep("confirm");
  }

  async function handleConfirm() {
    try {
      setError("");
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // POST to our FastAPI /api/bills endpoint
      const response = await fetch(`${API_URL}/api/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bill_type:       `${billType.name} - ${provider}`,
          customer_number: customerNo,
          amount:          Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Payment failed. Please try again.");
        setStep("form");
        return;
      }

      setResult(data);
      setStep("success");

    } catch (err) {
      setError("Unable to complete payment. Check your connection and try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  function handleNewPayment() {
    setBillType(null); setProvider(""); setCustomerNo("");
    setAmount(""); setResult(null); setError(""); setStep("select");
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency", currency: "NGN", minimumFractionDigits: 2,
    }).format(val);
  }

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
              {step === "select" ? (
                <Link href="/dashboard" className="back-btn">
                  <i className="fa-solid fa-arrow-left"></i> Back
                </Link>
              ) : (
                <button className="back-btn"
                  onClick={() => step === "confirm" ? setStep("form") : setStep("select")}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
              )}
              <h1 className="page-title">
                {step === "select"  && "Pay Bills"}
                {step === "form"    && `${billType?.name} Payment`}
                {step === "confirm" && "Confirm Payment"}
              </h1>
            </div>
          )}

          {error && (
            <div className="error-box">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          {/* ---- STEP 1: SELECT BILL TYPE ---- */}
          {step === "select" && (
            <div className="bill-type-grid">
              {BILL_TYPES.map((bt) => (
                <button
                  key={bt.name}
                  className="bill-type-card"
                  onClick={() => selectBillType(bt)}
                >
                  <div className="bill-icon-wrap" style={{ backgroundColor: bt.color + "22" }}>
                    <i className={`fa-solid ${bt.icon}`} style={{ color: bt.color }}></i>
                  </div>
                  <span className="bill-type-name">{bt.name}</span>
                  <p className="bill-type-sub">{bt.providers.length} providers</p>
                  <i className="fa-solid fa-chevron-right bill-chevron"></i>
                </button>
              ))}
            </div>
          )}

          {/* ---- STEP 2: FORM ---- */}
          {step === "form" && billType && (
            <form className="card" onSubmit={handleReview}>

              {/* Bill type header */}
              <div className="bill-header">
                <div className="bill-header-icon" style={{ backgroundColor: billType.color + "22" }}>
                  <i className={`fa-solid ${billType.icon}`} style={{ color: billType.color }}></i>
                </div>
                <div>
                  <p className="bill-header-name">{billType.name}</p>
                  <p className="bill-header-sub">Select provider and enter details</p>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="provider">
                  <i className="fa-solid fa-building"></i> Provider
                </label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  required
                >
                  {billType.providers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="customer-no">
                  <i className="fa-solid fa-id-card"></i> {billType.label}
                </label>
                <input
                  id="customer-no"
                  type="text"
                  placeholder={billType.placeholder}
                  value={customerNo}
                  onChange={(e) => setCustomerNo(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="amount">
                  <i className="fa-solid fa-naira-sign"></i> Amount (₦)
                </label>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min="100"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                <i className="fa-solid fa-eye"></i> Review Payment
              </button>
            </form>
          )}

          {/* ---- STEP 3: CONFIRM ---- */}
          {step === "confirm" && billType && (
            <div className="card">
              <div className="confirm-amount-block"
                style={{ backgroundColor: billType.color + "15" }}>
                <p className="confirm-label">Payment Amount</p>
                <p className="confirm-amount" style={{ color: billType.color }}>
                  {formatCurrency(Number(amount))}
                </p>
              </div>

              <div className="confirm-details">
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className={`fa-solid ${billType.icon}`}></i> Bill Type
                  </span>
                  <span className="confirm-row-value">{billType.name}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-building"></i> Provider
                  </span>
                  <span className="confirm-row-value">{provider}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-id-card"></i> {billType.label}
                  </span>
                  <span className="confirm-row-value">{customerNo}</span>
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
                This is a simulated payment. No real bill will be paid.
              </p>

              <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                  : <><i className="fa-solid fa-check"></i> Confirm Payment</>}
              </button>
            </div>
          )}

          {/* ---- STEP 4: SUCCESS ---- */}
          {step === "success" && billType && (
            <div className="success-card">
              <div className="success-icon" style={{ color: billType.color }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2 className="success-title">Payment Successful!</h2>
              <p className="success-subtitle">{result?.message}</p>

              <div className="success-details">
                <div className="confirm-row">
                  <span className="confirm-row-label">Bill</span>
                  <span className="confirm-row-value">{billType.name}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Provider</span>
                  <span className="confirm-row-value">{provider}</span>
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
                <button className="btn-primary" onClick={handleNewPayment}>
                  <i className="fa-solid fa-plus"></i> Pay Another Bill
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
        .app-layout   { display: flex; min-height: 100vh; background-color: #f5f5f5; }
        .main-content { margin-left: 220px; flex: 1; padding: 32px 24px 80px; }
        .page-inner   { max-width: 520px; }
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

        /* Bill type select grid */
        .bill-type-grid { display: flex; flex-direction: column; gap: 12px; }
        .bill-type-card {
          background: white; border-radius: 12px; padding: 18px 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex; align-items: center; gap: 16px;
          cursor: pointer; border: 2px solid transparent;
          text-align: left; width: 100%; transition: border-color 0.15s, transform 0.15s;
        }
        .bill-type-card:hover { border-color: #c8102e; transform: translateY(-1px); }
        .bill-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .bill-type-name { font-size: 16px; font-weight: 600; color: #1a1a1a; flex: 1; }
        .bill-type-sub  { font-size: 12px; color: #999; margin-top: 2px; }
        .bill-chevron   { font-size: 13px; color: #ccc; margin-left: auto; }

        /* Form card */
        .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }

        .bill-header {
          display: flex; align-items: center; gap: 14px;
          padding-bottom: 20px; margin-bottom: 4px;
          border-bottom: 1px solid #f0f0f0;
        }
        .bill-header-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .bill-header-name { font-size: 16px; font-weight: 700; color: #1a1a1a; }
        .bill-header-sub  { font-size: 12px; color: #888; margin-top: 2px; }

        .form-field { margin-bottom: 18px; }
        .form-field label {
          display: block; font-size: 13px; font-weight: 500;
          color: #555; margin-bottom: 6px;
        }
        .form-field label i { margin-right: 6px; color: #c8102e; }
        .form-field input,
        .form-field select {
          width: 100%; padding: 12px 14px; font-size: 15px;
          border: 1.5px solid #ddd; border-radius: 8px; outline: none;
          color: #1a1a1a; transition: border-color 0.2s; background: white;
        }
        .form-field input:focus,
        .form-field select:focus { border-color: #c8102e; }

        /* Confirm */
        .confirm-amount-block {
          text-align: center; border-radius: 10px; padding: 20px; margin-bottom: 20px;
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
        .success-icon     { font-size: 56px; margin-bottom: 16px; }
        .success-title    { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
        .success-subtitle { font-size: 14px; color: #888; margin-bottom: 28px; }
        .success-details  {
          background: #fafafa; border-radius: 10px;
          padding: 4px 16px; margin-bottom: 28px; text-align: left;
        }
        .success-amount { color: #28a745; }
        .ref-code { font-family: monospace; color: #555; font-size: 13px; }
        .success-actions { display: flex; flex-direction: column; gap: 12px; }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px 16px 90px; }
        }
      `}</style>
    </div>
  );
}
