
# Plano: Atualizar o Prompt do Desenho Humano conforme Documento de Referencia

## Problema

O relatorio de Desenho Humano gerado pela IA nao segue a estrutura e nivel de detalhe definidos nos documentos de referencia que voce enviou. As principais diferencas entre o que esta no codigo e o que voce precisa:

1. **Nivel de detalhe insuficiente** -- O prompt atual gera relatorios curtos (3-4 paginas). O modelo de referencia tem 19 paginas com tratamento profundo de cada elemento.
2. **Falta de "Acoes para colocar em pratica"** -- O modelo mostra que cada secao deve ter Significado + Pontos Fortes + Pontos de Atencao + Acoes praticas.
3. **Falta de areas da vida** -- O modelo inclui secoes por area (Intelectual, Socio-afetiva, Profissional, Espiritual, Economica, Saude Fisica, Saude Emocional) para o tipo.
4. **Falta do "Sentido" (Sense)** -- O prompt nao envia o dado de Sentido para a IA, mesmo que ele ja esteja calculado no sistema.
5. **Portoes e Canais individuais** -- O modelo mostra cada portao e canal com descricao individual, enquanto o prompt atual pede para agrupar por temas.
6. **Assinatura e Tema do Nao-Eu** -- O modelo tem secoes dedicadas para esses elementos, ausentes no prompt atual.
7. **Terminologia** -- O documento usa "Desenho Humano", o prompt atual usa "Arquitetura Pessoal".

---

## Mudancas Planejadas

### 1. `supabase/functions/analyze-human-design/index.ts` -- Prompt PT (principal)

Substituir completamente o prompt em portugues para refletir o documento enviado. Principais adicoes:

**Estrutura de secoes ampliada:**
- Ponte com a teoria + visao geral
- Tipo + Estrategia + Autoridade (com subsecoes por area da vida: Intelectual, Socio-afetiva, Profissional, Espiritual, Economica, Saude Fisica, Saude Emocional)
- Assinatura e Tema do Nao-Eu
- Autoridade Interna (secao dedicada com acoes praticas)
- Definicao (secao dedicada com acoes praticas)
- Perfil (secao dedicada com acoes praticas)
- Cruz de Encarnacao (secao dedicada com acoes praticas)
- Centros (com perguntas de mentoria)
- Variaveis avancadas (Digestao, Sentido, Motivacao, Perspectiva, Ambiente)
- Portoes (cada um individualmente com descricao breve)
- Canais (cada um individualmente com descricao)
- Conclusao e encerramento

**Formato de cada elemento:**
- Significado (explicacao aplicada, sem rotulos secos)
- Pontos Fortes
- Pontos de Atencao
- Acoes para colocar em pratica (1-2 acoes concretas)

**Tom e estilo:**
- Mentora experiente conversando com mentorada
- Usar "amada" com moderacao
- Exemplos concretos do dia a dia
- Perguntas de mentoria nos centros ("Voce percebe como, quando... acontece, voce tende a...?")
- Regras de formatacao para PDF

### 2. `supabase/functions/analyze-human-design/index.ts` -- Prompts ES e EN

Atualizar os prompts em espanhol e ingles para manter o mesmo nivel de detalhe e estrutura do PT.

### 3. `supabase/functions/analyze-human-design/index.ts` -- Dados enviados (buildUserPrompt)

- Adicionar campo **Sentido** (Sense) aos dados enviados para a IA
- Adicionar campos **Assinatura** (Signature) e **Tema do Nao-Eu** (Not-Self Theme) se disponiveis nos dados
- Adicionar label localizado para Sentido nas 3 linguas

### 4. `supabase/functions/analyze-human-design/index.ts` -- max_tokens

Aumentar `max_tokens` de 16.000 para 32.000 para comportar o relatorio completo e detalhado (19 paginas no modelo).

### 5. `src/pages/DesenhoHumanoResults.tsx` -- Dados adicionais

Verificar e incluir `signature`, `notSelfTheme` e `sense` no objeto `humanDesignData` enviado ao edge function (se disponiveis no result).

---

## Resumo dos Arquivos

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| `supabase/functions/analyze-human-design/index.ts` | Prompt PT reescrito, ES/EN atualizados, Sense adicionado, max_tokens aumentado |
| `src/pages/DesenhoHumanoResults.tsx` | Adiciona sense/signature/notSelfTheme aos dados enviados |

**Total: 2 arquivos editados, nenhuma migration SQL**

---

## O que NAO muda

- A logica de calculo do Desenho Humano permanece intacta
- O PDF generator (generateHDReport.ts) nao e alterado nesta etapa
- A UI de resultados nao muda
- As demais edge functions (analyze-personality, analyze-integrated) nao sao afetadas
- O banco de dados nao precisa de alteracao
