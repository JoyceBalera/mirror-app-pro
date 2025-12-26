-- Tabela para armazenar resultados de Human Design
CREATE TABLE public.human_design_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.human_design_sessions(id) ON DELETE SET NULL,
  
  -- Dados de nascimento
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_location TEXT NOT NULL,
  birth_lat DECIMAL(10, 7),
  birth_lon DECIMAL(10, 7),
  design_date TIMESTAMPTZ,
  
  -- Resultado principal
  energy_type TEXT NOT NULL,
  strategy TEXT,
  authority TEXT,
  profile TEXT,
  definition TEXT,
  incarnation_cross TEXT,
  
  -- Ativações detalhadas (JSON)
  personality_activations JSONB NOT NULL DEFAULT '[]'::jsonb,
  design_activations JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Estrutura do mapa
  centers JSONB NOT NULL DEFAULT '{}'::jsonb,
  channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  activated_gates INTEGER[] NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscas por usuário
CREATE INDEX idx_hd_results_user_id ON public.human_design_results(user_id);

-- Habilitar RLS
ALTER TABLE public.human_design_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own HD results"
  ON public.human_design_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own HD results"
  ON public.human_design_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own HD results"
  ON public.human_design_results
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all HD results"
  ON public.human_design_results
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all HD results"
  ON public.human_design_results
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_hd_results_updated_at
  BEFORE UPDATE ON public.human_design_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();