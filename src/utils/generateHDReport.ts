import jsPDF from 'jspdf';
import type { AdvancedVariables } from './humanDesignVariables';
import { 
  INTRO_SECTION, 
  CENTERS_THEORY, 
  ELEMENTS_THEORY, 
  ADVANCED_VARIABLES_THEORY,
  GATES_CHANNELS_THEORY,
  CLOSING_THEORY
} from '../data/humanDesignTheory';

export interface HDReportData {
  user_name?: string;
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
  darkText: [45, 45, 45] as [number, number, number],
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

  // Calcular dados dos centros
  const definedCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => centerId);
  const openCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => !isDefined)
    .map(([centerId]) => centerId);
  const activeChannels = (data.channels || []).filter((ch: any) => ch.isComplete);

  // ============ HELPER: Rodapé elegante ============
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    doc.setFillColor(...COLORS.offWhite);
    doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.text('Criado por Luciana Belenton', pageWidth / 2, pageHeight - 5, { align: 'center' });
  };

  // ============ HELPER: Header com gradiente ============
  const drawGradientHeader = (title: string, subtitle?: string): number => {
    const headerHeight = subtitle ? 45 : 35;
    const gradientSteps = 20;
    const stepHeight = headerHeight / gradientSteps;
    
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = COLORS.carmim[0] + (COLORS.carmimDark[0] - COLORS.carmim[0]) * ratio;
      const g = COLORS.carmim[1] + (COLORS.carmimDark[1] - COLORS.carmim[1]) * ratio;
      const b = COLORS.carmim[2] + (COLORS.carmimDark[2] - COLORS.carmim[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, i * stepHeight, pageWidth, stepHeight + 0.5, 'F');
    }
    
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, subtitle ? 22 : 20, { align: 'center' });
    
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.goldLight);
      doc.text(subtitle, pageWidth / 2, 32, { align: 'center' });
    }
    
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

  // ============ HELPER: Renderizar seção de teoria ============
  const renderTheorySection = (title: string, content: string, startY: number): number => {
    let yPos = startY;
    
    // Título da seção
    yPos = checkAddPage(20, yPos);
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 50, yPos);
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(title, margin, yPos + 8);
    yPos += 15;
    
    // Conteúdo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    
    const paragraphs = content.split('\n\n');
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para.trim(), contentWidth);
      lines.forEach((line: string) => {
        yPos = checkAddPage(6, yPos);
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 3;
    });
    
    return yPos + 5;
  };

  // ============ PÁGINA 1 - CAPA ============
  let yPos = drawGradientHeader("ARQUITETURA PESSOAL", "Desenho Humano Personalizado");
  
  // Nome da usuária (se disponível)
  if (data.user_name) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(data.user_name, pageWidth / 2, yPos + 5, { align: 'center' });
    yPos += 15;
  }
  
  // Box introdutório
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkText);
  doc.setFont('helvetica', 'normal');
  
  const introText = "Este relatorio apresenta sua Arquitetura Pessoal completa, um mapa unico da sua energia vital baseado no Sistema Human Design. Descubra como voce foi desenhado para tomar decisoes, interagir com o mundo e viver com autenticidade.";
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

  // ============ PÁGINAS 3+ - TEORIA FIXA (CAMADA 1) ============
  
  // Página: Introdução ao Desenho Humano
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("INTRODUÇÃO AO DESENHO HUMANO");
  yPos = renderTheorySection(INTRO_SECTION.title, INTRO_SECTION.content, yPos);
  
  // Os 9 Centros Energéticos
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("OS 9 CENTROS ENERGÉTICOS");
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  const centersIntro = "Dentro do Desenho Humano, os centros representam diferentes áreas de energia e influenciam várias facetas de nossa vida e personalidade. A seguir, você encontra o significado de cada um dos centros com foco especial nas mulheres.";
  const centersIntroLines = doc.splitTextToSize(centersIntro, contentWidth);
  doc.text(centersIntroLines, margin, yPos);
  yPos += centersIntroLines.length * 5 + 10;
  
  // Renderizar cada centro
  CENTERS_THEORY.forEach((center) => {
    // Verificar se o centro está definido no mapa da usuária
    const isDefined = definedCenters.includes(center.id);
    const definedMarker = isDefined ? ' (*)' : '';
    
    // Calcular altura dinâmica do card baseada no texto
    doc.setFontSize(9);
    const importanceLines = doc.splitTextToSize(center.importanceForWomen, contentWidth - 15);
    const cardHeight = Math.max(45, 28 + (importanceLines.length * 5));
    
    yPos = checkAddPage(cardHeight + 8, yPos);
    
    // Card do centro
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 3, 3, 'F');
    
    // Nome do centro
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(`${center.name}${definedMarker}`, margin + 5, yPos + 8);
    
    // Função
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.lightText);
    doc.text('Funcao:', margin + 5, yPos + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.text(center.function, margin + 25, yPos + 16);
    
    // Importância para mulheres - texto completo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.lightText);
    doc.text('Importancia para mulheres:', margin + 5, yPos + 24);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    let textY = yPos + 32;
    importanceLines.forEach((line: string) => {
      doc.text(line, margin + 5, textY);
      textY += 5;
    });
    
    yPos += cardHeight + 8;
  });
  
  // Nota sobre centros definidos
  yPos = checkAddPage(20, yPos);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.lightText);
  doc.text('(*) Indica os centros que estão definidos no seu mapa pessoal.', margin, yPos);
  yPos += 15;
  
  // Estrutura do Human Design
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("ESTRUTURA DO HUMAN DESIGN");
  
  ELEMENTS_THEORY.forEach((element) => {
    yPos = renderTheorySection(element.title, element.content, yPos);
  });
  
  // Variáveis Avançadas (teoria)
  yPos = checkAddPage(30, yPos);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text('Variáveis Avançadas', margin, yPos);
  yPos += 10;
  
  ADVANCED_VARIABLES_THEORY.forEach((variable) => {
    yPos = checkAddPage(20, yPos);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.gold);
    doc.text(variable.title, margin, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    const lines = doc.splitTextToSize(variable.content, contentWidth);
    lines.forEach((line: string) => {
      yPos = checkAddPage(6, yPos);
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 5;
  });
  
  // Portões e Canais
  yPos = renderTheorySection(GATES_CHANNELS_THEORY.title, GATES_CHANNELS_THEORY.content, yPos);
  
  // Fechamento da teoria
  yPos = renderTheorySection(CLOSING_THEORY.title, CLOSING_THEORY.content, yPos);

  // ============ SEUS CENTROS ENERGÉTICOS (dados do usuário) ============
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
      
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(cardX, cardY, cardWidth, 14, 2, 2, 'F');
      
      // Indicador verde (sem caractere Unicode)
      doc.setFillColor(...COLORS.success);
      doc.roundedRect(cardX + 3, cardY + 3, 8, 8, 1, 1, 'F');
      
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
      
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(cardX, cardY, cardWidth, 14, 2, 2, 'F');
      
      // Indicador laranja (sem caractere Unicode)
      doc.setFillColor(...COLORS.warning);
      doc.roundedRect(cardX + 3, cardY + 3, 8, 8, 1, 1, 'F');
      
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
      
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(margin, yPos, contentWidth, 16, 2, 2, 'F');
      
      doc.setFillColor(...COLORS.gold);
      doc.roundedRect(margin + 3, yPos + 3, 22, 10, 2, 2, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(ch.id, margin + 14, yPos + 9.5, { align: 'center' });
      
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
  
  // ============ PÁGINA: VARIÁVEIS AVANÇADAS (dados do usuário) ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("SUAS VARIÁVEIS AVANÇADAS");
  
  const renderVariable = (label: string, variable: any) => {
    if (!variable) return;
    
    yPos = checkAddPage(35, yPos);
    
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.dustyMauve);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'FD');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(label.toUpperCase(), margin + 5, yPos + 8);
    
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.gold);
    const primaryText = variable.level
      ? `${variable.primary} (${variable.level})`
      : variable.primary;
    doc.text(primaryText, margin + 5, yPos + 17);
    
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
    renderVariable('Sentido', data.variables.designSense);
  }
  
  // ============ PÁGINAS: ANÁLISE PERSONALIZADA IA (CAMADA 2) ============
  if (data.ai_analysis_full) {
    doc.addPage();
    currentPage++;
    yPos = drawGradientHeader("SEU MAPA NA PRÁTICA", "Leitura personalizada do seu desenho");
    
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
