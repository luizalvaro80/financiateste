-- Create monthly_balances table
CREATE TABLE IF NOT EXISTS public.monthly_balances (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_balances_user_id ON public.monthly_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_balances_year_month ON public.monthly_balances(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_balances_user_year_month ON public.monthly_balances(user_id, year, month);

-- Enable RLS
ALTER TABLE public.monthly_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own monthly balances" ON public.monthly_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly balances" ON public.monthly_balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly balances" ON public.monthly_balances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly balances" ON public.monthly_balances
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_monthly_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_monthly_balances_updated_at
    BEFORE UPDATE ON public.monthly_balances
    FOR EACH ROW EXECUTE FUNCTION update_monthly_balances_updated_at();