
# Plano: Internacionalização do PDF de Mapa de Personalidade

## Visão Geral

O PDF de Mapa de Personalidade (`pdfGenerator.ts`) está atualmente com todos os textos fixos em português. Seguindo o mesmo padrão usado para os PDFs de Arquitetura Pessoal e Blueprint Pessoal, precisamos:
1. Adicionar parâmetro `language` na interface PDFOptions
2. Criar função `getTranslations()` com todas as traduções inline (mesmo padrão do generateIntegratedReport.ts)
3. Atualizar todas as strings hardcoded para usar traduções dinâmicas
4. Passar o idioma ao chamar a função de geração em BigFiveResults.tsx

---

## Arquivos a Modificar

| Arquivo | Propósito |
|---------|-----------|
| `src/utils/pdfGenerator.ts` | Adicionar parâmetro `language`, implementar traduções dinâmicas |
| `src/pages/app/BigFiveResults.tsx` | Passar idioma atual para o gerador de PDF |

---

## Textos a Traduzir no pdfGenerator.ts

| Linha | Texto PT | Contexto |
|-------|----------|----------|
| 36-58 | Classificações | Muito Baixo, Baixo, Médio, Alto, Muito Alto |
| 128 | "Página X" | Rodapé |
| 133 | "Criado por Luciana Belenton" | Rodapé |
| 184 | "MAPA DE PERSONALIDADE" | Header capa |
| 184 | "Análise Comportamental Big Five" | Subtítulo capa |
| 201 | Texto introdutório | Box explicativo |
| 210 | "Participante:" | Label |
| 214 | "Data:" | Label |
| 233 | "GRANDES TRAÇOS DE PERSONALIDADE" | Header seção |
| 303 | "DETALHAMENTO POR TRAÇO" | Header página 2 |
| 303 | "Facetas e Scores Individuais" | Subtítulo página 2 |
| 325 | "Score:" | Label |
| 390 | "ANÁLISE PERSONALIZADA" | Header análise IA |
| 390 | "Interpretação Detalhada do Seu Perfil" | Subtítulo |
| 463 | "SOBRE O BIG FIVE" | Header página final |
| 478-486 | Texto explicativo Big Five | Parágrafo |
| 495-497 | Nome do arquivo | mapa-personalidade-data.pdf |

---

## Modificações no pdfGenerator.ts

### 1. Interface PDFOptions - Adicionar campo de idioma:

```typescript
type PDFLanguage = 'pt' | 'es' | 'en';

interface PDFOptions {
  language?: PDFLanguage;  // Novo campo
  userName?: string;
  testDate?: Date;
  aiAnalysis?: string;
}
```

### 2. Função getTranslations() - Inline como no generateIntegratedReport:

```typescript
const getTranslations = (lang: PDFLanguage) => {
  const translations = {
    pt: {
      headerTitle: 'MAPA DE PERSONALIDADE',
      headerSubtitle: 'Análise Comportamental Big Five',
      introText: 'Este relatório apresenta uma análise detalhada do seu perfil de personalidade baseado no modelo Big Five...',
      participantLabel: 'Participante',
      dateLabel: 'Data',
      traitsHeader: 'GRANDES TRAÇOS DE PERSONALIDADE',
      detailHeader: 'DETALHAMENTO POR TRAÇO',
      detailSubtitle: 'Facetas e Scores Individuais',
      scoreLabel: 'Score',
      analysisHeader: 'ANÁLISE PERSONALIZADA',
      analysisSubtitle: 'Interpretação Detalhada do Seu Perfil',
      aboutHeader: 'SOBRE O BIG FIVE',
      aboutText: '...',
      pageLabel: 'Página',
      createdBy: 'Criado por Luciana Belenton',
      fileName: 'mapa-personalidade',
      
      traits: {
        neuroticism: 'Neuroticismo',
        extraversion: 'Extroversão',
        openness: 'Abertura à Experiência',
        agreeableness: 'Amabilidade',
        conscientiousness: 'Conscienciosidade'
      },
      
      traitClassifications: {
        veryLow: 'Muito Baixo',
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto',
        veryHigh: 'Muito Alto'
      },
      
      facetClassifications: {
        veryLow: 'Muito Baixa',
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        veryHigh: 'Muito Alta'
      },
      
      facetNames: {
        N1: 'Ansiedade', N2: 'Hostilidade', N3: 'Depressão', ...
      }
    },
    es: { ... },
    en: { ... }
  };
  return translations[lang] || translations.pt;
};
```

### 3. Funções de classificação localizadas:

```typescript
const getTraitClassificationLocalized = (score: number, t: TranslationType): string => {
  if (score <= 108) return t.traitClassifications.veryLow;
  if (score <= 156) return t.traitClassifications.low;
  if (score <= 198) return t.traitClassifications.medium;
  if (score <= 246) return t.traitClassifications.high;
  return t.traitClassifications.veryHigh;
};

const getFacetClassificationLocalized = (score: number, t: TranslationType): string => {
  if (score <= 18) return t.facetClassifications.veryLow;
  if (score <= 26) return t.facetClassifications.low;
  if (score <= 33) return t.facetClassifications.medium;
  if (score <= 41) return t.facetClassifications.high;
  return t.facetClassifications.veryHigh;
};
```

### 4. Nome do arquivo localizado:

```typescript
const fileNames = {
  pt: 'mapa-personalidade',
  es: 'mapa-personalidad',
  en: 'personality-map'
};

const DATE_LOCALES = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US'
};

const dateStr = testDate.toLocaleDateString(DATE_LOCALES[language]).replace(/\//g, '-');
const fileName = userName 
  ? `${fileNames[language]}-${userName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`
  : `${fileNames[language]}-${dateStr}.pdf`;
```

---

## Modificação no BigFiveResults.tsx

Atualizar a chamada para passar o idioma:

```typescript
const handleDownloadPDF = () => {
  if (!result) return;
  
  const aiText = result.ai_analyses?.[0]?.analysis_text;
  generateTestResultPDF(
    result.trait_scores,
    result.facet_scores,
    result.classifications,
    {
      language: language as 'pt' | 'es' | 'en',  // Novo campo
      userName: userName,
      testDate: result.test_sessions.completed_at 
        ? new Date(result.test_sessions.completed_at) 
        : new Date(),
      aiAnalysis: aiText,
    }
  );
  toast({
    title: t.results.pdfGenerated,
    description: t.results.pdfSuccess,
  });
};
```

---

## Estrutura Completa das Traduções

### Português (pt):
- Título: "MAPA DE PERSONALIDADE"
- Subtítulo: "Análise Comportamental Big Five"
- Traços: Neuroticismo, Extroversão, Abertura à Experiência, Amabilidade, Conscienciosidade
- Classificações: Muito Baixo/Baixo/Médio/Alto/Muito Alto
- Facetas (30 nomes): Ansiedade, Hostilidade, Depressão, Constrangimento, Impulsividade, Vulnerabilidade, Calor, Sociabilidade, Assertividade, Atividade, Busca de Emoções, Emoções Positivas, Fantasia, Estética, Sentimentos, Ações, Ideias, Valores, Confiança, Franqueza, Altruísmo, Complacência, Modéstia, Sensibilidade, Competência, Ordem, Senso de dever, Esforço por Realização, Autodisciplina, Ponderação

### Espanhol (es):
- Título: "MAPA DE PERSONALIDAD"
- Subtítulo: "Análisis Conductual Big Five"
- Traços: Neuroticismo, Extraversión, Apertura a la Experiencia, Amabilidad, Responsabilidad
- Classificações: Muy Bajo/Bajo/Medio/Alto/Muy Alto
- Facetas traduzidas para espanhol

### Inglês (en):
- Título: "PERSONALITY MAP"
- Subtítulo: "Big Five Behavioral Analysis"
- Traços: Neuroticism, Extraversion, Openness to Experience, Agreeableness, Conscientiousness
- Classificações: Very Low/Low/Medium/High/Very High
- Facetas: Anxiety, Hostility, Depression, Self-Consciousness, Impulsiveness, Vulnerability, Warmth, Gregariousness, Assertiveness, Activity, Excitement-Seeking, Positive Emotions, Fantasy, Aesthetics, Feelings, Actions, Ideas, Values, Trust, Straightforwardness, Altruism, Compliance, Modesty, Tender-Mindedness, Competence, Order, Dutifulness, Achievement Striving, Self-Discipline, Deliberation

---

## Resumo das Mudanças

1. **pdfGenerator.ts**: 
   - Adicionar `language?: PDFLanguage` na interface PDFOptions
   - Implementar função `getTranslations()` com traduções inline (pt, es, en)
   - Traduzir todos os nomes de traços
   - Traduzir todas as classificações (5 níveis)
   - Traduzir todos os nomes de facetas (30 facetas)
   - Traduzir textos do header, rodapé e seções
   - Formatar datas conforme locale
   - Nomear arquivo no idioma correto

2. **BigFiveResults.tsx**: 
   - Passar `language` do contexto para o gerador de PDF

---

## Benefícios

- PDF do Mapa de Personalidade gerado no idioma selecionado pelo usuário
- Consistência completa entre UI e relatório baixado
- Suporte para português, espanhol e inglês
- Datas e nome do arquivo formatados conforme locale
- Todas as classificações e nomes de facetas traduzidos
