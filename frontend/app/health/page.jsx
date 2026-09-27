// health/page.jsx — Health Check Page ( "/health" )
// ============================================================
// This page is only for Phase 1 testing.
// It shows whether:
//   1. The Next.js frontend is running  ✓
//   2. The FastAPI backend is reachable ✓ or ✗
//
// Once Phase 1 is confirmed working, you can ignore this page.
// ============================================================

// 'use client' is required here because we use:
//   - useState (to store the result of the health check)
//   - useEffect (to run the health check when the page loads)
"use client";

import { useState, useEffect } from "react";

export default function HealthPage() {
  // backendStatus stores what came back from our FastAPI backend.
  // It starts as null (we haven't checked yet).
  const [backendStatus, setBackendStatus] = useState(null);

  // loading tracks whether we are currently waiting for the backend.
  const [loading, setLoading] = useState(true);

  // error stores any error message if the request fails.
  const [error, setError] = useState(null);

  // useEffect runs this function once, when the page first loads.
  // It's like writing code that runs "on page load".
  useEffect(() => {
    checkBackend();
  }, []); // The empty [] means "run once on mount, don't repeat"

  // This function calls our FastAPI backend's /api/health endpoint
  async function checkBackend() {
    try {
      setLoading(true);

      // Get the backend URL from our environment variable.
      // NEXT_PUBLIC_ prefix makes it available in the browser.
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Make a request to the backend
      const response = await fetch(`${apiUrl}/api/health`);

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      // Convert the response to a JavaScript object
      const data = await response.json();

      setBackendStatus(data);
      setError(null);
    } catch (err) {
      // If the fetch fails, the backend is probably not running
      setError(err.message);
      setBackendStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px 16px", maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
        Phase 1 — Health Check
      </h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>
        This page confirms your frontend and backend are both running.
      </p>

      {/* Frontend status — if you can see this, the frontend is working */}
      <div className="check-item">
        <span className="check-icon success">✓</span>
        <div>
          <strong>Next.js Frontend</strong>
          <p>Running on http://localhost:3000</p>
        </div>
      </div>

      {/* Backend status — shows the result from FastAPI */}
      <div className="check-item">
        {loading ? (
          <>
            <span className="check-icon loading">⏳</span>
            <div>
              <strong>FastAPI Backend</strong>
              <p>Checking...</p>
            </div>
          </>
        ) : error ? (
          <>
            <span className="check-icon fail">✗</span>
            <div>
              <strong>FastAPI Backend</strong>
              <p style={{ color: "#dc3545" }}>
                Not reachable. Make sure it is running.<br />
                <small>Error: {error}</small>
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="check-icon success">✓</span>
            <div>
              <strong>FastAPI Backend</strong>
              <p style={{ color: "#28a745" }}>{backendStatus?.message}</p>
            </div>
          </>
        )}
      </div>

      {/* Button to check again without refreshing the page */}
      <button
        onClick={checkBackend}
        disabled={loading}
        style={{
          marginTop: "24px",
          padding: "10px 20px",
          backgroundColor: "#c8102e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          fontSize: "15px",
        }}
      >
        {loading ? "Checking..." : "Re-check"}
      </button>

      {/* Inline styles for the check items */}
      <style>{`
        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .check-item p {
          font-size: 14px;
          color: #555;
          margin-top: 2px;
        }
        .check-icon {
          font-size: 20px;
          min-width: 28px;
          text-align: center;
          margin-top: 2px;
        }
        .check-icon.success { color: #28a745; }
        .check-icon.fail    { color: #dc3545; }
        .check-icon.loading { color: #888; }
      `}</style>
    </div>
  );
}
