## Correção de permissões SECURITY DEFINER que bloquearam acesso administrativo

### Problema
A revogação anterior de `EXECUTE` em funções `SECURITY DEFINER` foi aplicada de forma abrangente demais: removeu a permissão também do papel `authenticated` nas funções `has_role(uuid, app_role)` e `get_user_role(uuid)`. O frontend consulta essas funções para determinar se a usuária é administradora. Sem `EXECUTE`, o painel `/admin` falha silenciosamente e redireciona para `/app`, e a lista de usuárias não carrega.

### Solução
Aplicar uma migration que:
1. Revoga `EXECUTE` de `PUBLIC`, `anon` e `authenticated` em todas as funções afetadas (estado limpo).
2. Concede `EXECUTE` para `authenticated` apenas em:
   - `public.has_role(uuid, public.app_role)`
   - `public.get_user_role(uuid)`
3. Concede `EXECUTE` para `service_role` em todas as funções, conforme já existia.
4. Não concede `EXECUTE` para `authenticated` em funções de trigger internas (`handle_new_user`, `handle_updated_at`), mantendo o acesso restrito a `service_role`.

Nenhum dado de usuária será modificado. Apenas permissões de função serão ajustadas.

### Testes pós-aplicação
1. Fazer login com a sessão injetada e acessar `/admin`.
2. Verificar que o painel carrega sem redirecionamento para `/app`.
3. Verificar que o botão "Painel Admin" aparece no header.
4. Verificar que a lista de usuárias é carregada normalmente.
5. Confirmar, via consulta ao catálogo Postgres, que `anon` e `PUBLIC` continuam sem `EXECUTE` em `has_role` e `get_user_role`.

### Migration SQL
```sql
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM service_role;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM service_role;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM service_role;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;
```