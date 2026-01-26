
## Plano: Página de Validação Administrativa Big Five

### Objetivo
Criar uma nova página administrativa `/admin/validacao` que permita comparar os cálculos do sistema com exemplos conhecidos da planilha Excel v2.2, facilitando auditorias e validação da lógica de scoring.

---

### Funcionalidades da Página

**1. Simulador de Respostas**
- Interface para inserir respostas específicas para qualquer questão
- Modo "preencher todas" com valor fixo (ex: todas = 3)
- Modo "padrão de teste" com valores predefinidos da planilha

**2. Comparação de Cálculos**
- Exibir scores calculados pelo sistema em tempo real
- Campo para inserir valores esperados do Excel
- Indicador visual de "Match" ou "Divergência" para cada valor

**3. Casos de Teste Predefinidos**
- Caso 1: Todas respostas = 1 (mínimo)
- Caso 2: Todas respostas = 5 (máximo)
- Caso 3: Todas respostas = 3 (médio)
- Caso 4: Padrão específico da planilha Excel (se disponível)

**4. Validação da Lógica de Inversão**
- Seção mostrando questões com `keyed: minus`
- Demonstrar o cálculo `6 - score` para cada uma
- Comparar resultado antes/depois da inversão

**5. Resumo de Integridade**
- Total de questões por traço (deve ser 60)
- Total de questões por faceta (deve ser 10)
- Contagem de questões `minus` vs `plus`
- Validação de IDs únicos

---

### Estrutura Técnica

**Novo Arquivo**: `src/pages/admin/Validacao.tsx`

```text
┌─────────────────────────────────────────────────────────────────┐
│ [Header] Validação de Cálculos - Big Five                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌────────────────────────────────┐   │
│  │ CASOS DE TESTE       │  │ RESULTADO DA VALIDAÇÃO         │   │
│  │ ○ Todas = 1          │  │                                │   │
│  │ ○ Todas = 3          │  │  Neuroticismo: 180  ✓ Match   │   │
│  │ ○ Todas = 5          │  │  Extroversão: 180   ✓ Match   │   │
│  │ ○ Customizado        │  │  Abertura: 180      ✓ Match   │   │
│  │                      │  │  ...                           │   │
│  └──────────────────────┘  └────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ INTEGRIDADE DO QUESTIONÁRIO                              │   │
│  │                                                          │   │
│  │  ✓ 300 questões totais                                   │   │
│  │  ✓ 60 questões por traço                                 │   │
│  │  ✓ 10 questões por faceta                                │   │
│  │  ✓ 150 questões keyed:minus, 150 keyed:plus              │   │
│  │  ✓ IDs únicos                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ DETALHES DE INVERSÃO                                     │   │
│  │                                                          │   │
│  │  N1_1: "Quase nunca me sinto..." (keyed:minus)          │   │
│  │  Resposta: 2 → Inversão: 6-2 = 4                        │   │
│  │  ...                                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Alterações Necessárias

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Validacao.tsx` | Criar novo arquivo |
| `src/App.tsx` | Adicionar rota `/admin/validacao` |
| `src/components/layout/AdminLayout.tsx` | Adicionar item no menu de navegação |

---

### Seção Técnica

**Lógica de Validação**:

1. **Caso "Todas = 3"** (valor neutro):
   - Para questões `keyed: plus`: score = 3
   - Para questões `keyed: minus`: score = 6 - 3 = 3
   - Resultado esperado por traço: 60 questões × 3 = **180**
   - Resultado esperado por faceta: 10 questões × 3 = **30**

2. **Caso "Todas = 1"** (mínimo bruto):
   - `keyed: plus`: 1 ponto
   - `keyed: minus`: 6 - 1 = 5 pontos
   - Por traço: (30 × 1) + (30 × 5) = 30 + 150 = **180**
   - Por faceta: (5 × 1) + (5 × 5) = 5 + 25 = **30**

3. **Caso "Todas = 5"** (máximo bruto):
   - `keyed: plus`: 5 pontos
   - `keyed: minus`: 6 - 5 = 1 ponto
   - Por traço: (30 × 5) + (30 × 1) = 150 + 30 = **180**
   - Por faceta: (5 × 5) + (5 × 1) = 25 + 5 = **30**

**Componentes Utilizados**:
- `Card`, `CardHeader`, `CardContent` (shadcn/ui)
- `Badge` para indicadores de status
- `RadioGroup` para seleção de casos de teste
- `Table` para exibir comparação de scores
- Funções existentes de `calculateScore`, `getTraitClassification`, `getFacetClassification`

---

### Resultado Esperado

- Página acessível apenas para administradores
- Validação automática dos cálculos ao selecionar um caso de teste
- Indicadores visuais claros de conformidade ou divergência
- Ferramenta de auditoria para futuras atualizações do questionário
