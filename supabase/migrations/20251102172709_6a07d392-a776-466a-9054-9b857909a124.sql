-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create test_sessions table
CREATE TABLE public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_test_sessions_user_id ON public.test_sessions(user_id);
CREATE INDEX idx_test_sessions_completed_at ON public.test_sessions(completed_at DESC);

-- Enable RLS on test_sessions
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_sessions
CREATE POLICY "Users can view their own test sessions"
  ON public.test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test sessions"
  ON public.test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test sessions"
  ON public.test_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test sessions"
  ON public.test_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create test_answers table
CREATE TABLE public.test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_test_answers_session_id ON public.test_answers(session_id);

-- Enable RLS on test_answers
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_answers
CREATE POLICY "Users can view answers from their own sessions"
  ON public.test_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = test_answers.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers to their own sessions"
  ON public.test_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = test_answers.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

-- Create test_results table
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  trait_scores JSONB NOT NULL,
  facet_scores JSONB NOT NULL,
  classifications JSONB NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_test_results_session_id ON public.test_results(session_id);

-- Enable RLS on test_results
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_results
CREATE POLICY "Users can view results from their own sessions"
  ON public.test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = test_results.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert results for their own sessions"
  ON public.test_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = test_results.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

-- Create ai_analyses table
CREATE TABLE public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  analysis_text TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  model_used TEXT DEFAULT 'gemini-2.5-flash'
);

CREATE INDEX idx_ai_analyses_session_id ON public.ai_analyses(session_id);

-- Enable RLS on ai_analyses
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_analyses
CREATE POLICY "Users can view analyses from their own sessions"
  ON public.ai_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = ai_analyses.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses for their own sessions"
  ON public.ai_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions
      WHERE test_sessions.id = ai_analyses.session_id
      AND test_sessions.user_id = auth.uid()
    )
  );

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();