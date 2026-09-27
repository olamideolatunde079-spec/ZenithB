// next.config.ts — Next.js configuration
// ============================================================
// Performance fix:
//
//   The .next folder is now a symlink → /tmp/zenith-bank-next
//   This moves Turbopack's build cache off the slow Desktop
//   filesystem onto the fast /tmp partition (RAM-backed on Linux).
//
//   The Turbopack filesystem cache is explicitly enabled here
//   so compiled pages are reused between server restarts.
//   Without this, every page recompiles from scratch on restart.
// ============================================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep compiled pages cached between dev server restarts.
    // This is the main fix for slow page loads after restarting.
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
