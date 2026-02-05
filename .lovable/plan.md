

# Plano: Reduzir Repetição de "Minha Querida" no Blueprint

## Problema Identificado

O prompt do Blueprint (`analyze-integrated`) não tem instruções claras sobre **moderação no uso de expressões carinhosas**. Isso faz com que a IA repita "minha querida", "querida", "amada" muitas vezes, tornando o texto cansativo.

---

## Solução

Adicionar instruções explícitas no prompt para:
1. Usar termos carinhosos no **máximo 2-3 vezes** no texto inteiro
2. Preferir o uso de "você" na maioria das vezes
3. Reservar "querida" ou "amada" apenas para momentos de maior impacto emocional (abertura e fechamento)

---

## Arquivo a Modificar

`supabase/functions/analyze-integrated/index.ts`

---

## Mudanças no Prompt

### Adicionar nas 3 versões (PT, ES, EN):

**Português:**
```
IMPORTANTE - USO DE EXPRESSÕES CARINHOSAS:
- Use "querida" ou "amada" no MÁXIMO 2-3 vezes em todo o texto
- Prefira "você" na grande maioria das frases
- Reserve termos carinhosos para a abertura (início) e fechamento (final)
- NÃO repita "minha querida" em cada parágrafo - isso torna o texto cansativo
```

**Espanhol:**
```
IMPORTANTE - USO DE EXPRESIONES CARIÑOSAS:
- Usa "querida" o "amada" como MÁXIMO 2-3 veces en todo el texto
- Prefiere "tú" en la gran mayoría de las frases
- Reserva términos cariñosos para la apertura (inicio) y cierre (final)
- NO repitas "mi querida" en cada párrafo - esto hace el texto cansador
```

**Inglês:**
```
IMPORTANT - USE OF ENDEARING TERMS:
- Use "dear one" or "dear" at MAXIMUM 2-3 times in the entire text
- Prefer "you" in the vast majority of sentences
- Reserve endearing terms for the opening (beginning) and closing (end)
- DO NOT repeat "my dear" in every paragraph - this makes the text tiring
```

---

## Resultado Esperado

- Texto mais profissional e fluido
- Termos de carinho usados estrategicamente apenas na abertura e fechamento
- Leitura menos repetitiva e cansativa
