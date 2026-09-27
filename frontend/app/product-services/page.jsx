// app/product-services/page.jsx — Product & Services (full page version)
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import ServiceCard from "@/components/ServiceCard";

// Same services as the More page grid
const SERVICES = [
  { icon:"fa-solid fa-building-columns",     label:"Open Additional Account", href:"/open-account" },
  { icon:"fa-solid fa-hand-holding-dollar",  label:"Request Loan",            href:"/request-loan" },
  { icon:"fa-solid fa-money-check",          label:"Cheques",                 href:"/cheques" },
  { icon:"fa-solid fa-file-invoice",         label:"Bank Draft Request",      href:"/bank-draft" },
  { icon:"fa-solid fa-file-lines",           label:"My Bank Statement",       href:"/bank-statement" },
  { icon:"fa-solid fa-passport",             label:"Dubai Visa",              href:"/dubai-visa" },
  { icon:"fa-solid fa-sliders",              label:"Manage Transfer Limits",  href:"/manage-transfer-limits" },
];

export default function ProductServicesPage() {
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
        <PageHeader title="Product & Services" showBack />
        <div className="service-grid">
          {SERVICES.map((s) => (
            <ServiceCard key={s.href} icon={s.icon} label={s.label} href={s.href} />
          ))}
        </div>
      </main>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
