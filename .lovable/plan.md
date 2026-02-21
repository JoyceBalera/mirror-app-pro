

# Correcao: Garantir que todas as 300 respostas sejam salvas

## Problema Identificado

A pergunta **O4_7** (Abertura a Experiencia, faceta 4, questao 7) nao foi salva no banco de dados para a sessao da Adriana Figueiredo (`df347468-eb0e-4cab-aed3-214ae5f1af0c`). Resultado: apenas 299 de 300 respostas foram processadas.

### Causa Raiz

No arquivo `src/pages/app/BigFiveTest.tsx`, a funcao `handleAnswer` salva cada resposta no banco de dados de forma assincrona, mas **falhas sao ignoradas silenciosamente**:

```text
try {
  await supabase.from('test_answers').insert({...});
} catch (error) {
  console.error('Error saving answer:', error);  // <-- silencioso!
}
```

Se houver uma falha de rede momentanea, a resposta e perdida e o usuario avanca para a proxima questao sem saber que houve erro.

## Plano de Correcao

### 1. Adicionar retry automatico no salvamento de respostas

Quando o `insert` falhar, tentar novamente ate 2 vezes antes de desistir. Isso protege contra falhas de rede momentaneas.

### 2. Bloquear avanco se o salvamento falhar definitivamente

Se apos os retries a resposta nao for salva, exibir um toast de erro e **nao avancar** para a proxima questao, permitindo que o usuario tente novamente.

### 3. Adicionar validacao antes de completar o teste

Antes de chamar `completeTest()`, verificar se o numero de respostas salvas no banco corresponde ao total de questoes. Se faltar alguma, tentar salvar as pendentes.

### 4. Corrigir a resposta faltante da Adriana (acao manual)

Como a Adriana ja completou o teste e nao temos como recuperar a resposta original da O4_7, sera necessario decidir como tratar. Opcoes:
- Manter como esta (299/300 - impacto minimo no score)
- Inserir manualmente um valor neutro (3) para completar os dados

## Detalhes Tecnicos

### Arquivo: `src/pages/app/BigFiveTest.tsx`

**Mudanca 1 - Funcao de retry:**
Criar uma funcao auxiliar `saveAnswerWithRetry` que tenta o insert ate 3 vezes com intervalo de 1 segundo.

**Mudanca 2 - handleAnswer:**
Substituir o bloco try/catch atual por uma chamada a `saveAnswerWithRetry`. Se falhar apos todos os retries:
- Exibir toast de erro
- Nao incrementar `currentQuestionIndex`
- Remover a resposta do array local `answers`

**Mudanca 3 - Validacao pre-completar:**
Antes de chamar `completeTest()`, contar as respostas salvas no banco e comparar com `questions.length`. Se houver discrepancia, tentar re-salvar as respostas faltantes.

