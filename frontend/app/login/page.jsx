// login/page.jsx — Login Page ( "/login" )
// ============================================================
// This is the main login page for Zenith Bank.
//
// What it does:
//   1. Shows an email + password form
//   2. On submit, calls Supabase Auth to sign the user in
//   3. If login succeeds → redirect to /dashboard
//   4. If login fails → show an error message
//
// 'use client' is required because we use:
//   - useState (to track form inputs, loading, errors)
//   - useRouter (to navigate to dashboard after login)
//   - Event handlers (onClick, onChange, onSubmit)
// ============================================================
"use client";

import { useState }   from "react";
import { useRouter }  from "next/navigation";
import supabase       from "@/lib/supabase";
import ZenithLogo     from "@/components/ZenithLogo";

export default function LoginPage() {
  // These state variables "remember" the form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // showPassword controls whether the password is visible or hidden
  const [showPassword, setShowPassword] = useState(false);

  // loading is true while we are waiting for Supabase to respond
  const [loading, setLoading] = useState(false);

  // error stores any error message to show to the user
  const [error, setError] = useState("");

  // useRouter lets us navigate to another page from JavaScript code
  const router = useRouter();

  // This function runs when the user clicks the Login button
  async function handleLogin(e) {
    // Prevent the form from doing a full page refresh (default browser behaviour)
    e.preventDefault();

    // Clear any previous error and show the loading state
    setError("");
    setLoading(true);

    try {
      // Ask Supabase to sign in with the email and password the user typed.
      // signInWithPassword() returns an object with { data, error }.
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        // Supabase returned an error (e.g. wrong password, user not found)
        setError("Incorrect email or password. Please try again.");
        return;
      }

      // Login was successful — send the user to the dashboard.
      // router.push() navigates without a full page reload.
      router.push("/dashboard");

    } catch (err) {
      // This catches unexpected errors (e.g. no internet connection)
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      // Always turn off the loading spinner, whether we succeeded or failed
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Bank brand / logo at the top */}
        <div className="login-brand">
          <div className="login-logo">
            <ZenithLogo size={56} />
          </div>
          <h1 className="login-title">Zenith Bank</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Show error message if login failed */}
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {/* The login form */}
        <form onSubmit={handleLogin}>

          {/* Email field */}
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password field with show/hide toggle */}
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {/* Toggle button to show or hide the password */}
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Login button — disabled while loading */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="login-demo-note">
          Demo account: use the credentials you registered in Supabase.
        </p>

      </div>

      {/* Page-scoped styles */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          padding: 16px;
        }

        .login-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.10);
          padding: 40px 32px;
          width: 100%;
          max-width: 400px;
        }

        .login-brand {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-logo {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          background: white;
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }

        .login-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #666;
        }

        .login-error {
          background-color: #fff5f5;
          color: #c8102e;
          border: 1px solid #ffcccc;
          border-radius: 6px;
          padding: 12px 14px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .form-field {
          margin-bottom: 18px;
        }

        .form-field label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #444;
          margin-bottom: 6px;
        }

        .form-field input {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #ddd;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.2s;
          color: #1a1a1a;
        }

        .form-field input:focus {
          border-color: #c8102e;
        }

        /* Wrapper so the Show/Hide button sits inside the input */
        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 70px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #c8102e;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px;
        }

        .login-btn {
          width: 100%;
          padding: 13px;
          background-color: #c8102e;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: background-color 0.2s;
        }

        .login-btn:hover {
          background-color: #a00d25;
        }

        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-demo-note {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 20px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
