CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(_user_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create profile with email
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  -- Create 'user' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: ai_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    analysis_text text NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    model_used text DEFAULT 'gemini-2.5-flash'::text
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    full_name text,
    avatar_url text,
    email text
);


--
-- Name: test_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    question_id text NOT NULL,
    score integer NOT NULL,
    answered_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT test_answers_score_check CHECK (((score >= 1) AND (score <= 5)))
);


--
-- Name: test_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    trait_scores jsonb NOT NULL,
    facet_scores jsonb NOT NULL,
    classifications jsonb NOT NULL,
    calculated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: test_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    status text DEFAULT 'in_progress'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT test_sessions_status_check CHECK ((status = ANY (ARRAY['in_progress'::text, 'completed'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_analyses ai_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_analyses
    ADD CONSTRAINT ai_analyses_pkey PRIMARY KEY (id);


--
-- Name: ai_analyses ai_analyses_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_analyses
    ADD CONSTRAINT ai_analyses_session_id_key UNIQUE (session_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: test_answers test_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_pkey PRIMARY KEY (id);


--
-- Name: test_answers test_answers_session_question_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_session_question_unique UNIQUE (session_id, question_id);


--
-- Name: test_results test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_pkey PRIMARY KEY (id);


--
-- Name: test_results test_results_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_session_id_key UNIQUE (session_id);


--
-- Name: test_sessions test_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_ai_analyses_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_analyses_session_id ON public.ai_analyses USING btree (session_id);


--
-- Name: idx_test_answers_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_answers_session_id ON public.test_answers USING btree (session_id);


--
-- Name: idx_test_results_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_results_session_id ON public.test_results USING btree (session_id);


--
-- Name: idx_test_sessions_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_sessions_completed_at ON public.test_sessions USING btree (completed_at DESC);


--
-- Name: idx_test_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_sessions_user_id ON public.test_sessions USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: profiles set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: ai_analyses ai_analyses_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_analyses
    ADD CONSTRAINT ai_analyses_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.test_sessions(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: test_answers test_answers_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_answers
    ADD CONSTRAINT test_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.test_sessions(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.test_sessions(id) ON DELETE CASCADE;


--
-- Name: test_sessions test_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_analyses Admins can insert analyses for any session; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert analyses for any session" ON public.ai_analyses FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: test_sessions Admins can update all test sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all test sessions" ON public.test_sessions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_analyses Admins can view all ai analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all ai analyses" ON public.ai_analyses FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: test_answers Admins can view all test answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all test answers" ON public.test_answers FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: test_results Admins can view all test results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all test results" ON public.test_results FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: test_sessions Admins can view all test sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all test sessions" ON public.test_sessions FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: test_sessions Users can create their own test sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own test sessions" ON public.test_sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: test_sessions Users can delete their own test sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own test sessions" ON public.test_sessions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ai_analyses Users can insert analyses for their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert analyses for their own sessions" ON public.ai_analyses FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = ai_analyses.session_id) AND (test_sessions.user_id = auth.uid())))));


--
-- Name: test_answers Users can insert answers to their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert answers to their own sessions" ON public.test_answers FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = test_answers.session_id) AND (test_sessions.user_id = auth.uid())))));


--
-- Name: test_results Users can insert results for their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert results for their own sessions" ON public.test_results FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = test_results.session_id) AND (test_sessions.user_id = auth.uid())))));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: test_sessions Users can update their own test sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own test sessions" ON public.test_sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ai_analyses Users can view analyses from their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view analyses from their own sessions" ON public.ai_analyses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = ai_analyses.session_id) AND (test_sessions.user_id = auth.uid())))));


--
-- Name: test_answers Users can view answers from their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view answers from their own sessions" ON public.test_answers FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = test_answers.session_id) AND (test_sessions.user_id = auth.uid())))));


--
-- Name: test_results Users can view results from their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view results from their own sessions" ON public.test_results FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = test_results.session_id) AND (test_sessions.user_id = auth.uid())))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: test_sessions Users can view their own test sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own test sessions" ON public.test_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: test_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: test_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

--
-- Name: test_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;