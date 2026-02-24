

# Botao de Reset do Big Five para Admin

## Objetivo
Adicionar um botao na interface do admin que permite resetar o teste Big Five de um usuario, apagando todos os dados associados e permitindo que o usuario refaca o teste do zero.

## O que sera feito

### 1. Nova Edge Function: `reset-big-five`
Uma funcao backend que executa o reset completo com privilegios de admin (service role). A funcao:
- Verifica se o solicitante e admin
- Recebe o `user_id` como parametro
- Deleta registros nas tabelas (na ordem correta para respeitar dependencias):
  1. `ai_analyses` (vinculadas via session_id)
  2. `integrated_analyses` (vinculadas via big_five_session_id)
  3. `test_results` (vinculadas via session_id)
  4. `test_answers` (vinculadas via session_id)
  5. `test_sessions` (do usuario)
- Limpa o campo `big_five_completed_at` na tabela `user_test_access`
- Retorna confirmacao do reset

### 2. Botao de Reset no UserCard
Adicionar um botao "Resetar Big Five" no componente `UserCard.tsx`, visivel apenas quando o usuario ja completou o teste. O botao:
- Abre um dialogo de confirmacao (AlertDialog) para evitar cliques acidentais
- Mostra o nome do usuario no dialogo para clareza
- Chama a edge function `reset-big-five`
- Exibe toast de sucesso/erro
- Atualiza a lista de usuarios apos o reset

### 3. Atualizacoes no AdminDashboard
- Passar callback `onResetBigFive` para o `UserCard`
- Recarregar a lista de usuarios apos reset bem-sucedido

## Detalhes Tecnicos

### Edge Function (`supabase/functions/reset-big-five/index.ts`)
```text
- Verifica auth token e role admin via service role client
- Busca todas test_sessions do usuario
- Deleta em cascata: ai_analyses -> integrated_analyses -> test_results -> test_answers -> test_sessions
- UPDATE user_test_access SET big_five_completed_at = NULL WHERE user_id = $1
- Retorna { success: true, deleted_sessions: number }
```

### Componente UserCard
- Novo prop `onResetBigFive?: (userId: string, userName: string) => void`
- Botao com icone `RotateCcw` do lucide-react
- AlertDialog integrado pedindo confirmacao antes de executar

### Fluxo do Usuario (Admin)
1. Admin ve a lista de usuarios
2. Clica no botao "Resetar" no card do usuario
3. Dialogo de confirmacao aparece: "Tem certeza que deseja resetar o teste Big Five de [nome]?"
4. Admin confirma
5. Edge function executa o reset
6. Toast de sucesso aparece
7. Card do usuario atualiza mostrando "Mapa de Personalidade Pendente"

