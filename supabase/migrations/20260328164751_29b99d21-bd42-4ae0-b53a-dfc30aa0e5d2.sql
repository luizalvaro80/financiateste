
-- Create profile for existing user
INSERT INTO public.user_profiles (user_id, name, email, status, approved, subscription_due_date)
VALUES (
  '805e6268-1dad-4796-ac4f-db61d01b09ea',
  'Luiz Alvaro',
  'luizalvaro80@gmail.com',
  'ATIVO',
  true,
  (now() + interval '365 days')
) ON CONFLICT (user_id) DO NOTHING;

-- Make existing user admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('805e6268-1dad-4796-ac4f-db61d01b09ea', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
