-- Restore execute permission (needed for RLS policy evaluation)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Replace function with caller-check version
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent probing other users' roles unless caller is admin
  IF _user_id <> auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
END;
$$;