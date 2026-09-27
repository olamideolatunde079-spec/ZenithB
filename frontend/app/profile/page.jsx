// profile/page.jsx — Profile Page ( "/profile" )
// ============================================================
// Shows the logged-in user's personal and account information.
//
// Displays:
//   - Avatar with initials
//   - Full name, email, phone number
//   - Account number, account type, balance
//   - Member since date
//   - Logout button
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const router = useRouter();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Fetch profile data from our backend
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (!res.ok) throw new Error("Could not load profile.");

      const data = await res.json();
      setProfile(data.profile);
      setAccount(data.account);

    } catch (err) {
      setError("Unable to load profile. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    // signOut() clears the Supabase session from the browser
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Build initials from the full name — e.g. "Adebayo Olamide" → "AO"
  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency", currency: "NGN", minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatMemberDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-screen">
            <i className="fa-solid fa-circle-notch fa-spin"></i> Loading profile...
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

          <h1 className="page-title">Profile</h1>

          {error && (
            <div className="error-box">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          {/* ---- Avatar + name ---- */}
          <div className="profile-hero">
            <div className="avatar">
              {getInitials(profile?.full_name)}
            </div>
            <div className="hero-info">
              <h2 className="hero-name">{profile?.full_name || "—"}</h2>
              <p className="hero-email">{profile?.email || "—"}</p>
            </div>
          </div>

          {/* ---- Personal Information ---- */}
          <div className="section-card">
            <h3 className="section-heading">
              <i className="fa-solid fa-circle-user"></i> Personal Information
            </h3>

            <div className="info-row">
              <span className="info-label">
                <i className="fa-solid fa-user"></i> Full Name
              </span>
              <span className="info-value">{profile?.full_name || "—"}</span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <i className="fa-solid fa-envelope"></i> Email
              </span>
              <span className="info-value">{profile?.email || "—"}</span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <i className="fa-solid fa-mobile-screen"></i> Phone
              </span>
              <span className="info-value">{profile?.phone || "—"}</span>
            </div>

            <div className="info-row" style={{ borderBottom: "none" }}>
              <span className="info-label">
                <i className="fa-solid fa-calendar"></i> Member Since
              </span>
              <span className="info-value">{formatMemberDate(profile?.created_at)}</span>
            </div>
          </div>

          {/* ---- Account Information ---- */}
          <div className="section-card">
            <h3 className="section-heading">
              <i className="fa-solid fa-building-columns"></i> Account Information
            </h3>

            <div className="info-row">
              <span className="info-label">
                <i className="fa-solid fa-credit-card"></i> Account Number
              </span>
              <span className="info-value account-number">
                {account?.account_number || "—"}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">
                <i className="fa-solid fa-tag"></i> Account Type
              </span>
              <span className="info-value">{account?.account_type || "—"}</span>
            </div>

            <div className="info-row" style={{ borderBottom: "none" }}>
              <span className="info-label">
                <i className="fa-solid fa-wallet"></i> Balance
              </span>
              <span className="info-value balance-value">
                {account?.balance !== undefined ? formatCurrency(account.balance) : "—"}
              </span>
            </div>
          </div>

          {/* ---- App Information ---- */}
          <div className="section-card">
            <h3 className="section-heading">
              <i className="fa-solid fa-circle-info"></i> App Information
            </h3>

            <div className="info-row">
              <span className="info-label">
                <i className="fa-solid fa-code-branch"></i> Version
              </span>
              <span className="info-value">1.0.0 (Educational Demo)</span>
            </div>

            <div className="info-row" style={{ borderBottom: "none" }}>
              <span className="info-label">
                <i className="fa-solid fa-shield-halved"></i> Security
              </span>
              <span className="info-value demo-badge">Demo Mode</span>
            </div>
          </div>

          {/* ---- Logout button ---- */}
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>

          <p className="logout-note">
            You will be returned to the login screen.
          </p>

        </div>
      </main>

      <style>{`
        .app-layout   { display: flex; min-height: 100vh; background-color: #f5f5f5; }
        .main-content { margin-left: 220px; flex: 1; padding: 32px 24px 80px; }
        .page-inner   { max-width: 580px; }

        .page-title {
          font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px;
        }

        .loading-screen { padding: 60px 20px; text-align: center; color: #888; font-size: 15px; }

        .error-box {
          background: #fff5f5; color: #c8102e;
          border: 1px solid #ffcccc; border-radius: 8px;
          padding: 12px 16px; margin-bottom: 20px; font-size: 14px;
        }
        .error-box i { margin-right: 6px; }

        /* ---- Avatar / hero block ---- */
        .profile-hero {
          display: flex;
          align-items: center;
          gap: 20px;
          background: linear-gradient(135deg, #c8102e 0%, #8b0a1e 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          color: white;
        }

        /* The circle with the user's initials */
        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: 3px solid rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          letter-spacing: 1px;
        }

        .hero-info { min-width: 0; }

        .hero-name {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
          /* Truncate if name is too long */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-email {
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ---- Info cards ---- */
        .section-card {
          background: white;
          border-radius: 12px;
          padding: 20px 20px 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          margin-bottom: 16px;
        }

        .section-heading {
          font-size: 13px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .section-heading i { margin-right: 7px; color: #c8102e; }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;
          gap: 16px;
        }

        .info-label {
          font-size: 13px;
          color: #888;
          flex-shrink: 0;
        }
        .info-label i { margin-right: 7px; width: 14px; text-align: center; }

        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          text-align: right;
        }

        /* Account number in monospace so digits line up */
        .account-number {
          font-family: monospace;
          font-size: 15px;
          letter-spacing: 1px;
          color: #333;
        }

        /* Balance in green */
        .balance-value {
          color: #28a745;
          font-size: 15px;
          font-weight: 700;
        }

        /* Demo mode badge */
        .demo-badge {
          background: #fff8e1;
          color: #f59e0b;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 10px;
        }

        /* ---- Logout button ---- */
        .logout-btn {
          width: 100%;
          padding: 14px;
          background: white;
          color: #c8102e;
          border: 2px solid #c8102e;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: #c8102e;
          color: white;
        }

        .logout-note {
          text-align: center;
          font-size: 12px;
          color: #bbb;
          margin-top: 10px;
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; padding: 20px 16px 90px; }
          .profile-hero  { padding: 20px; gap: 16px; }
          .hero-name     { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
