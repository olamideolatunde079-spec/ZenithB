// app/locate-us/page.jsx — Locate Us
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

const BRANCHES = [
  { id:1, name:"Victoria Island Branch",   address:"1686 Sanusi Fafunwa St, Victoria Island, Lagos",    phone:"0700 368 3636", hours:"Mon–Fri 8am–4pm" },
  { id:2, name:"Ikeja Branch",             address:"Plot 84, Allen Avenue, Ikeja, Lagos",                phone:"0700 368 3636", hours:"Mon–Fri 8am–4pm" },
  { id:3, name:"Lekki Phase 1 Branch",     address:"Plot 2, Admiralty Way, Lekki Phase 1, Lagos",       phone:"0700 368 3636", hours:"Mon–Fri 8am–4pm" },
  { id:4, name:"Abuja FCT Branch",         address:"14 Adetokunbo Ademola Crescent, Wuse II, Abuja",    phone:"0700 368 3636", hours:"Mon–Fri 8am–4pm" },
  { id:5, name:"Port Harcourt Branch",     address:"5 Rumuola Road, Port Harcourt, Rivers State",       phone:"0700 368 3636", hours:"Mon–Fri 8am–4pm" },
];

export default function LocateUsPage() {
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const filtered = BRANCHES.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingLayout />;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <PageHeader title="Locate Us" showBack />
        <div className="locate-page">
          <div className="search-bar-wrap">
            <i className="fa-solid fa-magnifying-glass search-bar-icon"></i>
            <input className="search-bar-input" placeholder="Search branches…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filtered.map((b) => (
            <div key={b.id} className="branch-card">
              <div className="branch-icon"><i className="fa-solid fa-building-columns"></i></div>
              <div className="branch-info">
                <p className="branch-name">{b.name}</p>
                <p className="branch-addr"><i className="fa-solid fa-location-dot"></i> {b.address}</p>
                <p className="branch-meta"><i className="fa-solid fa-phone"></i> {b.phone} &nbsp;·&nbsp; <i className="fa-solid fa-clock"></i> {b.hours}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style>{`
        .locate-page { padding:12px 16px; max-width:540px; }
        .branch-card { display:flex; gap:14px; background:#fff; border-radius:10px; padding:14px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.07); }
        .branch-icon { width:44px; height:44px; border-radius:10px; background:#fff0f0; color:#c8102e; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .branch-name { font-size:14px; font-weight:700; color:#1a1a1a; margin-bottom:4px; }
        .branch-addr { font-size:12px; color:#555; margin-bottom:3px; line-height:1.4; display:flex; align-items:flex-start; gap:5px; }
        .branch-addr i { margin-top:2px; color:#c8102e; flex-shrink:0; }
        .branch-meta { font-size:11px; color:#888; display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
        .branch-meta i { color:#c8102e; }
      `}</style>
    </div>
  );
}
function LoadingLayout() {
  return (<div className="app-layout"><Navbar /><main className="main-content"><div className="loading-screen"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div></main></div>);
}
