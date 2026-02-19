

## Problema

Dois problemas identificados na pagina de resultados Big Five (`src/pages/app/BigFiveResults.tsx`):

1. **Nomes dos tracos em letra minuscula** -- As chaves no banco de dados sao `"neuroticismo"`, `"extroversao"`, `"abertura a experiencia"` (minusculas com acentos). A funcao `normalizeTraitKey` nao reconhece `"abertura à experiência"` (com acentos) e o fallback mostra a chave crua do banco em minuscula.

2. **Facetas ja estao no codigo** -- As facetas foram adicionadas na ultima edicao e devem estar funcionando. O problema principal e o mapeamento de labels.

Isso afeta TODOS os usuarios, nao apenas a Jessica.

## Correcoes

### 1. Corrigir `normalizeTraitKey` (linha 29-37)

Adicionar mapeamento para a chave com acentos que existe no banco: `"abertura à experiência": "abertura"`. Tambem adicionar as demais chaves portuguesas para garantir robustez:

```
neuroticismo: "neuroticismo",
extroversão: "extroversão",
abertura: "abertura",
"abertura a experiencia": "abertura",
"abertura à experiência": "abertura",
amabilidade: "amabilidade",
conscienciosidade: "conscienciosidade",
```

### 2. Corrigir `getTraitLabel` para nunca retornar chave crua

Na funcao `getTraitLabel` (linha 144-160), garantir que mesmo se a chave nao for encontrada no mapa de traducoes (`t.results.traits`), o fallback use `TRAIT_LABELS` que tem os nomes capitalizados corretamente. Ja faz isso, mas o problema e que `normalizeTraitKey` falha para `"abertura à experiência"`, entao a correcao no passo 1 resolve.

### 3. Adicionar `"abertura à experiência"` ao `TRAIT_LABELS` (scoring.ts)

Adicionar a chave com acentos no `TRAIT_LABELS` como fallback extra:
```
"abertura à experiência": "Abertura à Experiência",
```

---

### Detalhes Tecnicos

**Arquivo 1**: `src/pages/app/BigFiveResults.tsx` (linha 33)
- Adicionar `"abertura à experiência": "abertura"` ao mapa de `normalizeTraitKey`

**Arquivo 2**: `src/constants/scoring.ts` (linha 37)
- Adicionar `"abertura à experiência": "Abertura à Experiência"` ao `TRAIT_LABELS`

Essas correcoes sao genericas e aplicam-se a todos os usuarios automaticamente.
