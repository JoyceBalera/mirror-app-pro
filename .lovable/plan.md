# Correção dos Geradores de PDF (Big Five, Arquitetura Pessoal e Blueprint Pessoal)

## Objetivo
Eliminar os três erros visuais nos relatórios PDF (texto sobreposto, cards quebrados/cortados e rodapé sobreposto ao conteúdo) migrando todos os geradores de PDF do jsPDF para `@react-pdf/renderer`, com uma chave de alternância para poder voltar ao gerador antigo rapidamente se necessário.

## Escopo
A correção cobre os três relatórios:
1. Mapa de Personalidade (Big Five isolado)
2. Arquitetura Pessoal (Desenho Humano isolado) — relatório do print original
3. Blueprint Pessoal (relatório integrado Big Five + Desenho Humano)

## Problemas a resolver
- Texto sobreposto (duas camadas de texto na mesma posição).
- Cards quebrados ou cortados entre páginas.
- Rodapé de uma página sobrepondo conteúdo da página seguinte.
- Captura do bodygraph aconcepts only after the image is fully loaded, not after a single animation frame.

## Solução proposta

### 1. Instalação e configuração
- Instalar `@react-pdf/renderer`.
- Criar componentes React para cada relatório usando a API do `@react-pdf/renderer` (`Document`, `Page`, `View`, `Text`, `Image`, `StyleSheet`).
- Garantir que estilos usem o design system do projeto (tokens semânticos, sem cores hardcoded).

### 2. Captura do Bodygraph
- O bodygraph continua sendo renderizado em um elemento HTML oculto e capturado via `html2canvas`.
- Substituir o `requestAnimationFrame` único por uma espera real: o PDF só é gerado depois que o bodygraph dispara o evento de carregado (imagem pronta, fontes aplicadas, layout estável).
- Se o evento nativo não for confiável, usar `Promise.all` combinando:
  - `img.decode()` para imagens internas,
  - `document.fonts.ready`,
  - e um timeout de segurança curto.

### 3. Layout paginado correto
- Usar `fixed`/`absolute` apenas para cabeçalho e rodapé, nunca para blocos de conteúdo.
- Quebras de página controladas com `<Page break>` e `wrap={false}` em cards/seções.
- Alturas dinâmicas: calcular a altura de cada seção antes de decidir onde quebrar.
- Margens e espaçamento entre páginas ajustados para que o rodapé de uma página nunca sobreponha o conteúdo da seguinte.

### 4. Texto longo e variável
- Usar componentes flexíveis do `@react-pdf/renderer` que quebram linhas e páginas automaticamente.
- Testar com textos longos em todas as seções do Desenho Humano (cenário onde o erro aparece).
- Testar com texto acentuado antes de considerar pronto; se o Helvetica falhar, registrar uma fonte customizada (ex: DejaVu Sans ou Inter) no `Font.register`.

### 5. Chave de alternância (feature flag)
- Adicionar uma chave de configuração (ex: `VITE_USE_REACT_PDF=true` ou uma entrada em `localStorage`/feature flag) que permite ligar/desligar o novo gerador.
- Quando desligada, o sistema volta a usar o gerador jsPDF antigo sem alterações.
- A chave será aplicada nos três relatórios, permitindo rollback rápido por relatório ou globalmente.

### 6. Testes e QA
- Gerar PDFs de cada um dos três relatórios com perfis reais e textos longos.
- Converter páginas para imagens (`pdftoppm`) e inspecionar visualmente:
  - Sem texto sobreposto.
  - Sem cards cortados.
  - Sem rodapé sobreposto.
  - Margens respeitadas.
- Testar com a chave desligada para garantir que o gerador antigo continua funcionando.

## Entregáveis
- Novos componentes de PDF em `@react-pdf/renderer` para Big Five, HD e relatório integrado.
- Hook/utilitário de captura do bodygraph com espera real de carregamento.
- Chave de alternância documentada no código.
- Testes visuais dos PDFs gerados em cenários de texto longo.

## Não inclui
- Alterações no conteúdo dos relatórios (textos, scores, interpretações).
- Alterações no fluxo de compra ou acesso aos relatórios.
- Backend: continua sendo client-side, sem novo código de servidor.