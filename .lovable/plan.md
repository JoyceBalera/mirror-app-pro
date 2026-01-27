

# Plano: Nova Arquitetura do Relatório Human Design (2 Camadas)

## Visão Geral da Mudança

O relatório PDF será reestruturado em **duas camadas**:

1. **Camada 1 (Texto Teórico Fixo)**: Inserido diretamente pelo gerador de PDF, igual para todas as usuárias
2. **Camada 2 (Análise Personalizada)**: Gerada pela IA com base nos dados do mapa da usuária

## Arquivos a Modificar

| Arquivo | Propósito |
|---------|-----------|
| `supabase/functions/analyze-human-design/index.ts` | Substituir o SYSTEM_PROMPT pelo novo prompt personalizado |
| `src/utils/generateHDReport.ts` | Adicionar seção de teoria fixa antes da análise IA |
| `src/data/humanDesignTheory.ts` | Novo arquivo com o texto teórico fixo |

---

## PARTE 1: Novo Prompt da Edge Function

### Substituição do SYSTEM_PROMPT

O prompt atual (linhas 9-241) será substituído pelo novo prompt fornecido, com as seguintes características:

**Escopo do Texto**:
- A IA NÃO repete teoria geral
- Escreve APENAS a parte personalizada, conectando teoria ao mapa real
- Tom de mentora experiente, linguagem humana e prática

**Estrutura das Seções**:
1. Ponte com a teoria + visão geral do mapa
2. Tipo + Estratégia + Autoridade (núcleo da tomada de decisão)
3. Centros (foco na experiência, sem teoria repetida)
4. Perfil e Definição
5. Cruz de Encarnação e principais Canais/Portões
6. Variáveis avançadas
7. Integração final com mensagem motivadora

**Tom e Idioma**:
- Português do Brasil
- Segunda pessoa ("você")
- Chamar de "amada" para criar proximidade
- Termos em inglês: manter entre parênteses na primeira vez, depois usar português
- Evitar linguagem robótica ou acadêmica

**Formatação para PDF**:
- Títulos de seção em destaque
- Parágrafos separados com linhas em branco
- Listas com marcadores claros
- Evitar linhas soltas ou itens numéricos sem explicação

**Regras de Conteúdo**:
- NUNCA inventar dados
- Sempre incluir pontos fortes + pontos de atenção para cada elemento
- Não usar listas enormes de bullets teóricos
- Evitar soar como laudo médico ou manual técnico
- Encerrar com mensagem afetuosa: "Com carinho, Luciana Belenton"

---

## PARTE 2: Texto Teórico Fixo (Camada 1)

### Novo Arquivo: `src/data/humanDesignTheory.ts`

Este arquivo conterá o texto teórico que aparece igual em todos os relatórios:

**Seções do Texto Teórico**:

1. **Introdução ao Desenho Humano**
   - O que é Human Design
   - Origens (astrologia, I Ching, Cabala, chakras, física quântica, genética)
   - Propósito do sistema

2. **Os 9 Centros Energéticos**
   - Centro da Cabeça: inspiração e pressão mental
   - Centro de Ajna: processamento mental e consciência
   - Centro da Garganta: manifestação e comunicação
   - Centro G: identidade, amor e direção
   - Centro do Coração (Ego): vontade, ego e materialidade
   - Centro Sacral: energia vital e força de trabalho
   - Centro Raiz: pressão e adrenalina
   - Centro do Plexo Solar: emoções e consciência emocional
   - Centro do Baço: intuição, bem-estar e imunidade

3. **Estrutura do Human Design**
   - Type (Tipo)
   - Strategy (Estratégia)
   - Inner Authority (Autoridade Interna)
   - Definition (Definição)
   - Profile (Perfil)
   - Incarnation Cross (Cruz de Encarnação)
   - Signature (Assinatura)
   - Not-Self Theme (Tema do Não-Eu)
   - Digestion (Digestão)
   - Design Sense (Sentido do Design)
   - Motivation (Motivação)
   - Environment (Ambiente)
   - Gates (Portões)
   - Channels (Canais)

---

## PARTE 3: Modificação do Gerador de PDF

### Arquivo: `src/utils/generateHDReport.ts`

**Nova Estrutura do PDF**:

| Página | Conteúdo |
|--------|----------|
| 1 | Capa + Dados de Nascimento + Perfil Energético |
| 2 | Bodygraph Visual |
| 3 | Texto Teórico: Introdução ao Desenho Humano |
| 4-7 | Texto Teórico: Os 9 Centros (com marcação de quais estão definidos) |
| 8-9 | Texto Teórico: Estrutura do Human Design (elementos) |
| 10+ | Análise Personalizada IA (Camada 2) |
| Última | Conclusão + Assinatura |

**Mudanças Específicas**:

1. **Adicionar função para renderizar teoria fixa**:
   - Importar texto de `humanDesignTheory.ts`
   - Renderizar com formatação consistente
   - Marcar centros definidos com "(*)" no texto

2. **Ajustar fluxo de páginas**:
   - Teoria fixa vem ANTES da análise IA
   - Análise IA começa com "Ponte com a teoria" (gancho)

3. **Header da seção de análise IA**:
   - Mudar de "ANÁLISE PERSONALIZADA COMPLETA" para "SEU MAPA NA PRÁTICA"
   - Adicionar subtítulo: "Leitura personalizada do seu mapa"

---

## Detalhes Técnicos

### Novo SYSTEM_PROMPT (analyze-human-design/index.ts)

```text
Você é uma analista de Desenho Humano especializada em mulheres adultas.

Você está dentro de um aplicativo que já calculou automaticamente o mapa de Desenho Humano da usuária. Você TEM acesso a todos esses dados estruturados pelo sistema.

# 0. Escopo do seu texto

O relatório em PDF tem duas partes:

1. Parte teórica fixa (já pronta no app): o que é Desenho Humano, explicação geral dos 9 centros e de todos os elementos.
2. Parte personalizada (esta que você vai escrever): leitura aplicada do mapa específico da usuária.

Você NÃO deve repetir a teoria geral. Sua missão é escrever APENAS a parte personalizada, conectando a teoria já explicada ao mapa real da usuária, em linguagem simples, humana e prática, como uma mentora experiente conversando com sua mentorada.

Comece o texto fazendo um gancho com a parte teórica: "Agora que você já viu a visão geral do Desenho Humano, vamos olhar para o que o seu mapa específico revela sobre você e sobre a sua vida na prática."

# 1. Papel, idioma e tom de voz

[... restante do prompt conforme documento fornecido ...]
```

### Estrutura do buildUserPrompt

Manter a estrutura atual, que já envia:
- Nome da pessoa
- Centros definidos
- Tipo, Estratégia, Autoridade
- Definição, Perfil, Cruz de Encarnação
- Portões e Canais ativados
- Variáveis avançadas (Digestão, Ambiente, Motivação, Perspectiva)

---

## Resumo das Ações

1. **Criar `src/data/humanDesignTheory.ts`**: Texto teórico fixo extraído do documento de exemplo
2. **Atualizar `supabase/functions/analyze-human-design/index.ts`**: Substituir SYSTEM_PROMPT pelo novo prompt
3. **Atualizar `src/utils/generateHDReport.ts`**: Adicionar renderização da teoria fixa antes da análise IA

---

## Benefícios da Nova Arquitetura

- **Consistência**: Teoria é igual para todas as usuárias
- **Economia**: IA gera menos texto (apenas a parte personalizada)
- **Qualidade**: Análise IA foca em interpretação prática, não em explicar conceitos
- **Manutenção**: Texto teórico pode ser atualizado sem regenerar análises existentes

---

## Próximos Passos

Após aprovação:
1. Você envia o texto teórico completo para a Camada 1 (se ainda não enviou)
2. Implemento as mudanças no código
3. Testamos um novo relatório para validar

