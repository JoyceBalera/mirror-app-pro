-- Permitir admins a inserir análises para qualquer sessão
CREATE POLICY "Admins can insert analyses for any session"
ON public.ai_analyses
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);