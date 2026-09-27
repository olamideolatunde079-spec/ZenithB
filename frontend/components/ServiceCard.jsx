// components/ServiceCard.jsx — Single service tile
// ============================================================
// Used in the 3-column service grids on the More page,
// Customize page, and Product & Services page.
//
// Each card shows:
//   - A Font Awesome icon (red)
//   - A short text label below it
//
// The card links to a page when clicked.
//
// Usage:
//   <ServiceCard
//     icon="fa-solid fa-building-columns"
//     label="Open Additional Account"
//     href="/open-account"
//   />
//
// The parent container should use the .service-grid CSS class
// defined in globals.css — that handles the 3-column layout
// and the grid-line borders.
// ============================================================
import Link from "next/link";

export default function ServiceCard({ icon, label, href = "#" }) {
  return (
    <Link href={href} className="service-card">
      {/* Icon container */}
      <div className="service-card-icon">
        <i className={icon}></i>
      </div>

      {/* Label below the icon */}
      <span className="service-card-label">{label}</span>
    </Link>
  );
}
