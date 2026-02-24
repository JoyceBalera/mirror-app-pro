-- Allow admin to delete ai_analyses
CREATE POLICY "Admins can delete ai analyses"
ON public.ai_analyses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to delete test_results
CREATE POLICY "Admins can delete test results"
ON public.test_results
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to delete test_answers
CREATE POLICY "Admins can delete test answers"
ON public.test_answers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to delete integrated_analyses
CREATE POLICY "Admins can delete integrated analyses"
ON public.integrated_analyses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admin to delete test_sessions
CREATE POLICY "Admins can delete all test sessions"
ON public.test_sessions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));