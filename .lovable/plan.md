
# Tabela de Logs de Erro para Edge Functions

## Objetivo
Criar uma tabela `edge_function_logs` no banco de dados para registrar permanentemente todos os erros que ocorrem nas edge functions. Atualizar todas as 6 edge functions para gravar erros nessa tabela. Criar uma pagina admin em `/admin/logs` para visualizar o historico de erros.

## 1. Nova tabela: `edge_function_logs`

Estrutura:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador unico |
| function_name | text | Nome da edge function (ex: analyze-personality) |
| error_message | text | Mensagem de erro |
| error_details | jsonb | Detalhes extras (stack trace, request body parcial, status code) |
| user_id | uuid (nullable) | ID do usuario que disparou a chamada (se autenticado) |
| created_at | timestamptz | Momento do erro |

RLS:
- SELECT somente para admins (`has_role(auth.uid(), 'admin')`)
- INSERT sem restricao (para as edge functions usando service_role_key)
- Sem UPDATE/DELETE para usuarios comuns

## 2. Atualizacao das Edge Functions

Todas as 6 funcoes serao atualizadas com uma funcao helper `logError()` que grava na tabela usando o `service_role_key`. O registro acontece em TODOS os blocos `catch` e retornos de erro (401, 403, 429, 402, 500).

Funcoes afetadas:
- `analyze-personality` - bloco catch principal + erros de API (429, 402)
- `analyze-human-design` - bloco catch principal + erros de API
- `analyze-integrated` - bloco catch principal + erros de API (429, 402)
- `recalculate-results` - bloco catch principal
- `create-user` - bloco catch principal
- `edit-user` - bloco catch principal

Padrao do helper (adicionado em cada function):

```text
async function logError(supabase, functionName, errorMessage, errorDetails, userId) {
  try {
    await supabase.from('edge_function_logs').insert({
      function_name: functionName,
      error_message: errorMessage,
      error_details: errorDetails,
      user_id: userId
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
}
```

O helper usa try/catch interno para nunca impedir o retorno da response original ao usuario.

## 3. Nova pagina admin: `/admin/logs`

Interface com:
- Tabela listando os logs mais recentes (ultimos 100)
- Filtros por: nome da funcao (dropdown), periodo (date range)
- Coluna com timestamp, funcao, mensagem de erro, usuario (se disponivel)
- Botao para expandir detalhes (jsonb) de cada erro
- Botao para limpar logs antigos (delete por periodo)

## 4. Alteracoes em arquivos

| Arquivo | Acao |
|---------|------|
| Migration SQL | Criar tabela `edge_function_logs` + RLS policies |
| `supabase/functions/analyze-personality/index.ts` | Adicionar logError helper + chamadas nos blocos de erro |
| `supabase/functions/analyze-human-design/index.ts` | Adicionar logError helper + chamadas nos blocos de erro |
| `supabase/functions/analyze-integrated/index.ts` | Adicionar logError helper + chamadas nos blocos de erro |
| `supabase/functions/recalculate-results/index.ts` | Adicionar logError helper + chamadas nos blocos de erro |
| `supabase/functions/create-user/index.ts` | Adicionar logError helper + chamadas nos blocos de erro |
| `supabase/functions/edit-user/index.ts` | Adicionar logError helper + chamadas nos blocos de erro |
| `src/pages/admin/Logs.tsx` | Criar pagina de visualizacao de logs |
| `src/App.tsx` | Adicionar rota `/admin/logs` |
| `src/components/layout/AdminLayout.tsx` | Adicionar item "Logs" no menu |

## Detalhes tecnicos

- A tabela usa INSERT com `service_role_key` para garantir que erros sejam registrados mesmo sem autenticacao valida do usuario
- Os erros 401/403 tambem serao logados (userId sera null nesses casos)
- O campo `error_details` armazena contexto como: status code da API, session_id envolvido, etc. - sem dados sensiveis como tokens
- Dados sensiveis (tokens, senhas) NUNCA serao gravados nos logs
