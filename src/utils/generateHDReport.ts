import jsPDF from 'jspdf';
import { translateCross } from '../data/humanDesignCrosses';
import type { AdvancedVariables } from './humanDesignVariables';
import { 
  type HDPdfTranslations,
  type PDFLanguage,
  DATE_LOCALES,
  getCenterNames,
  getIntroSection,
  getCentersTheory,
  getElementsTheory,
  getAdvancedVariablesTheory,
  getGatesChannelsTheory,
  getClosingTheory,
} from '../data/humanDesignTheory';

// Import translations directly for PDF generation (avoiding React hooks)
import ptTranslations from '../locales/pt/translation.json';
import esTranslations from '../locales/es/translation.json';
import enTranslations from '../locales/en/translation.json';

export interface HDReportData {
  language?: PDFLanguage;
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

// Get translations for specific language
const getTranslations = (language: PDFLanguage): HDPdfTranslations => {
  const translationMap = {
    pt: ptTranslations,
    es: esTranslations,
    en: enTranslations
  };
  return (translationMap[language] as any).hdPdf as HDPdfTranslations;
};

// Cores da paleta Luciana - Padronizada com pdfGenerator.ts
const COLORS = {
  carmim: [123, 25, 43] as [number, number, number],
  carmimDark: [90, 18, 32] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  goldLight: [232, 205, 125] as [number, number, number],
  offWhite: [247, 243, 239] as [number, number, number],
  dustyMauve: [191, 175, 178] as [number, number, number],
  darkText: [45, 45, 45] as [number, number, number],
  lightText: [100, 100, 100] as [number, number, number], // Padronizado
  white: [255, 255, 255] as [number, number, number],
  success: [34, 139, 34] as [number, number, number],
  warning: [205, 133, 63] as [number, number, number],
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

// Participant label translations (not in HDPdfTranslations interface)
const getParticipantLabel = (language: PDFLanguage): string => {
  const labels: Record<PDFLanguage, string> = {
    pt: 'Participante',
    es: 'Participante',
    en: 'Participant'
  };
  return labels[language] || labels.pt;
};

export async function generateHDReport(data: HDReportData): Promise<void> {
  const language = data.language || 'pt';
  const t = getTranslations(language);
  const centerNames = getCenterNames(t);
  const dateLocale = DATE_LOCALES[language];
  const participantLabel = getParticipantLabel(language);
  
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
  const activeChannels = (data.channels || []).filter((ch: any) => {
    if ('isComplete' in ch) return ch.isComplete === true;
    return true; // old format: included = complete
  });

  // ============ HELPER: Rodapé elegante (padronizado com Big Five) ============
  const addFooter = (pageNum: number, totalPages: number) => {
    // Linha dourada
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Fundo offWhite do rodapé
    doc.setFillColor(...COLORS.offWhite);
    doc.rect(0, pageHeight - 17, pageWidth, 17, 'F');
    
    // Número da página: "Página X de Y"
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    const pageText = t.pageOf.replace('{{current}}', String(pageNum)).replace('{{total}}', String(totalPages));
    doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Crédito: 8px normal carmim
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.carmim);
    doc.text(t.createdBy, pageWidth / 2, pageHeight - 5, { align: 'center' });
  };

  // ============ HELPER: Header com gradiente (padronizado com Big Five) ============
  const drawGradientHeader = (title: string, subtitle?: string): number => {
    const headerHeight = subtitle ? 45 : 35;
    const steps = 20;
    
    // Gradiente carmim → carmimDark (mesmo padrão do Big Five)
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(COLORS.carmim[0] + (COLORS.carmimDark[0] - COLORS.carmim[0]) * ratio);
      const g = Math.round(COLORS.carmim[1] + (COLORS.carmimDark[1] - COLORS.carmim[1]) * ratio);
      const b = Math.round(COLORS.carmim[2] + (COLORS.carmimDark[2] - COLORS.carmim[2]) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, i * (headerHeight / steps), pageWidth, headerHeight / steps + 0.5, 'F');
    }
    
    // Título: 18px bold branco
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, subtitle ? 22 : 20, { align: 'center' });
    
    // Subtítulo: 11px normal goldLight
    if (subtitle) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.goldLight);
      doc.text(subtitle, pageWidth / 2, 34, { align: 'center' });
    }
    
    // Linha dourada: 80px centralizada
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.8);
    doc.line(pageWidth / 2 - 40, headerHeight - 2, pageWidth / 2 + 40, headerHeight - 2);
    
    return headerHeight + 5;
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

  // Get theory content from translations
  const introSection = getIntroSection(t);
  const centersTheory = getCentersTheory(t);
  const elementsTheory = getElementsTheory(t);
  const advancedVariablesTheory = getAdvancedVariablesTheory(t);
  const gatesChannelsTheory = getGatesChannelsTheory(t);
  const closingTheory = getClosingTheory(t);

  // ============ PÁGINA 1 - CAPA ============
  let yPos = drawGradientHeader(t.headerTitle, t.headerSubtitle);
  
  yPos += 5;
  
  // Box introdutório (padronizado com Big Five)
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  // Linha dourada decorativa no topo do box
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, yPos + 0.5, pageWidth - margin - 10, yPos + 0.5);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkText);
  doc.setFont('helvetica', 'normal');
  
  const introLines = doc.splitTextToSize(t.introText, contentWidth - 20);
  doc.text(introLines, margin + 10, yPos + 12);
  
  // Informações do participante (padronizado com Big Five)
  if (data.user_name) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont('helvetica', 'bold');
    doc.text(`${participantLabel}: ${data.user_name}`, margin + 10, yPos + 28);
  }
  
  yPos += 45;
  
  // Dados de nascimento
  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text(t.birthDataTitle, margin + 10, yPos + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.setFontSize(10);
  
  // Parse date parts directly to avoid UTC timezone shift (e.g., 1974-03-30 becoming 29/03 in BR timezone)
  const [bYear, bMonth, bDay] = data.birth_date.split('-').map(Number);
  const birthDateObj = new Date(bYear, bMonth - 1, bDay);
  const birthDate = birthDateObj.toLocaleDateString(dateLocale);
  doc.text(`${t.birthDate}: ${birthDate}`, margin + 10, yPos + 20);
  doc.text(`${t.birthTime}: ${data.birth_time}`, margin + 10, yPos + 28);
  doc.text(`${t.birthLocation}: ${data.birth_location}`, margin + 10, yPos + 36);
  
  yPos += 50;
  
  // Seção: Perfil Energético
  doc.setFillColor(...COLORS.carmim);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t.profileTitle, margin + 5, yPos + 7);
  yPos += 18;
  
  // Grid de informações (2 colunas)
  const infoItems = [
    { label: t.energyType, value: data.energy_type },
    { label: t.strategy, value: data.strategy || 'N/A' },
    { label: t.authority, value: data.authority || 'N/A' },
    { label: t.profile, value: data.profile || 'N/A' },
    { label: t.definition, value: data.definition || 'N/A' },
    { label: t.incarnationCross, value: translateCross(data.incarnation_cross, language, data.profile) },
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
  yPos = drawGradientHeader(t.bodygraphTitle);
  
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
      doc.text(t.bodygraphFallback, margin + 10, yPos);
      yPos += 25;
    }
  } else {
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.text(t.bodygraphFallback, margin + 10, yPos);
    yPos += 25;
  }
  
  // Resumo visual
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  const summaryText = t.summaryTemplate
    .replace('{{defined}}', String(definedCenters.length))
    .replace('{{open}}', String(openCenters.length))
    .replace('{{channels}}', String(activeChannels.length));
  doc.text(summaryText, pageWidth / 2, yPos, { align: 'center' });

  // ============ PÁGINAS 3+ - TEORIA FIXA (CAMADA 1) ============
  
  // Página: Introdução ao Desenho Humano
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.centersIntroTitle);
  yPos = renderTheorySection(introSection.title, introSection.content, yPos);
  
  // Os 9 Centros Energéticos
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.centersTitle);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  const centersIntroLines = doc.splitTextToSize(t.centersIntro, contentWidth);
  doc.text(centersIntroLines, margin, yPos);
  yPos += centersIntroLines.length * 5 + 10;
  
  // Renderizar cada centro
  centersTheory.forEach((center) => {
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
    doc.text(`${t.functionLabel}:`, margin + 5, yPos + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.text(center.function, margin + 25, yPos + 16);
    
    // Importância para mulheres - texto completo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.lightText);
    doc.text(`${t.importanceLabel}:`, margin + 5, yPos + 24);
    
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
  doc.text(t.centersNote, margin, yPos);
  yPos += 15;
  
  // Estrutura do Human Design
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.structureTitle);
  
  elementsTheory.forEach((element) => {
    yPos = renderTheorySection(element.title, element.content, yPos);
  });
  
  // Variáveis Avançadas (teoria)
  yPos = checkAddPage(30, yPos);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text(t.advancedVariablesTheory, margin, yPos);
  yPos += 10;
  
  advancedVariablesTheory.forEach((variable) => {
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
  yPos = renderTheorySection(gatesChannelsTheory.title, gatesChannelsTheory.content, yPos);
  
  // Fechamento da teoria
  yPos = renderTheorySection(closingTheory.title, closingTheory.content, yPos);

  // ============ SEUS CENTROS ENERGÉTICOS (dados do usuário) ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.yourCentersTitle);
  
  // Centros Definidos
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.success);
  doc.text(t.definedCenters, margin, yPos + 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.lightText);
  doc.text(t.definedCentersDesc, margin + 52, yPos + 8);
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
      doc.text(centerNames[centerId] || centerId, cardX + 15, cardY + 9);
    });
    yPos += Math.ceil(definedCenters.length / 2) * 18 + 10;
  } else {
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(10);
    doc.text(t.noCentersDefined, margin, yPos);
    yPos += 15;
  }
  
  // Centros Abertos
  doc.setDrawColor(...COLORS.gold);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.warning);
  doc.text(t.openCenters, margin, yPos + 8);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.lightText);
  doc.text(t.openCentersDesc, margin + 48, yPos + 8);
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
      doc.text(centerNames[centerId] || centerId, cardX + 15, cardY + 9);
    });
    yPos += Math.ceil(openCenters.length / 2) * 18 + 15;
  } else {
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(10);
    doc.text(t.allCentersDefined, margin, yPos);
    yPos += 15;
  }
  
  // ============ SEÇÃO: CANAIS ============
  yPos = checkAddPage(60, yPos);
  
  doc.setDrawColor(...COLORS.gold);
  doc.line(margin, yPos, margin + 60, yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text(t.powerChannels, margin, yPos + 8);
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
    doc.text(t.noChannels, margin, yPos);
    yPos += 10;
  }
  
  // ============ PÁGINA: VARIÁVEIS AVANÇADAS (dados do usuário) ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.yourVariablesTitle);
  
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
    renderVariable(t.digestion, data.variables.digestion);
    renderVariable(t.environment, data.variables.environment);
    renderVariable(t.motivation, data.variables.motivation);
    renderVariable(t.perspective, data.variables.perspective);
    renderVariable(t.sense, data.variables.designSense);
  }
  
  // ============ PÁGINAS: ANÁLISE PERSONALIZADA IA (CAMADA 2) ============
  if (data.ai_analysis_full) {
    doc.addPage();
    currentPage++;
    yPos = drawGradientHeader(t.analysisTitle, t.analysisSubtitle);
    
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
  const [fYear, fMonth, fDay] = data.birth_date.split('-').map(Number);
  const birthDateFormatted = new Date(fYear, fMonth - 1, fDay)
    .toLocaleDateString(dateLocale)
    .replace(/\//g, '-');
  const fileName = `${t.fileName}_${birthDateFormatted}.pdf`;
  doc.save(fileName);
}
