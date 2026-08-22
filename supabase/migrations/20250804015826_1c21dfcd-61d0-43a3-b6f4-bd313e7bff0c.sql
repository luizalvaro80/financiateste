-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bills
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create policies for bills
CREATE POLICY "Users can view their own bills" 
ON public.bills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills" 
ON public.bills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" 
ON public.bills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills" 
ON public.bills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create financial_accounts table
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on financial_accounts
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_accounts
CREATE POLICY "Users can view their own accounts" 
ON public.financial_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.financial_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.financial_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.financial_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  account TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.financial_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.financial_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.financial_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create financial_goals table
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  target_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on financial_goals
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_goals
CREATE POLICY "Users can view their own goals" 
ON public.financial_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.financial_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.financial_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.financial_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create notification_logs table
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bill_id UUID REFERENCES public.bills ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_logs
CREATE POLICY "Users can view their own notifications" 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON public.financial_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, whatsapp_number)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'whatsapp_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();