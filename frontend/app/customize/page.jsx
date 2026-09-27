// app/customize/page.jsx — Customize Page ( "/customize" )
// ============================================================
// Follows the second reference screenshot exactly:
//
//   Red header with back arrow + "Customize Page" title
//   3-column grid of ALL available services (16 items)
//
// Tapping a card navigates to that service page.
// The grid uses the same ServiceCard + service-grid CSS
// as the More page — consistent visual language.
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter }           from "next/navigation";
import supabase                from "@/lib/supabase";
import Navbar                  from "@/components/Navbar";
import PageHeader              from "@/components/PageHeader";
import ServiceCard             from "@/components/ServiceCard";

// All 16 items visible in the reference Customize Page screenshot.
// Icons chosen to visually match the reference illustrations.
const ALL_SERVICES = [
  { icon: "fa-solid fa-house",                  label: "Home",                    href: "/dashboard" },
  { icon: "fa-solid fa-file-invoice-dollar",    label: "Pay Bills",               href: "/bills" },
  { icon: "fa-solid fa-mobile-screen",          label: "Airtime",                 href: "/airtime" },
  { icon: "fa-solid fa-arrows-left-right",      label: "Transfer",                href: "/transfers" },
  { icon: "fa-solid fa-credit-card",            label: "Cards",                   href: "/cards" },
  { icon: "fa-solid fa-location-dot",           label: "Locate Us",               href: "/locate-us" },
  { icon: "fa-solid fa-users",                  label: "Manage Beneficiaries",    href: "/beneficiaries" },
  { icon: "fa-solid fa-dollar-sign",            label: "Forex",                   href: "/forex" },
  { icon: "fa-solid fa-store",                  label: "Product & Services",      href: "/product-services" },
  { icon: "fa-solid fa-chart-line",             label: "Personal Finance Manager",href: "/personal-finance" },
  { icon: "fa-solid fa-umbrella-beach",         label: "LifeStyle",               href: "/lifestyle" },
  { icon: "fa-solid fa-gear",                   label: "Settings",                href: "/settings" },
  { icon: "fa-solid fa-bell",                   label: "Alerts",                  href: "/alerts" },
  { icon: "fa-solid fa-qrcode",                 label: "QR Payments",             href: "/qr-payments" },
  { icon: "fa-solid fa-circle-user",            label: "Profile",                 href: "/profile" },
  { icon: "fa-solid fa-calendar-check",         label: "Upcoming Payments",       href: "/upcoming-payments" },
];

export default function CustomizePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

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

        {/* Red header with back arrow — PageHeader component handles this */}
        <PageHeader title="Customize Page" showBack />

        {/* 3-column service grid — same CSS class as More page */}
        <div className="service-grid">
          {ALL_SERVICES.map((s) => (
            <ServiceCard
              key={s.href}
              icon={s.icon}
              label={s.label}
              href={s.href}
            />
          ))}
        </div>

      </main>
    </div>
  );
}
