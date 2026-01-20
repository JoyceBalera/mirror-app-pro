-- Add UPDATE policy for users to update their own session's AI analyses
CREATE POLICY "Users can update analyses for their own sessions"
ON public.ai_analyses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM test_sessions
    WHERE test_sessions.id = ai_analyses.session_id
    AND test_sessions.user_id = auth.uid()
  )
);

-- Add UPDATE policy for admins to update any AI analysis
CREATE POLICY "Admins can update all ai analyses"
ON public.ai_analyses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));