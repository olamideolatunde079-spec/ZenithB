// lib/supabase.js — Supabase Client
// ============================================================
// This file creates a single Supabase client that we reuse
// across the whole frontend app.
//
// Think of it like a database connection object —
// you create it once and import it wherever you need it.
//
// createClient() takes two things:
//   1. Your Supabase project URL
//   2. Your anon/publishable key (safe to use in the browser)
//
// NEVER put the secret key here — that stays in the backend.
// ============================================================

import { createClient } from "@supabase/supabase-js";

// Read the values from our .env.local file.
// Next.js makes NEXT_PUBLIC_ variables available in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create and export the Supabase client.
// We export it so any file can do: import supabase from "@/lib/supabase"
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
