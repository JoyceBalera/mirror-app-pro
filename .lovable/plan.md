

# Plano: Verificação de Dados da Edge Function e Padronização Visual do PDF

## Resumo

Este plano aborda duas necessidades principais:
1. Verificar se a edge function `analyze-human-design` está enviando os dados corretos para a IA
2. Padronizar o visual do relatório PDF de Arquitetura Pessoal (Human Design) para seguir o mesmo padrão do Big Five e Blueprint

---

## PARTE 1: Verificação dos Dados Enviados à IA

### Situação Atual

A edge function `analyze-human-design` recebe os seguintes dados do frontend (DesenhoHumanoResults.tsx, linhas 144-157):

```text
humanDesignData = {
  userName: 'você',
  definedCenters: ['head', 'ajna', ...], // IDs dos centros definidos
  energyType: 'Gerador',
  strategy: 'Responder',
  authority: 'Sacral',
  definition: 'Single',
  profile: '4/6',
  incarnationCross: 'Right Angle Cross of...',
  activatedGates: [1, 2, 3, ...], // Array de números
  channels: [{ id: '1-8', name: 'Canal da Inspiração', isComplete: true }, ...],
  advancedVariables: { digestion, environment, motivation, perspective, sense, designSense }
}
```

### Função buildUserPrompt (analyze-human-design/index.ts, linhas 349-408)

A função monta o prompt corretamente:
- Traduz IDs de centros para português (head → Cabeça)
- Formata variáveis avançadas com primary e level
- Lista portões e canais

### Potenciais Problemas Identificados

1. **Termos em Inglês nas Variáveis Avançadas**: O arquivo `humanDesignVariables.ts` armazena os termos `primary` em inglês (ex: "Appetite", "Mountains", "Fear"). Esses valores são enviados diretamente para a IA.

2. **Sub-categorias em Inglês**: Os valores de `subcategory` também estão em inglês ("Focused", "Open", "Active", "Passive", etc.)

3. **A IA recebe o prompt já com termos misturados**: Por exemplo:
   ```
   Digestão: Appetite (Low) - Focused
   Ambiente: Mountains - Active
   ```

### Solução para os Dados

**Opção 1 - Traduzir no Frontend (humanDesignVariables.ts)**:
- Modificar os mapas `DIGESTION_MAP`, `ENVIRONMENT_MAP`, etc. para usar termos em português
- Impacto: Afeta a exibição na UI E os dados enviados para a IA

**Opção 2 - Traduzir apenas na Edge Function (recomendado)**:
- Criar um mapeamento de tradução dentro da edge function `buildUserPrompt`
- Mantém a UI atual e traduz apenas para o contexto da análise IA

**Decisão**: Deixar para depois conforme solicitado (os prompts serão substituídos pelo usuário)

---

## PARTE 2: Padronização Visual do PDF

### Análise Comparativa dos Três Geradores

| Elemento | Big Five (pdfGenerator.ts) | Blueprint (generateIntegratedReport.ts) | Human Design (generateHDReport.ts) |
|----------|---------------------------|----------------------------------------|-----------------------------------|
| **Cores** | COLORS com carmim, gold, offWhite | Mesma paleta + accent | Mesma paleta ✓ |
| **Header** | drawGradientHeader com gradiente carmim→carmimDark | drawGradientHeader similar | Igual ✓ |
| **Rodapé** | "Página X" + "Criado por Luciana Belenton" | "X / Total" + "Criado por Luciana Belenton" | Igual ✓ |
| **Linha decorativa** | Gold line antes de seções | Gold line antes de seções | Igual ✓ |
| **Progress bars** | Sim, para traços | Sim, para traços | Não aplicável |
| **Cards** | offWhite background, rounded | offWhite background, rounded | Igual ✓ |
| **Espaçamento** | margin: 14mm | margin: 20mm | margin: 20mm ✓ |
| **cleanMarkdown** | Sim | Sim | Sim ✓ |

### Diferenças Identificadas

1. **Big Five e Blueprint usam margin: 14-20mm** - HD usa 20mm ✓ Compatível

2. **Cores do darkText diferentes**:
   - Big Five: `[45, 45, 45]`
   - HD: `[51, 51, 51]`
   - Ajustar HD para `[45, 45, 45]`

3. **Estrutura do rodapé**:
   - Big Five: Linha dourada no topo, fundo off-white, "Página X"
   - Blueprint: Fundo bgLight, "X / Total"
   - HD: Similar ao Big Five ✓

4. **Verificação de página (checkAddPage)**:
   - Big Five: `checkAddPage(yPos, requiredSpace)` - adiciona rodapé antes da nova página
   - HD: `checkAddPage(neededSpace, yPos)` - NÃO adiciona rodapé antes da nova página
   - **Este é um problema potencial**: O HD pode não estar adicionando rodapés corretamente em páginas intermediárias

5. **Sentido (Personality) vs (Design)**:
   - Atualmente exibe ambos (linhas 475-476)
   - Usuário pediu para remover Personality e manter apenas Design

---

## Modificações Necessárias

### 1. `src/utils/generateHDReport.ts`

**1.1. Padronizar cor darkText**
```text
Linha 31: darkText: [51, 51, 51] → darkText: [45, 45, 45]
```

**1.2. Remover Sentido (Personality) - manter apenas Design**
```text
Linha 475: renderVariable('Sentido (Personality)', data.variables.sense);
→ REMOVER esta linha

Linha 476: renderVariable('Sentido (Design)', data.variables.designSense);
→ Renomear para: renderVariable('Sentido', data.variables.designSense);
```

**1.3. Adicionar fundo offWhite no rodapé (igual Big Five)**
O rodapé do HD já tem isso (linha 89), mas verificar se está sendo aplicado corretamente.

### 2. Padronização do Header de Seção

Big Five usa um padrão específico para headers de seção com ícone circular:
```text
// Header com badge circular
doc.setFillColor(...COLORS.carmim);
doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
doc.setFillColor(...COLORS.gold);
doc.circle(margin + 12, yPos + 6, 5, 'F');
```

HD já usa padrão similar para centros. Manter consistência nas seções principais.

### 3. Verificar Captura do BodyGraph

Código atual (DesenhoHumanoResults.tsx, linhas 208-254):
- Busca elemento com classe `.bodygraph-svg`
- Serializa para PNG via Canvas (2x scale)

Verificar se o componente `HDBodyGraph.tsx` tem essa classe CSS aplicada.

---

## Lista de Arquivos a Modificar

### Arquivo 1: `src/utils/generateHDReport.ts`

| Linha | Mudança |
|-------|---------|
| 31 | Alterar darkText de `[51, 51, 51]` para `[45, 45, 45]` |
| 475 | Remover linha `renderVariable('Sentido (Personality)', data.variables.sense);` |
| 476 | Alterar para `renderVariable('Sentido', data.variables.designSense);` |

### Arquivo 2: `src/components/humandesign/HDBodyGraph.tsx`

Verificar se a classe `bodygraph-svg` está sendo aplicada ao elemento SVG raiz para garantir captura correta no PDF.

---

## Resumo das Ações

1. **Padronização de cores**: Ajustar `darkText` para consistência com Big Five/Blueprint
2. **Remover redundância**: Exibir apenas "Sentido" (do Design), removendo "Sentido (Personality)"
3. **Verificar captura de imagem**: Garantir que o BodyGraph tem a classe CSS correta para captura
4. **Manter prompts para depois**: Não modificar o SYSTEM_PROMPT ou buildUserPrompt conforme solicitado

---

## Observações Técnicas

Os três geradores de PDF já compartilham:
- Mesma paleta de cores (Luciana)
- Mesmo estilo de header com gradiente
- Mesmo rodapé com crédito
- Mesma função cleanMarkdown
- Mesma estrutura de cards com background offWhite

A padronização principal necessária é:
1. Pequeno ajuste de cor (darkText)
2. Remoção de dado redundante (Sentido Personality)
3. Verificação da classe CSS para captura de imagem

