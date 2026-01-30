

# Plano: Internacionalização do PDF de Arquitetura Pessoal

## Visão Geral

O PDF de Arquitetura Pessoal (`generateHDReport.ts`) atualmente está 100% em português, com textos hardcoded. Precisamos:
1. Receber o idioma selecionado como parâmetro
2. Criar traduções para todos os textos do PDF (pt, es, en)
3. Traduzir também o texto teórico fixo (`humanDesignTheory.ts`)

---

## Arquivos a Modificar

| Arquivo | Propósito |
|---------|-----------|
| `src/utils/generateHDReport.ts` | Adicionar parâmetro `language`, usar traduções dinâmicas |
| `src/data/humanDesignTheory.ts` | Refatorar para suportar múltiplos idiomas |
| `src/pages/DesenhoHumanoResults.tsx` | Passar idioma atual para o gerador de PDF |
| `src/pages/UserDetails.tsx` | Passar idioma atual para o gerador de PDF (admin) |

---

## Detalhes da Implementação

### 1. Refatorar `humanDesignTheory.ts` para Multi-idioma

**Antes**: Exporta objetos com texto fixo em português
**Depois**: Exporta funções que retornam o texto no idioma correto

```typescript
// Nova estrutura
type Language = 'pt' | 'es' | 'en';

export const getIntroSection = (lang: Language) => ({
  title: translations[lang].introTitle,
  content: translations[lang].introContent
});

export const getCentersTheory = (lang: Language) => [
  {
    id: 'head',
    name: translations[lang].centers.head.name,
    function: translations[lang].centers.head.function,
    importanceForWomen: translations[lang].centers.head.importance
  },
  // ... demais centros
];
```

### 2. Modificar `generateHDReport.ts`

**Interface HDReportData** - Adicionar campo de idioma:
```typescript
export interface HDReportData {
  language?: 'pt' | 'es' | 'en';  // Novo campo
  user_name?: string;
  // ... campos existentes
}
```

**Textos a traduzir** (todos os textos hardcoded no arquivo):

| Linha | Texto PT | Contexto |
|-------|----------|----------|
| 48-58 | CENTER_NAMES | Nomes dos centros |
| 110 | "Página X de Y" | Rodapé |
| 114 | "Criado por Luciana Belenton" | Rodapé |
| 197 | "ARQUITETURA PESSOAL" | Header capa |
| 197 | "Desenho Humano Personalizado" | Subtítulo capa |
| 216 | Texto introdutório | Box de boas-vindas |
| 231 | "DADOS DE NASCIMENTO" | Seção capa |
| 237-240 | "Data", "Horário", "Local" | Labels |
| 250 | "SEU PERFIL ENERGÉTICO" | Seção capa |
| 255-260 | Labels do grid | Tipo, Estratégia, etc. |
| 290 | "SEU BODYGRAPH VISUAL" | Header página 2 |
| 308/318 | Texto fallback bodygraph | Mensagem |
| 326 | Resumo centros/canais | Contagem |
| 333 | "INTRODUÇÃO AO DESENHO HUMANO" | Header teoria |
| 339 | "OS 9 CENTROS ENERGÉTICOS" | Header teoria |
| 344 | Texto intro centros | Parágrafo |
| 376/385 | "Funcao", "Importancia para mulheres" | Labels |
| 403 | Nota sobre centros definidos | Texto |
| 409 | "ESTRUTURA DO HUMAN DESIGN" | Header |
| 420 | "Variáveis Avançadas" | Título |
| 451 | "SEUS CENTROS ENERGÉTICOS" | Header |
| 460 | "Centros Definidos" | Seção |
| 464 | "(Fontes de Energia Consistente)" | Descrição |
| 491 | "Nenhum centro definido (Reflector)" | Fallback |
| 501 | "Centros Abertos" | Seção |
| 505 | "(Áreas de Sabedoria e Aprendizado)" | Descrição |
| 532 | "Todos os centros definidos" | Fallback |
| 544 | "Seus Canais de Poder" | Título |
| 573 | "Nenhum canal completo definido" | Fallback |
| 580 | "SUAS VARIÁVEIS AVANÇADAS" | Header |
| 616-620 | Labels variáveis | Digestão, Ambiente, etc. |
| 627 | "SEU MAPA NA PRÁTICA" | Header análise IA |
| 627 | "Leitura personalizada do seu desenho" | Subtítulo |
| 701-703 | Nome do arquivo PDF | Template |

### 3. Estrutura de Traduções para o PDF

Adicionar seção `hdPdf` nos arquivos de tradução:

```json
// src/locales/pt/translation.json
{
  "hdPdf": {
    "pageOf": "Página {{current}} de {{total}}",
    "createdBy": "Criado por Luciana Belenton",
    "headerTitle": "ARQUITETURA PESSOAL",
    "headerSubtitle": "Desenho Humano Personalizado",
    "introText": "Este relatório apresenta sua Arquitetura Pessoal completa...",
    "birthDataTitle": "DADOS DE NASCIMENTO",
    "birthDate": "Data",
    "birthTime": "Horário",
    "birthLocation": "Local",
    "profileTitle": "SEU PERFIL ENERGÉTICO",
    "energyType": "Tipo Energético",
    "strategy": "Estratégia",
    "authority": "Autoridade",
    "profile": "Perfil",
    "definition": "Definição",
    "incarnationCross": "Cruz de Encarnação",
    "bodygraphTitle": "SEU BODYGRAPH VISUAL",
    "bodygraphFallback": "Seu Bodygraph está disponível na plataforma online.",
    "centersIntroTitle": "INTRODUÇÃO AO DESENHO HUMANO",
    "centersTitle": "OS 9 CENTROS ENERGÉTICOS",
    "centersIntro": "Dentro do Desenho Humano, os centros representam...",
    "functionLabel": "Função",
    "importanceLabel": "Importância para mulheres",
    "centersNote": "(*) Indica os centros que estão definidos no seu mapa pessoal.",
    "structureTitle": "ESTRUTURA DO HUMAN DESIGN",
    "advancedVariablesTheory": "Variáveis Avançadas",
    "yourCentersTitle": "SEUS CENTROS ENERGÉTICOS",
    "definedCenters": "Centros Definidos",
    "definedCentersDesc": "(Fontes de Energia Consistente)",
    "openCenters": "Centros Abertos",
    "openCentersDesc": "(Áreas de Sabedoria e Aprendizado)",
    "noCentersDefined": "Nenhum centro definido (Reflector)",
    "allCentersDefined": "Todos os centros definidos",
    "powerChannels": "Seus Canais de Poder",
    "noChannels": "Nenhum canal completo definido",
    "yourVariablesTitle": "SUAS VARIÁVEIS AVANÇADAS",
    "digestion": "Digestão",
    "environment": "Ambiente",
    "motivation": "Motivação",
    "perspective": "Perspectiva",
    "sense": "Sentido",
    "analysisTitle": "SEU MAPA NA PRÁTICA",
    "analysisSubtitle": "Leitura personalizada do seu desenho",
    "summaryTemplate": "{{defined}} centro(s) definido(s)  |  {{open}} centro(s) aberto(s)  |  {{channels}} canal(is) ativo(s)",
    "centers": {
      "head": "Cabeça",
      "ajna": "Ajna",
      "throat": "Garganta",
      "g": "G (Identidade)",
      "heart": "Coração (Ego)",
      "sacral": "Sacral",
      "spleen": "Baço",
      "solar": "Plexo Solar",
      "root": "Raiz"
    },
    "theory": {
      "intro": {
        "title": "O que é o Desenho Humano?",
        "content": "O Human Design é um sistema de autoconhecimento..."
      },
      "centersTheory": [
        {
          "id": "head",
          "name": "Centro da Cabeça",
          "function": "É um centro de inspiração e pressão mental.",
          "importance": "Este centro pode influenciar a maneira como as mulheres..."
        }
        // ... outros centros
      ],
      "elements": [
        { "title": "Tipo (Type)", "content": "Os Tipos são a primeira..." }
        // ... outros elementos
      ],
      "variables": [
        { "title": "Digestão (Digestion)", "content": "Refere-se à melhor maneira..." }
        // ... outras variáveis
      ],
      "gatesChannels": {
        "title": "Portões e Canais",
        "content": "Os Portões (Gates) representam..."
      },
      "closing": {
        "title": "Como usar seu Desenho Humano",
        "content": "Todos esses elementos do Human Design..."
      }
    }
  }
}
```

### 4. Passar Idioma ao Gerar PDF

**`DesenhoHumanoResults.tsx`** (linha ~285):
```typescript
await generateHDReport({
  language: i18n.language?.split('-')[0] as 'pt' | 'es' | 'en' || 'pt',
  user_name: userName,
  // ... demais campos
});
```

**`UserDetails.tsx`** (admin):
```typescript
await generateHDReport({
  language: i18n.language?.split('-')[0] as 'pt' | 'es' | 'en' || 'pt',
  // ... demais campos
});
```

### 5. Formato de Data Localizado

```typescript
// Dentro de generateHDReport.ts
const dateLocales = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US'
};

const birthDate = new Date(data.birth_date).toLocaleDateString(
  dateLocales[language], 
  { day: '2-digit', month: '2-digit', year: 'numeric' }
);
```

### 6. Nome do Arquivo PDF Traduzido

```typescript
const fileNames = {
  pt: 'Arquitetura_Pessoal',
  es: 'Arquitectura_Personal',
  en: 'Personal_Architecture'
};

const fileName = `${fileNames[language]}_${birthDateFormatted}.pdf`;
```

---

## Resumo das Mudanças

1. **Traduções**: Adicionar seção `hdPdf` completa nos 3 arquivos JSON de tradução
2. **humanDesignTheory.ts**: Refatorar para exportar funções que recebem idioma
3. **generateHDReport.ts**: 
   - Adicionar `language` na interface
   - Importar e usar traduções dinamicamente
   - Formatar datas conforme locale
   - Nomear arquivo no idioma correto
4. **Páginas de resultado**: Passar `i18n.language` ao chamar o gerador

---

## Benefícios

- PDF gerado no idioma selecionado pelo usuário
- Consistência entre a UI e o relatório baixado
- Suporte para português, espanhol e inglês
- Datas formatadas corretamente para cada locale
