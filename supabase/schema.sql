-- ============================================================
-- FINANCEFLOW — Supabase Database Schema
-- Chạy toàn bộ script này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Bảng giao dịch (Thu nhập & Chi tiêu)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng nợ
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor_name TEXT NOT NULL,
  total_amount BIGINT NOT NULL CHECK (total_amount > 0),
  paid_amount BIGINT DEFAULT 0,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Đang nợ' CHECK (status IN ('Đang nợ', 'Đã trả xong')),
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng lịch sử trả nợ
CREATE TABLE IF NOT EXISTS debt_payments (
  id TEXT PRIMARY KEY,
  debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  date TIMESTAMPTZ NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — Mỗi user chỉ thấy data của mình
-- ============================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "transactions: user can select own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions: user can insert own" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions: user can delete own" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Debts policies
CREATE POLICY "debts: user can select own" ON debts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "debts: user can insert own" ON debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "debts: user can update own" ON debts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "debts: user can delete own" ON debts
  FOR DELETE USING (auth.uid() = user_id);

-- Debt payments policies (access via parent debt ownership)
CREATE POLICY "payments: user can select own" ON debt_payments
  FOR SELECT USING (
    debt_id IN (SELECT id FROM debts WHERE user_id = auth.uid())
  );
CREATE POLICY "payments: user can insert own" ON debt_payments
  FOR INSERT WITH CHECK (
    debt_id IN (SELECT id FROM debts WHERE user_id = auth.uid())
  );
CREATE POLICY "payments: user can delete own" ON debt_payments
  FOR DELETE USING (
    debt_id IN (SELECT id FROM debts WHERE user_id = auth.uid())
  );
