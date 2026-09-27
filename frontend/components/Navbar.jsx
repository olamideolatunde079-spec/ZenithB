// components/Navbar.jsx — Shared Navigation
// ============================================================
// Two navigation modes in one component:
//
//   DESKTOP  → fixed sidebar on the left (220px wide, dark navy)
//   MOBILE   → fixed bottom bar (5 items, matches reference screenshots)
//
// Bottom nav items match the reference exactly:
//   Home | Pay Bills | Airtime | Transfer | More
//
// The active page link is highlighted in red.
// Icons come from Font Awesome (loaded in layout.tsx).
// ============================================================
"use client";

import Link        from "next/link";
import { usePathname, useRouter } from "next/navigation";
import supabase    from "@/lib/supabase";
import ZenithLogo  from "@/components/ZenithLogo";

// ------------ BOTTOM NAV (mobile) — matches reference screenshots ------------
// The reference shows exactly these 5 items in this order.
const BOTTOM_NAV = [
  { label: "Home",      href: "/dashboard",   icon: "fa-solid fa-house" },
  { label: "Pay Bills", href: "/bills",        icon: "fa-solid fa-file-invoice-dollar" },
  { label: "Airtime",   href: "/airtime",      icon: "fa-solid fa-mobile-screen" },
  { label: "Transfer",  href: "/transfers",    icon: "fa-solid fa-arrows-left-right" },
  { label: "More",      href: "/more",         icon: "fa-solid fa-grip" },
];

// ------------ SIDEBAR (desktop) — full list of all sections ------------
const SIDEBAR_LINKS = [
  { label: "Dashboard",    href: "/dashboard",    icon: "fa-solid fa-house" },
  { label: "Transactions", href: "/transactions", icon: "fa-solid fa-list" },
  { label: "Transfer",     href: "/transfers",    icon: "fa-solid fa-arrows-left-right" },
  { label: "Pay Bills",    href: "/bills",        icon: "fa-solid fa-file-invoice-dollar" },
  { label: "Airtime",      href: "/airtime",      icon: "fa-solid fa-mobile-screen" },
  { label: "Profile",      href: "/profile",      icon: "fa-solid fa-circle-user" },
  { label: "More",         href: "/more",         icon: "fa-solid fa-grip" },
];

export default function Navbar() {
  // usePathname returns the current URL path, e.g. "/dashboard"
  // We use it to highlight whichever link is currently active.
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    // Sign out from Supabase, then redirect to login
    await supabase.auth.signOut();
    router.push("/login");
  }

  // A link is "active" if the current path starts with its href.
  // Using startsWith instead of exact match handles sub-routes.
  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
          Fixed left column, only shown on screens > 768px.
          ===================================================== */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          {/* Real Zenith Bank logo — ZenithLogo.jsx */}
          <div className="sidebar-logo-wrap">
            <ZenithLogo size={36} />
          </div>
          <span className="sidebar-name">Zenith Bank</span>
        </div>

        <ul className="sidebar-links">
          {SIDEBAR_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`sidebar-link ${isActive(link.href) ? "active" : ""}`}
              >
                <i className={`${link.icon}`}></i>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </nav>

      {/* =====================================================
          MOBILE BOTTOM NAV
          Fixed to the bottom, only shown on screens ≤ 768px.
          Exactly 5 items as in the reference screenshots.
          ===================================================== */}
      <nav className="bottom-nav" aria-label="Main navigation">
        {BOTTOM_NAV.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`bottom-nav-item ${isActive(link.href) ? "active" : ""}`}
          >
            <i className={`${link.icon} bnav-icon`}></i>
            <span className="bnav-label">{link.label}</span>
          </Link>
        ))}
      </nav>

      <style>{`
        /* ---- Desktop sidebar ---- */
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          padding: 24px 0 16px;
          position: fixed;
          top: 0; left: 0;
          z-index: 200;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 18px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 10px;
        }

        .sidebar-logo-wrap {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: #fff;
          border-radius: 4px;
          padding: 2px;
        }

        .sidebar-name {
          color: #fff;
          font-size: 15px; font-weight: 700;
        }

        .sidebar-links {
          list-style: none;
          flex: 1;
          padding: 0 10px;
        }

        .sidebar-links li { margin-bottom: 2px; }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 7px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 13px; font-weight: 500;
          transition: background 0.12s, color 0.12s;
        }

        .sidebar-link i { width: 17px; text-align: center; font-size: 14px; }

        .sidebar-link:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }

        .sidebar-link.active {
          background: #c8102e;
          color: #fff;
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 16px 22px 10px;
          border: none; border-top: 1px solid rgba(255,255,255,0.08);
          background: none;
          color: rgba(255,255,255,0.45);
          font-size: 13px; font-weight: 500;
          cursor: pointer; width: 100%;
          transition: color 0.12s;
        }

        .sidebar-logout:hover { color: #ff6b6b; }

        /* ---- Mobile bottom nav ---- */
        /* Hidden by default — shown only on mobile via media query */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          background: #fff;
          border-top: 1px solid #e4e4e4;
          z-index: 200;
          /* Space evenly across the full width */
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          flex: 1;
          height: 100%;
          color: #888;
          text-decoration: none;
          padding: 6px 2px 4px;
          transition: color 0.12s;
        }

        /* Active item turns red — matches reference */
        .bottom-nav-item.active { color: #c8102e; }

        .bnav-icon  { font-size: 19px; line-height: 1; }
        .bnav-label { font-size: 10px; font-weight: 500; line-height: 1; }

        /* ---- Show/hide depending on screen size ---- */
        @media (max-width: 768px) {
          .sidebar     { display: none; }
          .bottom-nav  { display: flex; }
        }
      `}</style>
    </>
  );
}
