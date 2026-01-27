
# Plano: Correção dos Bugs de Formatação do PDF de Arquitetura Pessoal

## Problemas Identificados

### 1. Pontos Verdes Aleatórios
Os caracteres `✓` (checkmark) e `○` (círculo) usados nas linhas 465 e 509 de `generateHDReport.ts` não são suportados pela fonte Helvetica do jsPDF. Isso causa renderização incorreta, exibindo caracteres estranhos ou pontos.

**Solução**: Substituir os caracteres Unicode por alternativas que funcionam no jsPDF, como:
- `✓` → Usar um retângulo colorido simples sem texto, ou usar "D" para Definido
- `○` → Usar um retângulo colorido simples sem texto, ou usar "A" para Aberto

### 2. Corte no Texto dos Centros Energéticos
O card de cada centro tem altura fixa de 40px (linha 349), mas o texto de `importanceForWomen` pode ser muito longo. O código atual corta para apenas 2 linhas (linha 375: `importanceLines.slice(0, 2).join(' ')`), causando texto cortado.

**Solução**: Calcular a altura do card dinamicamente baseada no conteúdo, permitindo que todo o texto seja exibido.

### 3. Espaços em Branco Excessivos
A função `checkAddPage` (linha 151-158) apenas adiciona página quando não há espaço, mas não otimiza o preenchimento do espaço disponível.

**Solução**: Melhorar o algoritmo de quebra de página para:
- Calcular altura real do conteúdo antes de posicionar
- Evitar quebras desnecessárias no meio de seções

---

## Arquivos a Modificar

### Arquivo: `src/utils/generateHDReport.ts`

| Linha | Problema | Correção |
|-------|----------|----------|
| 349 | Card altura fixa 40px | Calcular altura dinâmica baseada no texto |
| 374-375 | `slice(0, 2)` corta texto | Remover limite e exibir texto completo |
| 461-465 | Caractere `✓` não renderiza | Remover texto do ícone, usar apenas o retângulo verde |
| 504-509 | Caractere `○` não renderiza | Remover texto do ícone, usar apenas o retângulo laranja |

---

## Mudanças Detalhadas

### 1. Corrigir Ícones (Remover caracteres Unicode)

**Antes (linha 461-465):**
```typescript
doc.setFillColor(...COLORS.success);
doc.roundedRect(cardX + 3, cardY + 3, 8, 8, 1, 1, 'F');
doc.setTextColor(...COLORS.white);
doc.setFontSize(7);
doc.setFont('helvetica', 'bold');
doc.text('✓', cardX + 5.5, cardY + 8.5);
```

**Depois:**
```typescript
doc.setFillColor(...COLORS.success);
doc.roundedRect(cardX + 3, cardY + 3, 8, 8, 1, 1, 'F');
// Apenas o retângulo verde serve como indicador visual - sem texto
```

### 2. Card com Altura Dinâmica para Centros

**Antes (linhas 340-377):**
- Altura fixa de 40px
- Texto cortado em 2 linhas

**Depois:**
- Calcular número de linhas do texto `importanceForWomen`
- Altura mínima de 40px, aumentando conforme necessário
- Exibir texto completo

### 3. Otimizar Espaçamento

- Adicionar verificação de espaço antes de cada seção de centro
- Garantir que não haja páginas quase vazias

---

## Resumo das Correções

1. **Ícones**: Remover caracteres `✓` e `○` que não renderizam - manter apenas os quadrados coloridos
2. **Cards dos Centros**: Altura dinâmica para acomodar todo o texto
3. **Espaçamento**: Ajustar `checkAddPage` para considerar altura real do conteúdo

---

## Impacto Visual Esperado

- Sem mais pontos verdes/laranjas aleatórios - apenas quadrados coloridos sólidos
- Texto dos centros completo e legível
- Melhor distribuição de conteúdo nas páginas, menos espaço em branco
