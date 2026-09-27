// app/lifestyle/page.jsx — LifeStyle
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import ServiceCard from "@/components/ServiceCard";

const LIFESTYLE_SERVICES = [
  { icon:"fa-solid fa-plane",          label:"Flight Booking",     href:"#" },
  { icon:"fa-solid fa-hotel",          label:"Hotel Booking",      href:"#" },
  { icon:"fa-solid fa-film",           label:"Cinema Tickets",     href:"#" },
  { icon:"fa-solid fa-ticket",         label:"Event Tickets",      href:"#" },
  { icon:"fa-solid fa-shield-halved",  label:"Insurance",          href:"#" },
  { icon:"fa-solid fa-graduation-cap", label:"School Fees",        href:"#" },
  { icon:"fa-solid fa-gift",           label:"Gift Cards",         href:"#" },
  { icon:"fa-solid fa-gamepad",        label:"Gaming",             href:"#" },
  { icon:"fa-solid fa-heart-pulse",    label:"Health & Wellness",  href:"#" },
];

export default function LifestylePage() {
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

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="LifeStyle" showBack />
        <p style={{padding:"12px 16px 0",fontSize:13,color:"#888"}}>
          Explore services to enhance your lifestyle. Demo mode — no real bookings.
        </p>
        <div className="service-grid">
          {LIFESTYLE_SERVICES.map((s) => (
            <ServiceCard key={s.label} icon={s.icon} label={s.label} href={s.href} />
          ))}
        </div>
      </main>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
