// app/more/page.jsx — More Page ( "/more" )
// ============================================================
// This page closely follows the first reference screenshot:
//
//   Red header: "Product & Services"
//   3-column service grid (7 services)
//   "Recent Activities" section heading
//   Search bar
//   Activity list (demo data)
//   Bottom navigation with "More" active
//
// The ServiceCard component handles each grid tile.
// The Navbar component handles the bottom/sidebar navigation.
// ============================================================
"use client";

import { useState, useEffect } from "react";
import { useRouter }          from "next/navigation";
import supabase               from "@/lib/supabase";
import Navbar                 from "@/components/Navbar";
import ServiceCard            from "@/components/ServiceCard";

// The 7 services shown in the reference screenshot — first 6 fill
// two rows of 3, the 7th starts a third row on its own.
const SERVICES = [
  { icon: "fa-solid fa-building-columns", label: "Open Additional Account", href: "/open-account" },
  { icon: "fa-solid fa-hand-holding-dollar", label: "Request Loan",          href: "/request-loan" },
  { icon: "fa-solid fa-money-check",         label: "Cheques",               href: "/cheques" },
  { icon: "fa-solid fa-file-invoice",        label: "Bank Draft Request",     href: "/bank-draft" },
  { icon: "fa-solid fa-file-lines",          label: "My Bank Statement",      href: "/bank-statement" },
  { icon: "fa-solid fa-passport",            label: "Dubai Visa",             href: "/dubai-visa" },
  { icon: "fa-solid fa-sliders",             label: "Manage Transfer Limits", href: "/manage-transfer-limits" },
];

// Demo recent activities — fictional data
const DEMO_ACTIVITIES = [
  { id: 1, name: "Modify Address",    date: "August 19, 2021", icon: "fa-solid fa-location-dot" },
  { id: 2, name: "Statement Request", date: "August 19, 2021", icon: "fa-solid fa-file-lines" },
];

export default function MorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading,     setLoading]     = useState(true);
  const router = useRouter();

  // Check the user is logged in when the page loads
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  // Filter activities by the search query as the user types
  const filteredActivities = DEMO_ACTIVITIES.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* ---- Red page header ---- */}
        <header className="more-header">
          <span className="more-header-title">Product &amp; Services</span>
        </header>

        {/* ---- 3-column service grid ---- */}
        {/* .service-grid and .service-card styles are in globals.css */}
        <div className="service-grid">
          {SERVICES.map((s) => (
            <ServiceCard
              key={s.href}
              icon={s.icon}
              label={s.label}
              href={s.href}
            />
          ))}
        </div>

        {/* ---- Recent Activities ---- */}
        <p className="section-title">Recent Activities</p>

        {/* Search bar */}
        <div className="search-bar-wrap">
          <i className="fa-solid fa-magnifying-glass search-bar-icon"></i>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search recent activities"
          />
        </div>

        {/* Activity list */}
        <div className="activity-list">
          {filteredActivities.length === 0 ? (
            <p className="no-results">No results found.</p>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <i className={activity.icon}></i>
                </div>
                <div className="activity-info">
                  <p className="activity-name">{activity.name}</p>
                  <p className="activity-date">{activity.date}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      <style>{`
        /* ---- Red header — matches reference "Product & Services" bar ---- */
        .more-header {
          background: #c8102e;
          padding: 0 16px;
          height: 52px;
          display: flex;
          align-items: center;
        }

        .more-header-title {
          color: #fff;
          font-size: 17px;
          font-weight: 700;
        }

        /* ---- Activity list wrapper ---- */
        .activity-list {
          background: #fff;
          border-top: 1px solid #e4e4e4;
          border-bottom: 1px solid #e4e4e4;
          margin: 0;
        }

        .no-results {
          padding: 20px 16px;
          color: #888;
          font-size: 13px;
          text-align: center;
        }

        /* ---- Mobile tweaks ---- */
        @media (max-width: 430px) {
          .more-header-title { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
