## Plano aprovado (versão final)

### 1. Mudança técnica obrigatória
- Alterar `src/utils/pdfFeatureFlag.ts` para que `isReactPDFEnabled('integrated')` retorne `true` por padrão, garantindo que o gerador `@react-pdf/renderer` seja o executado em produção.
- Verificar se `IntegratedResults.tsx` (ou o ponto de entrada do botão) aguarda o carregamento completo dos dados e da imagem do BodyGraph antes de chamar `generateIntegratedPDF`. Se necessário, ajustar a ordem de loading.

### 2. Teste de estresse local
- Usar o script `scripts/test-pdf.tsx` com os dados reais da análise longa (~11.800 caracteres) recuperados do banco.
- Incluir a captura real do BodyGraph pelo fluxo do navegador: renderizar o SVG (classe `.bodygraph-svg`) e chamar `captureBodyGraphAsImage()` de `src/utils/captureBodyGraphAsImage.ts` antes de passar o `bodygraph_image` para o `IntegratedPDFDocument`.
- Se `captureBodyGraphAsImage` não puder rodar puramente em Node/Vitest, usar Playwright para renderizar o componente `HDBodyGraph`, executar a captura no navegador e injetar o data URL no teste de geração do PDF.
- Gerar o PDF localmente e revisar página por página: nenhum texto sobreposto, nenhum card cortado, rodapé sempre no fim da página.

### 3. Publicação
- Publicar o projeto para `https://mirror-app-pro.lovable.app`.
- Aguardar a conclusão do deploy.

### 4. Teste final em produção real
- Acessar `https://mirror-app-pro.lovable.app` via Playwright.
- Fazer login com um usuário de teste que possua os dados reais da análise longa (~11.800 caracteres) e os dados de HD correspondentes.
- Navegar até a página de Blueprint Pessoal (`/app/integrated-results` ou equivalente).
- Aguardar o carregamento completo dos dados e do BodyGraph.
- Clicar no botão de download do PDF e aguardar o download.
- Converter o PDF baixado em imagens página por página (`pdftoppm`).
- Revisar visualmente cada página: nenhum texto sobreposto, nenhum card cortado, rodapé nunca invadindo o conteúdo, BodyGraph presente e legível.

### 5. Critérios de entrega
- Enviar o PDF baixado de `https://mirror-app-pro.lovable.app` e as imagens de todas as páginas para conferência do usuário.
- Só considerar resolvido após aprovação visual do usuário.

### 6. Critério de parada em caso de falha
Se o teste de produção não passar limpo na primeira tentativa, **parar imediatamente** e não repetir o ciclo de publicação/teste automaticamente. Explicar ao usuário, com evidências técnicas (prints, trechos de dados, mensagens de erro), exatamente o que impediu o acerto na primeira tentativa, e aguardar instrução antes de prosseguir.