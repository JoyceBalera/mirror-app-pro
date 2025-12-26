-- Criar o trigger que estava faltando para criar perfis automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Inserir perfis para usuários existentes que não têm perfil
INSERT INTO public.profiles (id, full_name, email)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Inserir roles para usuários existentes que não têm role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'user'::public.app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);