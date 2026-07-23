## Objetivo

Eliminar as páginas intermediárias do PDF do Blueprint Pessoal (Mapa de Personalidade, Arquitetura Pessoal e Bodygraph), mantendo apenas a capa e a seção "Análise Integrada — Interpretação Detalhada do Seu Perfil".

## Diagnóstico atual

O componente `src/utils/pdfIntegratedDocument.tsx` renderiza, nesta ordem:

1. `CoverPage` — capa com título e dados do participante
2. `BigFivePage` — traços do Big Five (página 2)
3. `HumanDesignPage` — dados de Arquitetura Pessoal (página 3)
4. `BodygraphPage` — bodygraph + lista de canais ativos (página 4)
5. `AnalysisPage` — texto da análise integrada (páginas seguintes)

A lista de canais ativos aparece tanto em `HumanDesignPage` quanto em `BodygraphPage`, e os traços do Big Five aparecem em `BigFivePage`. O usuário solicitou a remoção dessas páginas, mantendo apenas a capa e a análise integrada.

## Plano de implementação

### 1. Remover páginas desnecessárias do documento

Editar `src/utils/pdfIntegratedDocument.tsx`:
- Remover `<BigFivePage />`, `<HumanDesignPage />` e `<BodygraphPage />` do `Document`.
- Manter apenas `<CoverPage />` e `<AnalysisPage />`.

### 2. Limpar código morto

- Remover os componentes `BigFivePage`, `HumanDesignPage` e `BodygraphPage` do arquivo.
- Remover imports de componentes auxiliares que deixarem de ser usados (ex: `TraitBar`, `InfoCard`, `SectionTitle`, `BodygraphImage`).
- Remover do objeto de traduções as chaves que só existem para as páginas removidas (ex: `personalityMapTitle`, `personalArchitectureTitle`, `bodygraphTitle`, `activeChannels`, `noChannels`, `hdLabels`, `centersSection`, `classifications`, `traits`, `traitKeyVariants`, `getClassificationLabel`).

### 3. Garantir integração

- Não alterar `src/utils/pdfEngine.tsx` nem `src/pages/app/IntegratedResults.tsx`, pois o fluxo de geração e os dados enviados permanecem os mesmos; apenas a composição do documento PDF muda.

### 4. Validar build

- Rodar `bun run build` (ou o comando equivalente do projeto) para confirmar que não há erros de TypeScript ou de importação após a limpeza.

### 5. Testar geração

- Gerar localmente o PDF do Blueprint Pessoal usando o script de teste existente (`scripts/test-pdf.tsx`) ou via interface, confirmando que o arquivo resultante contém apenas: capa + páginas da análise integrada.

## Resultado esperado

O PDF do Blueprint Pessoal terá apenas duas seções:
- Página inicial (capa)
- Páginas da análise integrada

Não haverá mais duplicação de canais ativos, nem páginas de Big Five ou Arquitetura Pessoal.