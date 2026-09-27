// transfers/page.jsx — Transfer Page ( "/transfers" )
// ============================================================
// Simulates a bank transfer. Flow:
//
//   Step 1: "form"    — select beneficiary OR enter new details,
//                       enter amount and description
//   Step 2: "confirm" — review the transfer before sending
//   Step 3: "success" — shows confirmation with reference number
//
// We use a single page with a "step" state variable to control
// which screen is visible. No real money moves — this is a
// simulation that writes a record to the database.
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Nigerian banks for the dropdown
const BANKS = [
  "Access Bank", "Citibank", "Ecobank", "Fidelity Bank", "First Bank",
  "First City Monument Bank", "Globus Bank", "GTBank", "Heritage Bank",
  "Keystone Bank", "Kuda Bank", "Opay", "Palmpay", "Polaris Bank",
  "Stanbic IBTC", "Standard Chartered", "Sterling Bank", "Union Bank",
  "United Bank for Africa", "Unity Bank", "Wema Bank", "Zenith Bank",
];

export default function TransfersPage() {
  // step controls which screen we are on: "form" | "confirm" | "success"
  const [step, setStep] = useState("form");

  // Saved beneficiaries fetched from the backend
  const [beneficiaries, setBeneficiaries] = useState([]);

  // Form fields
  const [beneficiaryName,    setBeneficiaryName]    = useState("");
  const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
  const [bankName,           setBankName]           = useState("");
  const [amount,             setAmount]             = useState("");
  const [description,        setDescription]        = useState("");

  // Result from a successful transfer
  const [result, setResult] = useState(null);

  const [loading,  setLoading]  = useState(false);
  const [pageLoad, setPageLoad] = useState(true);
  const [error,    setError]    = useState("");

  const router = useRouter();

  useEffect(() => { loadPage(); }, []);

  async function loadPage() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Load saved beneficiaries so the user can pick one quickly
      const res = await fetch(`${API_URL}/api/beneficiaries`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBeneficiaries(data.beneficiaries || []);
      }
    } catch (err) {
      // Beneficiaries failing is not critical — the form still works
    } finally {
      setPageLoad(false);
    }
  }

  // When the user picks a saved beneficiary from the list,
  // fill the form fields automatically
  function selectBeneficiary(ben) {
    setBeneficiaryName(ben.name);
    setBeneficiaryAccount(ben.account_number);
    setBankName(ben.bank_name);
  }

  // Step 1 → Step 2: validate the form then show the confirm screen
  function handleReview(e) {
    e.preventDefault();
    setError("");

    if (!beneficiaryName.trim())    { setError("Please enter the recipient's name."); return; }
    if (!beneficiaryAccount.trim()) { setError("Please enter the account number."); return; }
    if (beneficiaryAccount.length < 10) { setError("Account number must be at least 10 digits."); return; }
    if (!bankName)                  { setError("Please select a bank."); return; }
    if (!amount || Number(amount) <= 0) { setError("Please enter a valid amount."); return; }

    // All good — move to the confirm step
    setStep("confirm");
  }

  // Step 2 → Step 3: send the transfer to the backend
  async function handleConfirm() {
    try {
      setError("");
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // POST to our FastAPI backend
      const response = await fetch(`${API_URL}/api/transfers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          beneficiary_name:    beneficiaryName,
          beneficiary_account: beneficiaryAccount,
          bank_name:           bankName,
          amount:              Number(amount),
          description:         description || `Transfer to ${beneficiaryName}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the error from the backend (e.g. "Insufficient funds")
        setError(data.detail || "Transfer failed. Please try again.");
        setStep("form");
        return;
      }

      // Transfer succeeded — save the result and show the success screen
      setResult(data);
      setStep("success");

    } catch (err) {
      setError("Unable to complete transfer. Check your connection and try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  // Reset everything so the user can make another transfer
  function handleNewTransfer() {
    setBeneficiaryName("");
    setBeneficiaryAccount("");
    setBankName("");
    setAmount("");
    setDescription("");
    setResult(null);
    setError("");
    setStep("form");
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency", currency: "NGN", minimumFractionDigits: 2,
    }).format(amount);
  }

  if (pageLoad) {
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

          {/* ---- Back button (not shown on success screen) ---- */}
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
                {step === "form" ? "Transfer Money" : "Confirm Transfer"}
              </h1>
            </div>
          )}

          {error && (
            <div className="error-box">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          {/* ==================================================
              STEP 1 — FORM
              ================================================== */}
          {step === "form" && (
            <div className="card">

              {/* Saved beneficiaries — quick select */}
              {beneficiaries.length > 0 && (
                <div className="beneficiaries-section">
                  <p className="field-label">
                    <i className="fa-solid fa-users"></i> Saved Beneficiaries
                  </p>
                  <div className="beneficiary-list">
                    {beneficiaries.map((ben) => (
                      <button
                        key={ben.id}
                        className="beneficiary-chip"
                        onClick={() => selectBeneficiary(ben)}
                        type="button"
                      >
                        <div className="ben-avatar">
                          {ben.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ben-info">
                          <span className="ben-name">{ben.name}</span>
                          <span className="ben-bank">{ben.bank_name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="divider">
                    <span>or enter new details</span>
                  </div>
                </div>
              )}

              {/* Transfer form */}
              <form onSubmit={handleReview}>

                <div className="form-field">
                  <label htmlFor="ben-name">
                    <i className="fa-solid fa-user"></i> Recipient Name
                  </label>
                  <input
                    id="ben-name"
                    type="text"
                    placeholder="e.g. Chukwu Emmanuel"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="ben-account">
                    <i className="fa-solid fa-credit-card"></i> Account Number
                  </label>
                  <input
                    id="ben-account"
                    type="text"
                    placeholder="10-digit account number"
                    value={beneficiaryAccount}
                    onChange={(e) => setBeneficiaryAccount(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="bank-name">
                    <i className="fa-solid fa-building-columns"></i> Bank
                  </label>
                  <select
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  >
                    <option value="">Select bank...</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="amount">
                    <i className="fa-solid fa-naira-sign"></i> Amount (₦)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="description">
                    <i className="fa-solid fa-pen"></i> Description{" "}
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    id="description"
                    type="text"
                    placeholder="e.g. Rent payment"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary">
                  <i className="fa-solid fa-eye"></i> Review Transfer
                </button>

              </form>
            </div>
          )}

          {/* ==================================================
              STEP 2 — CONFIRM
              ================================================== */}
          {step === "confirm" && (
            <div className="card">

              <div className="confirm-amount-block">
                <p className="confirm-label">You are sending</p>
                <p className="confirm-amount">{formatCurrency(Number(amount))}</p>
              </div>

              {/* Transfer details summary */}
              <div className="confirm-details">
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-user"></i> To
                  </span>
                  <span className="confirm-row-value">{beneficiaryName}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-credit-card"></i> Account
                  </span>
                  <span className="confirm-row-value">{beneficiaryAccount}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-building-columns"></i> Bank
                  </span>
                  <span className="confirm-row-value">{bankName}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">
                    <i className="fa-solid fa-pen"></i> Description
                  </span>
                  <span className="confirm-row-value">
                    {description || `Transfer to ${beneficiaryName}`}
                  </span>
                </div>
              </div>

              <p className="confirm-disclaimer">
                <i className="fa-solid fa-shield-halved"></i>{" "}
                This is a simulated transfer. No real money will be moved.
              </p>

              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading
                  ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</>
                  : <><i className="fa-solid fa-paper-plane"></i> Confirm Transfer</>
                }
              </button>

            </div>
          )}

          {/* ==================================================
              STEP 3 — SUCCESS
              ================================================== */}
          {step === "success" && (
            <div className="success-card">

              <div className="success-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <h2 className="success-title">Transfer Successful!</h2>
              <p className="success-subtitle">Your transfer has been processed.</p>

              <div className="success-details">
                <div className="confirm-row">
                  <span className="confirm-row-label">Amount</span>
                  <span className="confirm-row-value success-amount">
                    {formatCurrency(Number(amount))}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">To</span>
                  <span className="confirm-row-value">{beneficiaryName}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Bank</span>
                  <span className="confirm-row-value">{bankName}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">New Balance</span>
                  <span className="confirm-row-value">
                    {result?.new_balance !== undefined
                      ? formatCurrency(result.new_balance)
                      : "—"}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-row-label">Reference</span>
                  <span className="confirm-row-value ref-code">
                    {result?.reference || "—"}
                  </span>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn-primary" onClick={handleNewTransfer}>
                  <i className="fa-solid fa-plus"></i> New Transfer
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
        .app-layout { display: flex; min-height: 100vh; background-color: #f5f5f5; }
        .main-content { margin-left: 220px; flex: 1; padding: 32px 24px 80px; }
        .page-inner { max-width: 520px; }

        .loading-screen { padding: 60px 20px; text-align: center; color: #888; }

        .page-top {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }
        .back-btn {
          background: white;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #444;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .back-btn:hover { background: #f5f5f5; }

        .error-box {
          background: #fff5f5;
          color: #c8102e;
          border: 1px solid #ffcccc;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .error-box i { margin-right: 6px; }

        /* Card container */
        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }

        /* Beneficiaries */
        .beneficiaries-section { margin-bottom: 8px; }
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          margin-bottom: 10px;
        }
        .field-label i { margin-right: 6px; color: #c8102e; }

        .beneficiary-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .beneficiary-chip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #fafafa;
          border: 1.5px solid #e8e8e8;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
          width: 100%;
        }
        .beneficiary-chip:hover {
          border-color: #c8102e;
          background: #fff5f7;
        }
        .ben-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #c8102e;
          color: white;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ben-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ben-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
        .ben-bank { font-size: 12px; color: #888; }

        /* Divider between saved beneficiaries and form */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          color: #bbb;
          font-size: 12px;
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e8e8e8;
        }

        /* Form fields */
        .form-field { margin-bottom: 18px; }
        .form-field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #555;
          margin-bottom: 6px;
        }
        .form-field label i { margin-right: 6px; color: #c8102e; }
        .optional { font-weight: 400; color: #aaa; }
        .form-field input,
        .form-field select {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          outline: none;
          color: #1a1a1a;
          transition: border-color 0.2s;
          background: white;
        }
        .form-field input:focus,
        .form-field select:focus { border-color: #c8102e; }

        /* Buttons */
        .btn-primary {
          width: 100%;
          padding: 13px;
          background: #c8102e;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover    { background: #a00d25; }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

        .btn-secondary {
          width: 100%;
          padding: 13px;
          background: white;
          color: #c8102e;
          border: 2px solid #c8102e;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: #c8102e; color: white; }

        /* Confirm step */
        .confirm-amount-block {
          text-align: center;
          background: #fff5f7;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .confirm-label { font-size: 13px; color: #888; margin-bottom: 4px; }
        .confirm-amount { font-size: 30px; font-weight: 700; color: #c8102e; }

        .confirm-details { margin-bottom: 20px; }
        .confirm-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 11px 0;
          border-bottom: 1px solid #f5f5f5;
          gap: 16px;
        }
        .confirm-row:last-child { border-bottom: none; }
        .confirm-row-label {
          font-size: 13px;
          color: #888;
          flex-shrink: 0;
        }
        .confirm-row-label i { margin-right: 5px; }
        .confirm-row-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          text-align: right;
        }
        .confirm-disclaimer {
          font-size: 12px;
          color: #aaa;
          text-align: center;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .confirm-disclaimer i { margin-right: 4px; color: #28a745; }

        /* Success step */
        .success-card {
          background: white;
          border-radius: 12px;
          padding: 40px 24px 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          text-align: center;
        }
        .success-icon {
          font-size: 56px;
          color: #28a745;
          margin-bottom: 16px;
        }
        .success-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px;
        }
        .success-subtitle {
          font-size: 14px;
          color: #888;
          margin-bottom: 28px;
        }
        .success-details {
          background: #fafafa;
          border-radius: 10px;
          padding: 4px 16px;
          margin-bottom: 28px;
          text-align: left;
        }
        .success-amount { color: #28a745; font-size: 15px; }
        .ref-code { font-family: monospace; color: #555; font-size: 13px; }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px 16px 90px; }
        }
      `}</style>
    </div>
  );
}
