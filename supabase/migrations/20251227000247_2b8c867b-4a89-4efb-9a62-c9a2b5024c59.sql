-- Create table to store Human Design AI analyses
CREATE TABLE public.human_design_analyses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID NOT NULL REFERENCES public.human_design_results(id) ON DELETE CASCADE,
    analysis_text TEXT NOT NULL,
    model_used TEXT DEFAULT 'google/gemini-2.5-flash',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to ensure one analysis per result
CREATE UNIQUE INDEX idx_human_design_analyses_result_id ON public.human_design_analyses(result_id);

-- Enable Row Level Security
ALTER TABLE public.human_design_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own analyses (based on the result's user_id)
CREATE POLICY "Users can view their own HD analyses"
ON public.human_design_analyses
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.human_design_results hdr
        WHERE hdr.id = human_design_analyses.result_id
        AND hdr.user_id = auth.uid()
    )
);

-- Policy: Users can insert analyses for their own results
CREATE POLICY "Users can create their own HD analyses"
ON public.human_design_analyses
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.human_design_results hdr
        WHERE hdr.id = human_design_analyses.result_id
        AND hdr.user_id = auth.uid()
    )
);

-- Policy: Admins can view all analyses
CREATE POLICY "Admins can view all HD analyses"
ON public.human_design_analyses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can create analyses for any result
CREATE POLICY "Admins can create HD analyses"
ON public.human_design_analyses
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));