// components/PageHeader.jsx — Red page header bar
// ============================================================
// The reference screenshots show every page has a red header
// at the top with a white title.
//
// Some pages also have a back arrow on the left
// (e.g. Customize Page).
//
// Usage:
//   // Simple header — just a title
//   <PageHeader title="Product & Services" />
//
//   // Header with a back arrow
//   <PageHeader title="Customize Page" showBack />
//
//   // Header with a custom back action (default is router.back())
//   <PageHeader title="Transfer" showBack onBack={() => router.push("/dashboard")} />
// ============================================================
"use client";

import { useRouter } from "next/navigation";

export default function PageHeader({ title, showBack = false, onBack }) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();          // use custom handler if provided
    } else {
      router.back();     // otherwise go to the previous page
    }
  }

  return (
    <header
      className={`page-header ${showBack ? "page-header-has-back" : ""}`}
      style={{ paddingLeft: showBack ? 8 : 16 }}
    >
      {/* Back arrow — only shown when showBack is true */}
      {showBack && (
        <button
          className="page-header-back"
          onClick={handleBack}
          aria-label="Go back"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
      )}

      <h1 className="page-header-title">{title}</h1>
    </header>
  );
}
