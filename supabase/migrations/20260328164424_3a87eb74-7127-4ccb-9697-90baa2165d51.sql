
-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp_number text,
  status text NOT NULL DEFAULT 'PENDENTE',
  approved boolean NOT NULL DEFAULT false,
  subscription_due_date timestamp with time zone,
  last_payment_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create user_roles table (following security best practices)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get user status
CREATE OR REPLACE FUNCTION public.get_user_status(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.user_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS policies for user_profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can update their own profile (limited)
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow insert for new profiles (trigger will handle this)
CREATE POLICY "Allow profile creation" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.user_profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, email, whatsapp_number, status, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', ''),
    'PENDENTE',
    false
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
