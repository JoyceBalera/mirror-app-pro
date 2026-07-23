
-- Restrict permissive "true" INSERT policy on edge_function_logs to service_role only
DROP POLICY IF EXISTS "Service role can insert logs" ON public.edge_function_logs;
CREATE POLICY "Service role can insert logs"
ON public.edge_function_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Revoke EXECUTE from anon and authenticated on SECURITY DEFINER functions.
-- These functions are triggers or invoked internally by RLS/service role and
-- should not be callable directly via the Data API.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, PUBLIC;
