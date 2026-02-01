

# Plano: Padronização Estética dos Três PDFs

## Análise das Diferenças Atuais

Após revisar os três geradores de PDF, identifiquei as seguintes inconsistências:

### 1. Estrutura da Capa

| Elemento | Big Five (pdfGenerator) | Arquitetura Pessoal (HD) | Blueprint Pessoal |
|----------|------------------------|-------------------------|-------------------|
| Header altura | 35-45px | 45px | 70px |
| Nome do cliente | Dentro do box intro | Após header, centralizado | Não exibe |
| Data | Dentro do box intro | Seção "Dados de Nascimento" | Não exibe |
| Box introdutório | Sim, com linha dourada | Sim, sem linha dourada | Sim, menor |

### 2. Cores (COLORS)

| Cor | Big Five | HD | Blueprint |
|-----|----------|-----|-----------|
| carmimDark | ✅ [90,18,32] | ✅ [90,18,32] | ❌ Não existe |
| accent | ❌ Não existe | ❌ Não existe | ✅ [128,45,100] |
| bgLight | ❌ Não existe | ❌ Não existe | ✅ [252,250,248] |
| lightText | [100,100,100] | [120,120,120] | [100,100,100] |

### 3. Header/Gradient

| Aspecto | Big Five | HD | Blueprint |
|---------|----------|-----|-----------|
| Função | drawGradientHeader() | drawGradientHeader() | drawGradientHeader() |
| Cores | carmim → carmimDark | carmim → carmimDark | carmim → accent (purple) |
| Tamanho fonte título | 18px | 24px | 32px |
| Linha dourada | Abaixo, centralizada | Abaixo, full width | Não tem |

### 4. Rodapé

| Aspecto | Big Five | HD | Blueprint |
|---------|----------|-----|-----------|
| Altura total | 17px | 18px | 20px |
| Linha dourada | Sim | Sim | Sim |
| Fundo | offWhite | offWhite | bgLight |
| Formato página | "Página X" | "Página X de Y" | "X / Y" |
| Crédito fonte | 8px, normal | 9px, normal | 9px, bold |

### 5. Nome do Cliente

| PDF | Exibe nome? | Localização |
|-----|-------------|-------------|
| Big Five | ✅ Sim | Box introdutório (Participante: Nome) |
| HD | ✅ Sim | Centralizado após header |
| Blueprint | ❌ Não | Não exibe |

---

## Padrão a Seguir (Base: Big Five)

O PDF do Big Five será o modelo de referência por ter:
- Design mais equilibrado
- Nome do cliente bem posicionado
- Data visível
- Header proporcional

### Elementos do Padrão:

1. **Header**: 35-45px altura, gradiente carmim → carmimDark
2. **Título**: 18px bold, branco
3. **Subtítulo**: 11px normal, goldLight
4. **Linha dourada**: 80px centralizada abaixo do header
5. **Box introdutório**: offWhite com linha dourada no topo
6. **Participante + Data**: Dentro do box intro
7. **Rodapé**: 17px altura, "Página X de Y", crédito 8px carmim

---

## Mudanças Necessárias

### 1. generateIntegratedReport.ts (Blueprint)

```text
- Adicionar cor carmimDark à paleta COLORS
- Reduzir altura do header de 70px para 45px
- Mudar gradiente de carmim→accent para carmim→carmimDark
- Adicionar suporte para exibir nome do participante
- Adicionar suporte para exibir data do teste
- Padronizar formato do rodapé para "Página X de Y"
- Trocar bgLight por offWhite no rodapé
- Reduzir fonte do crédito de 9px bold para 8px normal
- Adicionar linha dourada decorativa no header
```

### 2. generateHDReport.ts (Arquitetura Pessoal)

```text
- Reduzir tamanho do título de 24px para 18px
- Ajustar cor lightText de [120,120,120] para [100,100,100]
- Ajustar altura do rodapé de 18px para 17px
- Ajustar formato do rodapé: "Página X" (sem total)
- Mover nome do cliente para dentro do box introdutório
- Adicionar linha dourada decorativa no box intro
- Reduzir fonte do crédito para 8px
```

### 3. Interface IntegratedReportData

```typescript
export interface IntegratedReportData {
  language?: PDFLanguage;
  userName?: string;    // NOVO - Nome do participante
  testDate?: Date;      // NOVO - Data do teste
  // ... demais campos existentes
}
```

---

## Detalhes da Implementação

### Paleta de Cores Unificada (COLORS)

```typescript
const COLORS = {
  carmim: [123, 25, 43],
  carmimDark: [90, 18, 32],
  gold: [212, 175, 55],
  goldLight: [232, 205, 125],
  offWhite: [247, 243, 239],
  dustyMauve: [191, 175, 178],
  darkText: [45, 45, 45],
  lightText: [100, 100, 100],  // Padronizado
  white: [255, 255, 255],
  success: [34, 139, 34],
  warning: [205, 133, 63],
};
```

### Header Padrão (drawGradientHeader)

```typescript
const drawGradientHeader = (title: string, subtitle?: string): number => {
  const headerHeight = subtitle ? 45 : 35;
  const steps = 20;
  
  // Gradiente carmim → carmimDark (todos os PDFs)
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r = COLORS.carmim[0] + (COLORS.carmimDark[0] - COLORS.carmim[0]) * ratio;
    const g = COLORS.carmim[1] + (COLORS.carmimDark[1] - COLORS.carmim[1]) * ratio;
    const b = COLORS.carmim[2] + (COLORS.carmimDark[2] - COLORS.carmim[2]) * ratio;
    doc.setFillColor(r, g, b);
    doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps + 0.5, 'F');
  }
  
  // Título: 18px bold branco
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, subtitle ? 22 : 20, { align: 'center' });
  
  // Subtítulo: 11px normal goldLight
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.goldLight);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 34, { align: 'center' });
  }
  
  // Linha dourada: 80px centralizada
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.line(pageWidth/2 - 40, headerHeight - 2, pageWidth/2 + 40, headerHeight - 2);
  
  return headerHeight + 5;
};
```

### Rodapé Padrão (addFooter)

```typescript
const addFooter = (pageNum: number, totalPages: number) => {
  // Linha dourada
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
  
  // Fundo offWhite
  doc.setFillColor(...COLORS.offWhite);
  doc.rect(0, pageHeight - 17, pageWidth, 17, 'F');
  
  // Página X de Y (formato padronizado)
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.lightText);
  doc.setFont('helvetica', 'normal');
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Crédito: 8px normal carmim
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.carmim);
  doc.text('Criado por Luciana Belenton', pageWidth / 2, pageHeight - 5, { align: 'center' });
};
```

### Box Introdutório Padrão

```typescript
// Box offWhite com borda arredondada
doc.setFillColor(...COLORS.offWhite);
doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

// Linha dourada decorativa no topo
doc.setDrawColor(...COLORS.gold);
doc.setLineWidth(0.5);
doc.line(margin + 10, yPos + 0.5, pageWidth - margin - 10, yPos + 0.5);

// Texto introdutório
doc.setFontSize(10);
doc.setTextColor(...COLORS.darkText);
doc.setFont('helvetica', 'normal');
doc.text(introLines, margin + 10, yPos + 12);

// Participante e Data (quando disponíveis)
if (userName) {
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.carmim);
  doc.setFont('helvetica', 'bold');
  doc.text(`Participante: ${userName}`, margin + 10, yPos + 28);
}
doc.setTextColor(...COLORS.lightText);
doc.setFont('helvetica', 'normal');
doc.text(`Data: ${formattedDate}`, userName ? margin + 100 : margin + 10, yPos + 28);
```

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/utils/generateIntegratedReport.ts` | Padronizar header, rodapé, adicionar nome/data, ajustar cores |
| `src/utils/generateHDReport.ts` | Padronizar header (tamanho fonte), rodapé, box intro |
| `src/pages/app/IntegratedResults.tsx` | Passar userName e testDate para o gerador |

---

## Tradução dos Novos Labels

Adicionar aos arquivos de tradução:

```json
{
  "blueprintPdf": {
    "participantLabel": "Participante",
    "dateLabel": "Data",
    // ... demais labels existentes
  }
}
```

---

## Resultado Final Esperado

Todos os três PDFs terão:

1. Header carmim→carmimDark com altura 35-45px
2. Título 18px branco, subtítulo 11px goldLight
3. Linha dourada centralizada (80px) no header
4. Box introdutório offWhite com linha dourada no topo
5. Nome do participante em carmim bold + data em lightText
6. Rodapé 17px com "Página X de Y" + crédito 8px
7. Mesma paleta de cores exata
8. Mesmos tamanhos de fonte para elementos equivalentes

