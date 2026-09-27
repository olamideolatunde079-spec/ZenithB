-- ============================================================
-- supabase_setup.sql
-- Run this entire file in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql/new
--
-- What this file does:
--   1. Creates the 4 tables (profiles, accounts, transactions, beneficiaries)
--   2. Enables Row Level Security (RLS) on each table
--   3. Adds policies so a user can ONLY see their own rows
--   4. Seeds demo data for demo@zenithbank.com
-- ============================================================


-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: enable it, then add a policy.
-- "auth.uid()" is a Supabase function that returns the ID of
-- the currently logged-in user. The policy says:
--   "You can only read/write rows where id = your user ID."
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
-- 2. ACCOUNTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  balance        NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  account_type   TEXT NOT NULL DEFAULT 'Current Account',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own account"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own account"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own account"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT NOT NULL DEFAULT '',
  amount      NUMERIC(15, 2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
  reference   TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 4. BENEFICIARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficiaries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT '',
  bank_name      TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own beneficiaries"
  ON beneficiaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own beneficiaries"
  ON beneficiaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own beneficiaries"
  ON beneficiaries FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- 5. SEED DEMO DATA
-- ============================================================
-- NOTE: The seed runs as a superuser (you, in the SQL editor),
-- so it bypasses RLS. This is fine — RLS only applies to
-- requests from the browser or API.
-- ============================================================

DO $$
DECLARE
  demo_user_id  UUID;
  demo_acct_id  UUID;
BEGIN

  -- Look up the demo user by email
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'demo@zenithbank.com'
  LIMIT 1;

  IF demo_user_id IS NOT NULL THEN

    -- Profile
    INSERT INTO profiles (id, full_name, email, phone)
    VALUES (
      demo_user_id,
      'Adebayo Olamide',
      'demo@zenithbank.com',
      '08012345678'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Account
    INSERT INTO accounts (id, user_id, account_number, balance, account_type)
    VALUES (
      gen_random_uuid(),
      demo_user_id,
      '2012345678',
      250000.00,
      'Current Account'
    )
    ON CONFLICT (account_number) DO NOTHING;

    -- Get the account ID
    SELECT id INTO demo_acct_id
    FROM accounts
    WHERE user_id = demo_user_id
    LIMIT 1;

    -- 6 demo transactions
    INSERT INTO transactions
      (user_id, account_id, type, description, amount, status, reference, created_at)
    VALUES
      (demo_user_id, demo_acct_id, 'credit', 'Salary - September 2026',      350000.00, 'success', 'TXN-SAL-001', NOW() - INTERVAL '2 days'),
      (demo_user_id, demo_acct_id, 'debit',  'Transfer to Chukwu Emmanuel',   50000.00, 'success', 'TXN-TRF-001', NOW() - INTERVAL '3 days'),
      (demo_user_id, demo_acct_id, 'debit',  'IKEDC Electricity Bill',         8500.00, 'success', 'TXN-BIL-001', NOW() - INTERVAL '5 days'),
      (demo_user_id, demo_acct_id, 'debit',  'MTN Airtime Recharge',            2000.00, 'success', 'TXN-AIR-001', NOW() - INTERVAL '6 days'),
      (demo_user_id, demo_acct_id, 'credit', 'Transfer from Ngozi Adeyemi',   25000.00, 'success', 'TXN-TRF-002', NOW() - INTERVAL '8 days'),
      (demo_user_id, demo_acct_id, 'debit',  'DSTV Subscription',              7200.00, 'success', 'TXN-BIL-002', NOW() - INTERVAL '10 days')
    ON CONFLICT DO NOTHING;

    -- 2 demo beneficiaries
    INSERT INTO beneficiaries (user_id, name, bank_name, account_number)
    VALUES
      (demo_user_id, 'Chukwu Emmanuel', 'Access Bank', '0987654321'),
      (demo_user_id, 'Ngozi Adeyemi',   'GTBank',      '1122334455')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Done — demo data inserted for user: %', demo_user_id;

  ELSE
    RAISE NOTICE 'Demo user not found. Make sure demo@zenithbank.com exists in Supabase Auth first.';
  END IF;

END $$;
