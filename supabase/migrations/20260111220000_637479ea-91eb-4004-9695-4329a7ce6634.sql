-- Create integrated analyses table
CREATE TABLE public.integrated_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  big_five_session_id UUID NOT NULL REFERENCES public.test_sessions(id),
  human_design_result_id UUID NOT NULL REFERENCES public.human_design_results(id),
  analysis_text TEXT NOT NULL,
  model_used TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrated_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own integrated analyses"
  ON public.integrated_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrated analyses"
  ON public.integrated_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all
CREATE POLICY "Admins can view all integrated analyses"
  ON public.integrated_analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_integrated_analyses_user_id ON public.integrated_analyses(user_id);
CREATE INDEX idx_integrated_analyses_big_five_session ON public.integrated_analyses(big_five_session_id);
CREATE INDEX idx_integrated_analyses_hd_result ON public.integrated_analyses(human_design_result_id);