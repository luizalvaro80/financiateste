-- Fix RLS policies: change role from public to authenticated on all 6 financial tables

-- bills
DROP POLICY IF EXISTS "Users can view their own bills" ON bills;
DROP POLICY IF EXISTS "Users can insert their own bills" ON bills;
DROP POLICY IF EXISTS "Users can update their own bills" ON bills;
DROP POLICY IF EXISTS "Users can delete their own bills" ON bills;
CREATE POLICY "Users can view their own bills" ON bills FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bills" ON bills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bills" ON bills FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bills" ON bills FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- financial_accounts
DROP POLICY IF EXISTS "Users can view their own accounts" ON financial_accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON financial_accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON financial_accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON financial_accounts;
CREATE POLICY "Users can view their own accounts" ON financial_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own accounts" ON financial_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON financial_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON financial_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- financial_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON financial_transactions;
CREATE POLICY "Users can view their own transactions" ON financial_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON financial_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON financial_transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON financial_transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- financial_goals
DROP POLICY IF EXISTS "Users can view their own goals" ON financial_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON financial_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON financial_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON financial_goals;
CREATE POLICY "Users can view their own goals" ON financial_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON financial_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON financial_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON financial_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- goal_movements
DROP POLICY IF EXISTS "Users can view their own goal movements" ON goal_movements;
DROP POLICY IF EXISTS "Users can insert their own goal movements" ON goal_movements;
DROP POLICY IF EXISTS "Users can update their own goal movements" ON goal_movements;
DROP POLICY IF EXISTS "Users can delete their own goal movements" ON goal_movements;
CREATE POLICY "Users can view their own goal movements" ON goal_movements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goal movements" ON goal_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal movements" ON goal_movements FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal movements" ON goal_movements FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- monthly_balances
DROP POLICY IF EXISTS "Users can view their own monthly balances" ON monthly_balances;
DROP POLICY IF EXISTS "Users can insert their own monthly balances" ON monthly_balances;
DROP POLICY IF EXISTS "Users can update their own monthly balances" ON monthly_balances;
DROP POLICY IF EXISTS "Users can delete their own monthly balances" ON monthly_balances;
CREATE POLICY "Users can view their own monthly balances" ON monthly_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own monthly balances" ON monthly_balances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own monthly balances" ON monthly_balances FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own monthly balances" ON monthly_balances FOR DELETE TO authenticated USING (auth.uid() = user_id);