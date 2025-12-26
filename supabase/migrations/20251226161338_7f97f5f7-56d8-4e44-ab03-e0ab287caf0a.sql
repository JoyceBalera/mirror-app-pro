-- Criar tabela user_test_access para controlar permissões de testes
CREATE TABLE public.user_test_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    has_big_five BOOLEAN NOT NULL DEFAULT false,
    has_desenho_humano BOOLEAN NOT NULL DEFAULT false,
    big_five_completed_at TIMESTAMP WITH TIME ZONE,
    desenho_humano_completed_at TIMESTAMP WITH TIME ZONE,
    integrated_report_available BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_test_access ENABLE ROW LEVEL SECURITY;

-- Policies para user_test_access
CREATE POLICY "Users can view their own access" 
ON public.user_test_access 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all access" 
ON public.user_test_access 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert access" 
ON public.user_test_access 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update access" 
ON public.user_test_access 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete access" 
ON public.user_test_access 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_user_test_access_updated_at
BEFORE UPDATE ON public.user_test_access
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Criar tabela human_design_sessions para sessões do teste Desenho Humano
CREATE TABLE public.human_design_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.human_design_sessions ENABLE ROW LEVEL SECURITY;

-- Policies para human_design_sessions
CREATE POLICY "Users can view their own HD sessions" 
ON public.human_design_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own HD sessions" 
ON public.human_design_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HD sessions" 
ON public.human_design_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HD sessions" 
ON public.human_design_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all HD sessions" 
ON public.human_design_sessions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all HD sessions" 
ON public.human_design_sessions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));