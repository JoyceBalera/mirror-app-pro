
# Plano: Internacionalização do PDF de Blueprint Pessoal

## Visão Geral

O PDF do Blueprint Pessoal (`generateIntegratedReport.ts`) está atualmente com todos os textos em português fixos. Seguindo o mesmo padrão usado para o PDF de Arquitetura Pessoal, precisamos:
1. Adicionar parâmetro `language` na interface de dados
2. Criar traduções para todos os textos do PDF (pt, es, en) na seção `blueprintPdf`
3. Atualizar o gerador para usar traduções dinâmicas
4. Passar o idioma ao chamar a função de geração

---

## Arquivos a Modificar

| Arquivo | Propósito |
|---------|-----------|
| `src/utils/generateIntegratedReport.ts` | Adicionar parâmetro `language`, usar traduções dinâmicas |
| `src/locales/pt/translation.json` | Adicionar seção `blueprintPdf` em português |
| `src/locales/es/translation.json` | Adicionar seção `blueprintPdf` em espanhol |
| `src/locales/en/translation.json` | Adicionar seção `blueprintPdf` em inglês |
| `src/pages/app/IntegratedResults.tsx` | Passar idioma atual para o gerador de PDF |

---

## Textos a Traduzir no generateIntegratedReport.ts

| Linha | Texto PT | Contexto |
|-------|----------|----------|
| 44-51 | CLASSIFICATION_LABELS | Baixo, Médio, Alto |
| 118-119 | "BLUEPRINT PESSOAL" | Título principal capa |
| 125 | "Mapa de Personalidade + Arquitetura Pessoal" | Subtítulo capa |
| 135 | Texto introdutório | Box explicativo |
| 157 | "MAPA DE PERSONALIDADE" | Header seção Big Five |
| 161-167 | traits[].key | Nomes dos traços Big Five |
| 229 | "ARQUITETURA PESSOAL" | Header seção HD |
| 234-239 | hdItems[].label | Labels do grid HD |
| 298-303 | "● Definidos", "○ Abertos", "Nenhum" | Centros |
| 329 | "SEU BODYGRAPH" | Header página 2 |
| 345 | "Imagem do Bodygraph não disponível" | Fallback |
| 358 | "Canais Ativos" | Label |
| 374 | "Nenhum canal completo" | Fallback |
| 389 | "ANÁLISE INTEGRADA" | Header página 3 |
| 484 | "X / Y" | Número página |
| 490 | "Criado por Luciana Belenton" | Rodapé |
| 495 | Nome do arquivo | Blueprint_Pessoal_data.pdf |

---

## Estrutura de Traduções (blueprintPdf)

```json
{
  "blueprintPdf": {
    "headerTitle1": "BLUEPRINT",
    "headerTitle2": "PESSOAL",
    "subtitle": "Mapa de Personalidade + Arquitetura Pessoal",
    "introText": "Este relatório apresenta uma visão integrada do seu perfil, cruzando os resultados do Mapa de Personalidade (Cinco Grandes Fatores) com a sua Arquitetura Pessoal.",
    "pageOf": "{{current}} / {{total}}",
    "createdBy": "Criado por Luciana Belenton",
    "fileName": "Blueprint_Pessoal",
    
    "personalityMapTitle": "MAPA DE PERSONALIDADE",
    "personalArchitectureTitle": "ARQUITETURA PESSOAL",
    
    "traits": {
      "neuroticism": "Neuroticismo",
      "extraversion": "Extroversão",
      "openness": "Abertura à Experiência",
      "agreeableness": "Amabilidade",
      "conscientiousness": "Conscienciosidade"
    },
    
    "classifications": {
      "low": "Baixo",
      "medium": "Médio",
      "high": "Alto"
    },
    
    "hdLabels": {
      "energyType": "Tipo Energético",
      "strategy": "Estratégia",
      "authority": "Autoridade",
      "profile": "Perfil",
      "definition": "Definição",
      "incarnationCross": "Cruz de Encarnação"
    },
    
    "centersSection": {
      "defined": "Definidos",
      "open": "Abertos",
      "none": "Nenhum"
    },
    
    "bodygraphTitle": "SEU BODYGRAPH",
    "bodygraphFallback": "Imagem do Bodygraph não disponível",
    "activeChannels": "Canais Ativos",
    "noChannels": "Nenhum canal completo",
    
    "analysisTitle": "ANÁLISE INTEGRADA"
  }
}
```

---

## Modificações no generateIntegratedReport.ts

### 1. Interface HDReportData

```typescript
type PDFLanguage = 'pt' | 'es' | 'en';

export interface IntegratedReportData {
  language?: PDFLanguage;  // Novo campo
  // ... campos existentes
}
```

### 2. Função de Traduções

```typescript
const getTranslations = (lang: PDFLanguage) => {
  const translations = {
    pt: {
      headerTitle1: 'BLUEPRINT',
      headerTitle2: 'PESSOAL',
      subtitle: 'Mapa de Personalidade + Arquitetura Pessoal',
      introText: 'Este relatório apresenta uma visão integrada...',
      // ... todas as traduções
    },
    es: {
      headerTitle1: 'BLUEPRINT',
      headerTitle2: 'PERSONAL',
      subtitle: 'Mapa de Personalidad + Arquitectura Personal',
      // ...
    },
    en: {
      headerTitle1: 'PERSONAL',
      headerTitle2: 'BLUEPRINT',
      subtitle: 'Personality Map + Personal Architecture',
      // ...
    }
  };
  return translations[lang] || translations.pt;
};
```

### 3. Mapeamento de Nomes de Traços

Os nomes dos traços Big Five precisam ser traduzidos dinamicamente:

```typescript
const getTraitTranslations = (lang: PDFLanguage) => ({
  pt: {
    'Neuroticismo': 'Neuroticismo',
    'Extroversão': 'Extroversão',
    'Abertura à Experiência': 'Abertura à Experiência',
    'Amabilidade': 'Amabilidade',
    'Conscienciosidade': 'Conscienciosidade'
  },
  es: {
    'Neuroticismo': 'Neuroticismo',
    'Extroversão': 'Extraversión',
    'Abertura à Experiência': 'Apertura a la Experiencia',
    'Amabilidade': 'Amabilidad',
    'Conscienciosidade': 'Responsabilidad'
  },
  en: {
    'Neuroticismo': 'Neuroticism',
    'Extroversão': 'Extraversion',
    'Abertura à Experiência': 'Openness to Experience',
    'Amabilidade': 'Agreeableness',
    'Conscienciosidade': 'Conscientiousness'
  }
}[lang]);
```

### 4. Nome do Arquivo Localizado

```typescript
const fileNames = {
  pt: 'Blueprint_Pessoal',
  es: 'Blueprint_Personal',
  en: 'Personal_Blueprint'
};

const DATE_LOCALES = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US'
};

const today = new Date().toLocaleDateString(DATE_LOCALES[language]).replace(/\//g, '-');
const fileName = `${fileNames[language]}_${today}.pdf`;
```

---

## Modificação no IntegratedResults.tsx

```typescript
import { useTranslation } from 'react-i18next';

const IntegratedResults = () => {
  const { i18n } = useTranslation();
  
  const handleDownloadPdf = async () => {
    // ... código existente
    
    const reportData: IntegratedReportData = {
      language: (i18n.language?.split('-')[0] as 'pt' | 'es' | 'en') || 'pt',
      traitScores: traitScores as Record<string, number>,
      // ... demais campos
    };
    
    await generateIntegratedReport(reportData);
  };
};
```

---

## Resumo das Mudanças

1. **Traduções JSON**: Adicionar seção `blueprintPdf` completa nos 3 arquivos de locale
2. **generateIntegratedReport.ts**: 
   - Adicionar `language` na interface
   - Implementar função `getTranslations()` com todos os textos
   - Traduzir nomes dos traços Big Five
   - Traduzir labels do Human Design  
   - Traduzir classificações (Baixo/Médio/Alto)
   - Formatar datas conforme locale
   - Nomear arquivo no idioma correto
3. **IntegratedResults.tsx**: Passar `i18n.language` ao gerar PDF

---

## Benefícios

- PDF do Blueprint gerado no idioma selecionado pelo usuário
- Consistência completa entre UI e relatório baixado
- Suporte para português, espanhol e inglês
- Datas e nome do arquivo formatados conforme locale
