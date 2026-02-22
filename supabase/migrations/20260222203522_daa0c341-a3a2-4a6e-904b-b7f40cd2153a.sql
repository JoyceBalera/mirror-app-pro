
-- Create edge_function_logs table
CREATE TABLE public.edge_function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  error_message text NOT NULL,
  error_details jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
ON public.edge_function_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete logs
CREATE POLICY "Admins can delete logs"
ON public.edge_function_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role inserts (no RLS restriction on INSERT for service_role_key usage)
CREATE POLICY "Service role can insert logs"
ON public.edge_function_logs
FOR INSERT
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_edge_function_logs_created_at ON public.edge_function_logs (created_at DESC);
CREATE INDEX idx_edge_function_logs_function_name ON public.edge_function_logs (function_name);
