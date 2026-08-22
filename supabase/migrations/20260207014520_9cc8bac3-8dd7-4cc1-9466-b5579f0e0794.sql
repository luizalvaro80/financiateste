-- ===========================================
-- TABELA 1: financial_accounts (Contas Financeiras)
-- ===========================================
CREATE TABLE public.financial_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    credit_limit DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_financial_accounts_user_id ON public.financial_accounts(user_id);

-- Enable RLS
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own accounts" ON public.financial_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" ON public.financial_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON public.financial_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON public.financial_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TABELA 2: financial_transactions (Transações)
-- ===========================================
CREATE TABLE public.financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    subcategory TEXT,
    date DATE NOT NULL,
    account TEXT NOT NULL,
    payment_method TEXT DEFAULT 'other',
    is_recurring BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_financial_transactions_user_id ON public.financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(date);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX idx_financial_transactions_user_date ON public.financial_transactions(user_id, date);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions" ON public.financial_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.financial_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.financial_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.financial_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TABELA 3: financial_goals (Metas Financeiras)
-- ===========================================
CREATE TABLE public.financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    category TEXT DEFAULT 'general',
    type TEXT DEFAULT 'savings' CHECK (type IN ('savings', 'expense_limit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_financial_goals_user_id ON public.financial_goals(user_id);

-- Enable RLS
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goals" ON public.financial_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON public.financial_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.financial_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.financial_goals
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TABELA 4: bills (Contas a Pagar)
-- ===========================================
CREATE TABLE public.bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bills_user_id ON public.bills(user_id);
CREATE INDEX idx_bills_due_date ON public.bills(due_date);
CREATE INDEX idx_bills_is_paid ON public.bills(is_paid);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bills" ON public.bills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills" ON public.bills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" ON public.bills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills" ON public.bills
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TABELA 5: monthly_balances (Fechamento Mensal)
-- ===========================================
CREATE TABLE public.monthly_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    opening_balance DECIMAL(15, 2) DEFAULT 0.00,
    total_income DECIMAL(15, 2) DEFAULT 0.00,
    total_expenses DECIMAL(15, 2) DEFAULT 0.00,
    closing_balance DECIMAL(15, 2) DEFAULT 0.00,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- Indexes
CREATE INDEX idx_monthly_balances_user_id ON public.monthly_balances(user_id);
CREATE INDEX idx_monthly_balances_year_month ON public.monthly_balances(year, month);
CREATE INDEX idx_monthly_balances_user_year_month ON public.monthly_balances(user_id, year, month);

-- Enable RLS
ALTER TABLE public.monthly_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own monthly balances" ON public.monthly_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly balances" ON public.monthly_balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly balances" ON public.monthly_balances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly balances" ON public.monthly_balances
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TABELA 6: goal_movements (Histórico de Movimentações das Metas)
-- ===========================================
CREATE TABLE public.goal_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('contribution', 'withdrawal', 'edit')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    balance_after DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goal_movements_goal_id ON public.goal_movements(goal_id);
CREATE INDEX idx_goal_movements_user_id ON public.goal_movements(user_id);
CREATE INDEX idx_goal_movements_created_at ON public.goal_movements(created_at DESC);

-- Enable RLS
ALTER TABLE public.goal_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goal movements" ON public.goal_movements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal movements" ON public.goal_movements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal movements" ON public.goal_movements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal movements" ON public.goal_movements
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabela
CREATE TRIGGER trigger_update_financial_accounts_updated_at
    BEFORE UPDATE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_financial_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_financial_goals_updated_at
    BEFORE UPDATE ON public.financial_goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_monthly_balances_updated_at
    BEFORE UPDATE ON public.monthly_balances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_goal_movements_updated_at
    BEFORE UPDATE ON public.goal_movements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();