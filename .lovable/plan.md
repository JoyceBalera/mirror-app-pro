

# Plano: Internacionalizar Blueprint e Formulario de Desenho Humano

## Problema Identificado

Duas telas inteiras ainda tem todo o texto em portugues hardcoded, sem usar o sistema de traducao (`t()`):

1. **Tela do Blueprint Pessoal** (`src/pages/app/IntegratedResults.tsx`) - ~40 strings em portugues
2. **Formulario do Desenho Humano** (`src/pages/app/DesenhoHumanoTest.tsx`) - ~25 strings em portugues

---

## Mudancas por Arquivo

### 1. Arquivos de traducao (3 arquivos)

**`src/locales/pt/translation.json`** - Adicionar namespace `integratedResults` e `humanDesignForm`

**`src/locales/en/translation.json`** - Mesmas chaves em ingles

**`src/locales/es/translation.json`** - Mesmas chaves em espanhol

Chaves a adicionar para **Blueprint (integratedResults)**:
- `title` - "Blueprint Pessoal" / "Personal Blueprint" / "Blueprint Personal"
- `subtitle` - descricao
- `back` - "Voltar" / "Back" / "Volver"
- `personalityMap` - "Mapa de Personalidade"
- `personalArchitecture` - "Arquitetura Pessoal"
- `testCompleted` - "Teste concluido"
- `testPending` - "Teste pendente"
- `mapCalculated` - "Mapa calculado"
- `mapPending` - "Mapa pendente"
- `testsIncomplete` - titulo e descricao
- `goToDashboard` - "Ir para o Dashboard"
- `yourIntegratedAnalysis` - "Sua Analise Integrada"
- `downloadPdf` - "Baixar PDF"
- `regenerate` - "Regenerar"
- `generateBlueprint` - titulo e descricao do botao de gerar
- `generating` - "Gerando analise..."
- `generateReport` - "Gerar Relatorio Integrado"
- Toast messages (sucesso/erro para geracao e PDF)
- `dataIncomplete` - mensagem de dados incompletos

Chaves a adicionar para **Formulario HD (humanDesignForm)**:
- `pageTitle` - "Desenho Humano - Dados de Nascimento"
- `pageSubtitle` - descricao
- `requiredData` - "DADOS NECESSARIOS"
- `birthDate` - "Data de Nascimento"
- `birthTime` - "Hora de Nascimento"
- `birthLocation` - "Local de Nascimento"
- Labels e placeholders dos campos
- Mensagens de validacao (obrigatorio, futuro, minimo caracteres)
- `birthCertificateHint` - "Verifique sua certidao de nascimento"
- `typeYourCity` - "Digite sua cidade..."
- `selectYourCity` - "Comece a digitar..."
- `backToDashboard` - "Voltar ao Dashboard"
- `back` - "Voltar"
- `calculating` - "Calculando..."
- `generateMyMap` - "GERAR MEU MAPA"
- Loading messages (coordenadas, fuso, posicoes, salvando)
- Toast messages (sucesso, erros de auth, calculo)
- `demoMode` - mensagem do modo demo
- `testInProgress` / `finishFirst` - mensagens de bloqueio

---

### 2. `src/pages/app/IntegratedResults.tsx`

**O que muda:** Substituir TODOS os textos hardcoded por chamadas `t()`

- Adicionar `const { t } = useTranslation();` (ja tem `i18n` importado)
- Substituir ~40 strings por `t('integratedResults.xxx')`

Exemplos de substituicoes:
```
"Voltar" -> t('integratedResults.back')
"Blueprint Pessoal" -> t('integratedResults.title')
"Mapa de Personalidade" -> t('integratedResults.personalityMap')
"Teste concluído" -> t('integratedResults.testCompleted')
"Baixar PDF" -> t('integratedResults.downloadPdf')
"Gerando análise..." -> t('integratedResults.generating')
```

---

### 3. `src/pages/app/DesenhoHumanoTest.tsx`

**O que muda:** Substituir TODOS os textos hardcoded por chamadas `t()`

- Adicionar `import { useTranslation } from "react-i18next";`
- Adicionar `const { t } = useTranslation();`
- Substituir ~25 strings por `t('humanDesignForm.xxx')`

Exemplos de substituicoes:
```
"Data de nascimento é obrigatória" -> t('humanDesignForm.birthDateRequired')
"Calculando..." -> t('humanDesignForm.calculating')
"GERAR MEU MAPA ✨" -> t('humanDesignForm.generateMyMap')
"Buscando coordenadas do local..." -> t('humanDesignForm.searchingCoordinates')
```

---

## Resumo

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| `src/locales/pt/translation.json` | +2 namespaces (~65 chaves) |
| `src/locales/en/translation.json` | +2 namespaces (~65 chaves) |
| `src/locales/es/translation.json` | +2 namespaces (~65 chaves) |
| `src/pages/app/IntegratedResults.tsx` | ~40 strings substituidas por `t()` |
| `src/pages/app/DesenhoHumanoTest.tsx` | ~25 strings substituidas por `t()` |

**Total: 5 arquivos editados, nenhuma migration SQL**

---

## O que NAO muda

- Nenhuma logica de negocio e alterada
- Nenhuma tabela ou edge function e modificada
- O DesenhoHumanoResults.tsx ja esta internacionalizado (usa `t()`)
- Os PDFs ja tem internacionalizacao propria
- O AnalysisSections.tsx ja usa `t()`

