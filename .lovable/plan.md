

# Feedback Visual Progressivo no Teste Big Five

## Problema
Com 300 perguntas de estrutura similar, os usuarios acham que as perguntas se repetem porque nao ha feedback visual claro de progresso alem do numero e da barra.

## Solucao

Implementar **duas mudancas visuais progressivas** que trabalham juntas:

### 1. Barra de progresso com cor que muda gradualmente

A barra de progresso muda de cor conforme o usuario avanca:
- 0-20% (perguntas 1-60): Carmim (cor primaria atual)
- 20-40% (perguntas 61-120): Transicao para um tom rosado
- 40-60% (perguntas 121-180): Transicao para dourado (accent)
- 60-80% (perguntas 181-240): Transicao para verde
- 80-100% (perguntas 241-300): Verde vibrante (conclusao)

A transicao e **gradual** (interpolacao de cor), nao em blocos.

### 2. Fundo da pagina muda de tom sutilmente

O fundo `gradient-hero` tera uma variacao sutil de tonalidade conforme o progresso:
- Inicio: Tom atual (off-white/mauve claro)
- Meio: Leve tom dourado quente
- Final: Tom verde suave, transmitindo "quase la!"

A mudanca e muito sutil para nao distrair, mas suficiente para o cerebro perceber que algo mudou.

### 3. Indicador de fase/bloco

Adicionar um label discreto abaixo da barra mostrando a "fase" atual:
- Fase 1 de 5, Fase 2 de 5, etc. (cada fase = 60 perguntas)
- Isso reforça visualmente que ha progresso real

## Arquivos a alterar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/app/BigFiveTest.tsx` | Calcular cor do progresso e cor de fundo com base no indice atual; passar props de cor; adicionar label de fase |
| `src/components/QuestionCard.tsx` | Receber prop de cor da barra e aplicar ao componente Progress |
| `src/components/ui/progress.tsx` | Aceitar prop `indicatorColor` para cor dinamica inline |

## Detalhes tecnicos

A interpolacao de cor sera feita com uma funcao utilitaria que recebe o percentual (0-100) e retorna a cor HSL correspondente usando interpolacao linear entre os pontos definidos. A cor e aplicada via `style` inline no indicador do Progress e no background da pagina, sem necessidade de classes CSS dinamicas.

Fases do progresso e cores (HSL):
```text
0%   -> hsl(348, 66%, 29%)  -- carmim
25%  -> hsl(20, 60%, 50%)   -- rosado/coral
50%  -> hsl(46, 64%, 52%)   -- dourado
75%  -> hsl(120, 40%, 45%)  -- verde medio
100% -> hsl(142, 55%, 42%)  -- verde vibrante
```

O fundo da pagina usara as mesmas fases mas com luminosidade alta (90-95%) para manter a sutileza.

