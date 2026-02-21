

# Correcao: Dados de Canais e Variaveis Avancadas enviados incorretamente para a IA

## Problema Identificado

O BodyGraph visual esta correto, mas a analise de IA diz que "nao ha canais completos" mesmo quando existem canais definidos (63-4, 43-23, 57-20, 20-34, 57-34). O problema esta em como os dados sao preparados antes de serem enviados para a IA.

### Causa Raiz 1 - Canais

O registro da Jessica Borges armazena canais no formato antigo:
```text
[{name: "Poder", gates: [34, 57]}, {name: "Lógica", gates: [63, 4]}, ...]
```

Mas a funcao `buildUserPrompt` no edge function filtra assim:
```text
data.channels?.filter((ch) => ch.isComplete)
```

Como os registros antigos NAO possuem o campo `isComplete`, o filtro retorna array vazio e a IA recebe "Nenhum canal completo".

### Causa Raiz 2 - Variaveis Avancadas

Quando a analise e gerada pelo painel admin (`UserDetails.tsx`), os dados sao enviados com o campo `variables`, mas o edge function le `data.advancedVariables`. Alem disso, o admin nao calcula as variaveis avancadas a partir das ativacoes — envia `hdResult.variables` que pode ser `undefined`.

Na pagina do usuario (`DesenhoHumanoResults.tsx`), as variaveis avancadas SAO calculadas corretamente via `extractAdvancedVariables`.

## Plano de Correcao

### 1. Corrigir `buildUserPrompt` no edge function para lidar com ambos os formatos de canais

Na funcao `buildUserPrompt` em `supabase/functions/analyze-human-design/index.ts` (linha ~709):

**Logica atual:**
```text
const channels = data.channels?.filter((ch) => ch.isComplete)
    .map((ch) => `${ch.id}: ${ch.name}`)
    .join('\n  - ') || labels.noCompleteChannels;
```

**Nova logica:**
- Se o canal tem `isComplete === true`, incluir (formato novo com todos os 36 canais).
- Se o canal NAO tem campo `isComplete` (formato antigo), significa que ele ja foi incluido PORQUE e completo — entao incluir diretamente.
- Usar `ch.gates?.join('-')` como fallback para `ch.id` quando `id` nao existe.

### 2. Corrigir `handleGenerateHDAnalysis` no admin (`UserDetails.tsx`)

Atualizar a chamada do admin para:
- Enviar `resultId` (necessario para o edge function salvar no banco).
- Calcular `advancedVariables` usando `extractAdvancedVariables` a partir de `personality_activations` e `design_activations`.
- Enviar `humanDesignData` no mesmo formato que a pagina do usuario envia, incluindo `definedCenters`, `openCenters`, `activatedGates`, `userName`, etc.
- Remover a insercao manual em `human_design_analyses` (o edge function ja faz isso via upsert).

### 3. Adicionar fallback no edge function para calcular canais a partir de gates

Como camada extra de seguranca, se `data.channels` estiver vazio ou ausente, derivar canais completos a partir de `data.activatedGates` usando a lista conhecida de 36 canais do Human Design. Isso garante que mesmo dados incompletos no banco nao resultem em analises erradas.

## Arquivos Afetados

1. `supabase/functions/analyze-human-design/index.ts` — corrigir `buildUserPrompt` para lidar com ambos formatos de canais e adicionar fallback por gates ativados.
2. `src/pages/UserDetails.tsx` — corrigir `handleGenerateHDAnalysis` para enviar dados no formato correto, incluindo variaveis avancadas calculadas.

