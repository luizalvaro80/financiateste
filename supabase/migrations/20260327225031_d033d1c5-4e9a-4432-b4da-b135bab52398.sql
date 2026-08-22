
CREATE TABLE public.pwa_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  platform text NOT NULL DEFAULT 'unknown',
  installed_at timestamp with time zone NOT NULL DEFAULT now(),
  last_opened_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.pwa_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installations" ON public.pwa_installations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own installations" ON public.pwa_installations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own installations" ON public.pwa_installations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE UNIQUE INDEX idx_pwa_installations_device ON public.pwa_installations(device_id);
