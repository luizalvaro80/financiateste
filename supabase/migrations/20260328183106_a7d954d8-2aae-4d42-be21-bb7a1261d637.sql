REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;