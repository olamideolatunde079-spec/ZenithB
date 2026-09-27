// layout.tsx — Root Layout
// ============================================================
// The outermost wrapper for every page in the app.
// {children} is replaced by the current page's content.
//
// Performance improvements applied here:
//   1. preconnect to cdnjs — opens the CDN connection early
//      so Font Awesome loads faster.
//   2. Font Awesome is loaded with crossOrigin for CORS.
// ============================================================

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zenith Bank",
  description: "Zenith Bank — Simple Banking Clone",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        {/*
          preconnect tells the browser to open a connection to the CDN
          BEFORE it even starts downloading the stylesheet.
          This reduces the Font Awesome load time significantly.
        */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

        {/*
          Font Awesome 6.5.2 — icon library from CDN.
          Usage: <i className="fa-solid fa-house"></i>
          Browse: https://fontawesome.com/icons
        */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
