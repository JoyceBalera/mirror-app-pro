

## Problema Real Identificado

O banco de dados tem **inconsistencia de chaves** entre registros:
- Registros mais antigos usam `"abertura"` como chave
- Registros mais recentes usam `"abertura à experiência"` como chave
- Ambos trait_scores e facet_scores usam a mesma chave dentro de cada registro, entao o match funciona

O problema principal e que o codigo de resultados (`BigFiveResults.tsx`) depende de match exato entre as chaves de `trait_scores` e `facet_scores`, mas **nao normaliza** ao acessar `facet_scores`. Alem disso, o `getFormattedTraitScores` (usado para a IA) tambem acessa `result.facet_scores[key]` sem normalizar.

## Correcoes Necessarias

### 1. Corrigir o salvamento no BigFiveTest.tsx (raiz do problema)

Alterar o `BigFiveTest.tsx` para salvar usando chaves curtas padronizadas (inglês: `openness`, `neuroticism`, etc.) em vez de `result.name.toLowerCase()` que gera chaves longas em portugues. Isso garante consistencia para todos os testes futuros.

**Antes**: `result.name.toLowerCase()` -> `"abertura à experiência"`
**Depois**: usar a chave original do `calculateScore` (ex: `"openness"`)

### 2. Tornar o BigFiveResults.tsx robusto para dados existentes

Usar `normalizeTraitKey` ao acessar `facet_scores` para que funcione com qualquer formato de chave ja salvo no banco:

- Linha 368: `result.facet_scores[trait]` -> usar lookup normalizado
- Linha 210: `result.facet_scores[key]` -> usar lookup normalizado

Criar uma funcao helper que tenta encontrar as facetas por qualquer variante da chave.

### 3. Corrigir facet keys no salvamento

Atualmente salva facetas com nomes em portugues como chave (`"Fantasia"`, `"Estética"`). Manter esse comportamento pois o FACET_NAMES fallback (`|| facetKey`) ja exibe corretamente.

---

### Detalhes Tecnicos

**Arquivo 1: `src/pages/app/BigFiveTest.tsx`** (linhas 166-182)
- Mudar de `result.name.toLowerCase()` para usar as chaves originais do `calculateScore` (ingles padrao)
- Isso padroniza todos os novos registros

**Arquivo 2: `src/pages/app/BigFiveResults.tsx`**
- Criar funcao `getFacetsForTrait(trait)` que tenta encontrar facetas usando multiplas variantes da chave (original, normalizada, com/sem acentos)
- Usar essa funcao na linha 368 (renderizacao) e linha 210 (dados para IA)
- Isso garante compatibilidade com dados antigos E novos

