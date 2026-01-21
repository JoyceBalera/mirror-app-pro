import jsPDF from 'jspdf';
import type { AdvancedVariables } from './humanDesignVariables';

export interface HDReportData {
  birth_date: string;
  birth_time: string;
  birth_location: string;
  energy_type: string;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  incarnation_cross: string | null;
  centers: Record<string, boolean>;
  channels: Array<{ id: string; name?: string; isComplete?: boolean }>;
  personality_activations: any[];
  design_activations: any[];
  variables: AdvancedVariables;
  ai_analysis_full: string;
  bodygraph_image?: string;
}

// Cores da paleta Luciana - Sincronizadas com pdfGenerator
const COLORS = {
  carmim: [123, 25, 43] as [number, number, number],
  carmimDark: [90, 18, 32] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  goldLight: [232, 205, 125] as [number, number, number],
  offWhite: [247, 243, 239] as [number, number, number],
  dustyMauve: [191, 175, 178] as [number, number, number],
  darkText: [51, 51, 51] as [number, number, number],
  lightText: [120, 120, 120] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [34, 139, 34] as [number, number, number],
  warning: [205, 133, 63] as [number, number, number],
};

// Nomes dos centros em português
const CENTER_NAMES: Record<string, string> = {
  head: 'Cabeça',
  ajna: 'Ajna',
  throat: 'Garganta',
  g: 'G (Identidade)',
  heart: 'Coração (Ego)',
  sacral: 'Sacral',
  spleen: 'Baço',
  solar: 'Plexo Solar',
  root: 'Raiz',
};

// Função para limpar markdown
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[\s]*[-]{2,}[\s]*$/gm, '')
    .replace(/^[\s]*[•]{1,3}[\s]*$/gm, '')
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export async function generateHDReport(data: HDReportData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentPage = 1;

  // ============ HELPER: Rodapé elegante ============
  const addFooter = (pageNum: number, totalPages: number) => {
    // Linha dourada
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Fundo off-white
    doc.setFillColor(...COLORS.offWhite);
    doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
    
    // Número da página
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Crédito
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.text('Criado por Luciana Belenton', pageWidth / 2, pageHeight - 5, { align: 'center' });
  };

  // ============ HELPER: Header com gradiente ============
  const drawGradientHeader = (title: string, subtitle?: string): number => {
    const headerHeight = subtitle ? 45 : 35;
    const gradientSteps = 20;
    const stepHeight = headerHeight / gradientSteps;
    
    // Simular gradiente
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = COLORS.carmim[0] + (COLORS.carmimDark[0] - COLORS.carmim[0]) * ratio;
      const g = COLORS.carmim[1] + (COLORS.carmimDark[1] - COLORS.carmim[1]) * ratio;
      const b = COLORS.carmim[2] + (COLORS.carmimDark[2] - COLORS.carmim[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, i * stepHeight, pageWidth, stepHeight + 0.5, 'F');
    }
    
    // Título
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, subtitle ? 22 : 20, { align: 'center' });
    
    // Subtítulo
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.goldLight);
      doc.text(subtitle, pageWidth / 2, 32, { align: 'center' });
    }
    
    // Linha decorativa dourada
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(1);
    doc.line(margin + 30, headerHeight - 3, pageWidth - margin - 30, headerHeight - 3);
    
    return headerHeight + 10;
  };

  // ============ HELPER: Verificar nova página ============
  const checkAddPage = (neededSpace: number, yPos: number): number => {
    if (yPos + neededSpace > pageHeight - 30) {
      doc.addPage();
      currentPage++;
      return 25;
    }
    return yPos;
  };

  // ============ PÁGINA 1 - CAPA ============
  let yPos = drawGradientHeader("ARQUITETURA PESSOAL", "Desenho Humano Personalizado");
  
  // Box introdutório
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkText);
  doc.setFont('helvetica', 'normal');
  
  const introText = "Este relatório apresenta sua Arquitetura Pessoal completa, um mapa único da sua energia vital baseado no Sistema Human Design. Descubra como você foi desenhado para tomar decisões, interagir com o mundo e viver com autenticidade.";
  const introLines = doc.splitTextToSize(introText, contentWidth - 20);
  doc.text(introLines, margin + 10, yPos + 12);
  
  yPos += 45;
  
  // Dados de nascimento
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text('DADOS DE NASCIMENTO', margin + 10, yPos + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.setFontSize(10);
  
  const birthDate = new Date(data.birth_date).toLocaleDateString('pt-BR');
  doc.text(`Data: ${birthDate}`, margin + 10, yPos + 20);
  doc.text(`Horário: ${data.birth_time}`, margin + 10, yPos + 28);
  doc.text(`Local: ${data.birth_location}`, margin + 10, yPos + 36);
  
  yPos += 50;
  
  // Seção: Perfil Energético
  doc.setFillColor(...COLORS.carmim);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU PERFIL ENERGÉTICO', margin + 5, yPos + 7);
  yPos += 18;
  
  // Grid de informações (2 colunas)
  const infoItems = [
    { label: 'Tipo Energético', value: data.energy_type },
    { label: 'Estratégia', value: data.strategy || 'N/A' },
    { label: 'Autoridade', value: data.authority || 'N/A' },
    { label: 'Perfil', value: data.profile || 'N/A' },
    { label: 'Definição', value: data.definition || 'N/A' },
    { label: 'Cruz de Encarnação', value: data.incarnation_cross || 'N/A' },
  ];
  
  const colWidth = contentWidth / 2;
  infoItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xPos = margin + col * colWidth;
    const itemY = yPos + row * 18;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(item.label, xPos, itemY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    
    // Truncar valores longos
    const maxWidth = colWidth - 10;
    let displayValue = item.value;
    while (doc.getTextWidth(displayValue) > maxWidth && displayValue.length > 3) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    doc.text(displayValue, xPos, itemY + 6);
  });
  
  // ============ PÁGINA 2 - BODYGRAPH ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("SEU BODYGRAPH VISUAL");
  
  // Calcular dados dos centros
  const definedCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => centerId);
  const openCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => !isDefined)
    .map(([centerId]) => centerId);
  const activeChannels = (data.channels || []).filter((ch: any) => ch.isComplete);
  
  // Imagem do Bodygraph
  if (data.bodygraph_image) {
    try {
      const imgWidth = 100;
      const imgHeight = 188;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(data.bodygraph_image, 'PNG', imgX, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 10;
    } catch (error) {
      console.error('Erro ao adicionar imagem do Bodygraph:', error);
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.darkText);
      doc.text('Seu Bodygraph está disponível na plataforma online.', margin + 10, yPos);
      yPos += 25;
    }
  } else {
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.text('Seu Bodygraph está disponível na plataforma online.', margin + 10, yPos);
    yPos += 25;
  }
  
  // Resumo visual
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text(`${definedCenters.length} centro(s) definido(s)  |  ${openCenters.length} centro(s) aberto(s)  |  ${activeChannels.length} canal(is) ativo(s)`, pageWidth / 2, yPos, { align: 'center' });
  
  // ============ PÁGINA 3 - CENTROS ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("SEUS CENTROS ENERGÉTICOS");
  
  // Centros Definidos
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.success);
  doc.text('Centros Definidos', margin, yPos + 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.lightText);
  doc.text('(Fontes de Energia Consistente)', margin + 52, yPos + 8);
  yPos += 15;
  
  if (definedCenters.length > 0) {
    const cardWidth = (contentWidth - 10) / 2;
    definedCenters.forEach((centerId, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cardX = margin + col * (cardWidth + 10);
      const cardY = yPos + row * 18;
      
      // Card do centro
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(cardX, cardY, cardWidth, 14, 2, 2, 'F');
      
      // Badge verde
      doc.setFillColor(...COLORS.success);
      doc.roundedRect(cardX + 3, cardY + 3, 8, 8, 1, 1, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('✓', cardX + 5.5, cardY + 8.5);
      
      // Nome do centro
      doc.setTextColor(...COLORS.darkText);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(CENTER_NAMES[centerId] || centerId, cardX + 15, cardY + 9);
    });
    yPos += Math.ceil(definedCenters.length / 2) * 18 + 10;
  } else {
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(10);
    doc.text('Nenhum centro definido (Reflector)', margin, yPos);
    yPos += 15;
  }
  
  // Centros Abertos
  doc.setDrawColor(...COLORS.gold);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.warning);
  doc.text('Centros Abertos', margin, yPos + 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.lightText);
  doc.text('(Áreas de Sabedoria e Aprendizado)', margin + 48, yPos + 8);
  yPos += 15;
  
  if (openCenters.length > 0) {
    const cardWidth = (contentWidth - 10) / 2;
    openCenters.forEach((centerId, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cardX = margin + col * (cardWidth + 10);
      const cardY = yPos + row * 18;
      
      // Card do centro
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(cardX, cardY, cardWidth, 14, 2, 2, 'F');
      
      // Badge laranja
      doc.setFillColor(...COLORS.warning);
      doc.roundedRect(cardX + 3, cardY + 3, 8, 8, 1, 1, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('○', cardX + 5, cardY + 8.5);
      
      // Nome do centro
      doc.setTextColor(...COLORS.darkText);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(CENTER_NAMES[centerId] || centerId, cardX + 15, cardY + 9);
    });
    yPos += Math.ceil(openCenters.length / 2) * 18 + 15;
  } else {
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(10);
    doc.text('Todos os centros definidos', margin, yPos);
    yPos += 15;
  }
  
  // ============ SEÇÃO: CANAIS ============
  yPos = checkAddPage(60, yPos);
  
  doc.setDrawColor(...COLORS.gold);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text('Seus Canais de Poder', margin, yPos + 8);
  yPos += 15;
  
  if (activeChannels.length > 0) {
    activeChannels.forEach((ch: any) => {
      yPos = checkAddPage(20, yPos);
      
      // Card do canal
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(margin, yPos, contentWidth, 16, 2, 2, 'F');
      
      // Número do canal em dourado
      doc.setFillColor(...COLORS.gold);
      doc.roundedRect(margin + 3, yPos + 3, 22, 10, 2, 2, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(ch.id, margin + 14, yPos + 9.5, { align: 'center' });
      
      // Nome do canal
      if (ch.name) {
        doc.setTextColor(...COLORS.darkText);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(ch.name, margin + 30, yPos + 10);
      }
      
      yPos += 20;
    });
  } else {
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(10);
    doc.text('Nenhum canal completo definido', margin, yPos);
    yPos += 10;
  }
  
  // ============ PÁGINA 4 - VARIÁVEIS ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("VARIÁVEIS AVANÇADAS");
  
  const renderVariable = (label: string, variable: any) => {
    if (!variable) return;
    
    yPos = checkAddPage(35, yPos);
    
    // Card da variável
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.dustyMauve);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'FD');
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(label.toUpperCase(), margin + 5, yPos + 8);
    
    // Valor principal com nível
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.gold);
    const primaryText = variable.level
      ? `${variable.primary} (${variable.level})`
      : variable.primary;
    doc.text(primaryText, margin + 5, yPos + 17);
    
    // Descrição
    if (variable.description) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.darkText);
      const descLines = doc.splitTextToSize(variable.description, contentWidth - 15);
      doc.text(descLines[0] || '', margin + 5, yPos + 25);
    }
    
    yPos += 35;
  };
  
  if (data.variables) {
    renderVariable('Digestão', data.variables.digestion);
    renderVariable('Ambiente', data.variables.environment);
    renderVariable('Motivação', data.variables.motivation);
    renderVariable('Perspectiva', data.variables.perspective);
    renderVariable('Sentido (Personality)', data.variables.sense);
    renderVariable('Sentido (Design)', data.variables.designSense);
  }
  
  // ============ PÁGINAS: ANÁLISE IA ============
  if (data.ai_analysis_full) {
    doc.addPage();
    currentPage++;
    yPos = drawGradientHeader("ANÁLISE PERSONALIZADA COMPLETA");
    
    const processAnalysis = (text: string) => {
      const cleanedText = cleanMarkdown(text);
      const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
      
      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;
        
        // Detectar títulos
        const isTitle = trimmed.length < 80 && 
                       (trimmed.match(/^[0-9]+\./) ||
                        trimmed.match(/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\d\.:]+$/) ||
                        (trimmed.endsWith(':') && trimmed.length < 50));
        
        if (isTitle) {
          yPos = checkAddPage(20, yPos);
          
          // Linha dourada antes do título
          doc.setDrawColor(...COLORS.gold);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, margin + 40, yPos);
          
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.carmim);
          doc.text(trimmed, margin, yPos + 8);
          yPos += 15;
        } else if (trimmed.includes('•') || trimmed.match(/^[0-9]+\./m)) {
          // Lista
          const lines = trimmed.split('\n').filter(Boolean);
          lines.forEach((line) => {
            yPos = checkAddPage(10, yPos);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.darkText);
            
            const itemLines = doc.splitTextToSize(line, contentWidth - 10);
            itemLines.forEach((itemLine: string) => {
              yPos = checkAddPage(6, yPos);
              doc.text(itemLine, margin + 5, yPos);
              yPos += 5;
            });
          });
          yPos += 3;
        } else {
          // Parágrafo normal
          yPos = checkAddPage(15, yPos);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.darkText);
          
          const paraLines = doc.splitTextToSize(trimmed, contentWidth);
          paraLines.forEach((line: string) => {
            yPos = checkAddPage(6, yPos);
            doc.text(line, margin, yPos);
            yPos += 5;
          });
          yPos += 5;
        }
      });
    };
    
    processAnalysis(data.ai_analysis_full);
  }
  
  // ============ ADICIONAR RODAPÉS ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }
  
  // ============ SALVAR PDF ============
  const birthDateFormatted = new Date(data.birth_date)
    .toLocaleDateString('pt-BR')
    .replace(/\//g, '-');
  const fileName = `Arquitetura_Pessoal_${birthDateFormatted}.pdf`;
  doc.save(fileName);
}
