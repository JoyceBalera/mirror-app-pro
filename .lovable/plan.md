

# Nova Pagina Admin: Exportar Prompts em PDF

## Objetivo
Criar uma pagina acessivel em `/admin/prompts` que exibe e exporta um PDF completo com todos os prompts de IA usados nas 3 edge functions (`analyze-personality`, `analyze-human-design`, `analyze-integrated`), nas 3 versoes linguisticas (PT, EN, ES).

## Estrutura do PDF

O PDF tera as seguintes secoes:

1. **Capa** - "Documentacao de Prompts - Edge Functions" com data de geracao
2. **Indice** - Lista das 3 funcoes e idiomas
3. **analyze-personality** (Mapa de Personalidade)
   - System Prompt PT (~110 linhas)
   - System Prompt EN (~100 linhas)
   - System Prompt ES (~100 linhas)
   - User Prompt template (PT/EN/ES)
4. **analyze-human-design** (Arquitetura Pessoal)
   - System Prompt PT (~250 linhas)
   - System Prompt ES (~80 linhas)
   - System Prompt EN (~70 linhas)
   - User Prompt template (buildUserPrompt labels PT/EN/ES)
5. **analyze-integrated** (Blueprint Pessoal)
   - System Prompt PT (~120 linhas)
   - System Prompt ES (~90 linhas)
   - System Prompt EN (~90 linhas)
   - User Prompt template (PT/EN/ES)

## Implementacao

### 1. Novo arquivo: `src/pages/admin/Prompts.tsx`

- Pagina com visualizacao dos prompts organizados por funcao e idioma usando Tabs (funcao) e sub-Tabs (idioma)
- Botao "Exportar PDF" que gera o documento completo usando jsPDF (ja instalado)
- Os prompts serao armazenados como constantes diretamente no arquivo (extraidos das edge functions), evitando chamadas de rede
- Cada prompt sera exibido em um bloco `<pre>` com scroll e fundo cinza claro

### 2. Registrar rota em `src/App.tsx`

- Adicionar rota `/admin/prompts` protegida com `AuthGuard requiredRole="admin"` e `AdminLayout`

### 3. Adicionar link no menu admin em `src/components/layout/AdminLayout.tsx`

- Novo item de navegacao "Prompts" com icone `FileText` do lucide-react

### 4. Geracao do PDF (`src/utils/generatePromptsReport.ts`)

- Utilizar jsPDF para gerar o documento
- Paginar automaticamente o texto longo dos prompts
- Usar fonte monospace (Courier) para o conteudo dos prompts
- Incluir cabecalho com nome da funcao/idioma e rodape com numero de pagina
- Seguir o padrao visual dos outros PDFs (cores carmim/gold do brand)

### 5. Dados dos prompts (`src/data/edgeFunctionPrompts.ts`)

- Arquivo centralizado com todos os prompts extraidos das 3 edge functions
- Estrutura tipada por funcao e idioma
- Inclui system prompts, user prompt templates e metadados (modelo usado, etc.)

## Arquivos a criar/editar

| Arquivo | Acao |
|---------|------|
| `src/data/edgeFunctionPrompts.ts` | Criar - dados dos prompts |
| `src/utils/generatePromptsReport.ts` | Criar - gerador de PDF |
| `src/pages/admin/Prompts.tsx` | Criar - pagina admin |
| `src/App.tsx` | Editar - adicionar rota |
| `src/components/layout/AdminLayout.tsx` | Editar - adicionar nav item |

