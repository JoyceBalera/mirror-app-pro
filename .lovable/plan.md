

# Plano: Correções de Formatação e Tradução do Relatório de Arquitetura Pessoal

## Resumo

Este plano aborda os problemas restantes identificados no feedback do usuário sobre o relatório PDF do Human Design, focando em:
1. Tradução das variáveis avançadas para português
2. Correção de possíveis bugs de formatação
3. Verificação da estrutura do PDF

---

## Problemas Identificados e Soluções

### 1. Termos em Inglês nas Variáveis Avançadas

Os termos `primary` nos mapas de `humanDesignVariables.ts` estão todos em inglês:
- "Appetite", "Taste", "Thirst", "Touch", "Sound", "Light" (Digestão)
- "Caves", "Markets", "Kitchens", "Mountains", "Valleys", "Shores" (Ambiente)
- "Fear", "Hope", "Desire", "Need", "Guilt", "Innocence" (Motivação)
- "Survival", "Possibility", "Power", "Wanting", "Probability", "Personal" (Perspectiva)
- "Smell", "Taste", "Outer Vision", "Inner Vision", "Feeling", "Touch" (Sentido)

Os termos de subcategoria também estão em inglês:
- "Focused", "Open" (Digestão)
- "Active", "Passive" (Ambiente)
- "Personal", "Transpersonal" (Motivação)
- "Left", "Right" (Perspectiva)

E os termos de nível:
- "Low", "High" (Digestão)

### Solução: Traduzir todos os termos para português

| Arquivo | Mudança |
|---------|---------|
| `src/utils/humanDesignVariables.ts` | Traduzir todos os mapas para português |

### Tabela de Tradução Completa

**DIGESTION_MAP:**
| Inglês | Português |
|--------|-----------|
| Appetite | Apetite |
| Taste | Paladar |
| Thirst | Sede |
| Touch | Toque |
| Sound | Som |
| Light | Luz |

**DIGESTION_TONE_MAP:**
| Inglês | Português |
|--------|-----------|
| Focused | Focado |
| Open | Aberto |

**ENVIRONMENT_MAP:**
| Inglês | Português |
|--------|-----------|
| Caves | Cavernas |
| Markets | Mercados |
| Kitchens | Cozinhas |
| Mountains | Montanhas |
| Valleys | Vales |
| Shores | Margens |

**ENVIRONMENT_TONE_MAP:**
| Inglês | Português |
|--------|-----------|
| Active | Ativo |
| Passive | Passivo |

**MOTIVATION_MAP:**
| Inglês | Português |
|--------|-----------|
| Fear | Medo |
| Hope | Esperança |
| Desire | Desejo |
| Need | Necessidade |
| Guilt | Responsabilidade |
| Innocence | Inocência |

**MOTIVATION_TONE_MAP:**
| Inglês | Português |
|--------|-----------|
| Personal | Pessoal |
| Transpersonal | Transpessoal |

**PERSPECTIVE_MAP:**
| Inglês | Português |
|--------|-----------|
| Survival | Sobrevivência |
| Possibility | Possibilidade |
| Power | Poder |
| Wanting | Anseio |
| Probability | Probabilidade |
| Personal | Pessoal |

**PERSPECTIVE_TONE_MAP:**
| Inglês | Português |
|--------|-----------|
| Left | Esquerda |
| Right | Direita |

**SENSE_MAP:**
| Inglês | Português |
|--------|-----------|
| Smell | Olfato |
| Taste | Paladar |
| Outer Vision | Visão Externa |
| Inner Vision | Visão Interna |
| Feeling | Sentimento |
| Touch | Toque |

**getDigestionLevel:**
| Inglês | Português |
|--------|-----------|
| Low | Baixo |
| High | Alto |

---

### 2. Bug "0, 1, 2..." nos Centros Energéticos

Após análise do código, NÃO identifiquei um bug óbvio no código do gerador de PDF. O código em `generateHDReport.ts` (linhas 303-335 e 350-382) usa corretamente:

```typescript
definedCenters.forEach((centerId, index) => {
  // ...
  doc.text(CENTER_NAMES[centerId] || centerId, cardX + 15, cardY + 9);
});
```

O problema pode estar na formatação do texto pela IA ou em algum outro lugar. Precisamos investigar mais a fundo se o problema persistir após as correções.

---

### 3. Espaços em Branco nas Páginas Iniciais

A função `checkAddPage` no HD não adiciona rodapé antes da nova página (diferente do Big Five). Isso pode causar quebras de página inesperadas.

**Solução**: A lógica atual deve funcionar, mas podemos melhorar o espaçamento. Por ora, vamos focar na tradução das variáveis, pois é o problema mais crítico identificado.

---

### 4. Acentuação Inconsistente

Este problema vem do prompt da IA (que o usuário vai substituir), não do código. O prompt atual em `SYSTEM_PROMPT` tem algumas seções sem acentos (ex: "Introducao", "Funcao", "Digestao"). Como o usuário mencionou que vai fornecer novos prompts, não modificaremos isso agora.

---

### 5. Sentido (Personality) vs (Design)

Já foi corrigido na última implementação - removemos "Sentido (Personality)" e mantemos apenas "Sentido".

---

## Arquivos a Modificar

### Arquivo 1: `src/utils/humanDesignVariables.ts`

Traduzir completamente todos os mapas:
- Linha 5-10: DIGESTION_MAP - traduzir `primary`
- Linha 14-16: DIGESTION_TONE_MAP - traduzir valores
- Linha 20-26: ENVIRONMENT_MAP - traduzir `primary`
- Linha 30-32: ENVIRONMENT_TONE_MAP - traduzir valores
- Linha 36-42: MOTIVATION_MAP - traduzir `primary`
- Linha 46-48: MOTIVATION_TONE_MAP - traduzir valores
- Linha 52-58: PERSPECTIVE_MAP - traduzir `primary`
- Linha 62-64: PERSPECTIVE_TONE_MAP - traduzir valores
- Linha 68-74: SENSE_MAP - traduzir `primary`
- Linha 85-87: getDigestionLevel - traduzir retorno

---

## Resumo das Ações

1. **Traduzir variáveis avançadas para português**: Modificar `humanDesignVariables.ts` para usar termos 100% em português
2. **Verificar se o bug "0, 1, 2..." persiste**: Após a correção das variáveis, verificar se o problema ainda ocorre
3. **Prompts serão atualizados depois**: Conforme solicitado, os prompts da edge function serão substituídos pelo usuário posteriormente

---

## Impacto das Mudanças

- **UI**: Os termos das variáveis avançadas aparecerão em português na página de resultados
- **PDF**: Os termos aparecerão em português no PDF
- **Edge Function**: Os dados enviados para a IA também estarão em português (já que a edge function usa os mesmos dados)

Isso resolve o problema de mistura de idiomas em toda a aplicação.

