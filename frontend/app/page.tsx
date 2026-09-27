// page.tsx — Home page ( "/" )
// ============================================================
// When someone visits the root URL "/", we send them
// straight to the login page.
//
// redirect() is a Next.js server-side function.
// It tells the browser: "go to this URL instead."
// ============================================================

import { redirect } from "next/navigation";

export default function Home() {
  // Redirect the root page to /login
  redirect("/login");
}
