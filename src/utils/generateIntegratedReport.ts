import jsPDF from 'jspdf';

type PDFLanguage = 'pt' | 'es' | 'en';

export interface IntegratedReportData {
  // Language
  language?: PDFLanguage;
  
  // User data
  userName?: string;
  testDate?: Date;
  
  // Big Five data - flexible format
  traitScores: Record<string, number>;
  traitClassifications: Record<string, string>;
  
  // Human Design data
  energyType: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  definedCenters: string[];
  openCenters: string[];
  activeChannels?: any[];
  
  // Analysis
  ai_analysis: string;
  
  // Optional: BodyGraph image
  bodygraph_image?: string;
}

// Cores da paleta Luciana (padronizada com pdfGenerator.ts)
const COLORS = {
  carmim: [123, 25, 43] as [number, number, number],
  carmimDark: [90, 18, 32] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  goldLight: [232, 205, 125] as [number, number, number],
  offWhite: [247, 243, 239] as [number, number, number],
  dustyMauve: [191, 175, 178] as [number, number, number],
  darkText: [45, 45, 45] as [number, number, number],
  lightText: [100, 100, 100] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [34, 139, 34] as [number, number, number],
  warning: [205, 133, 63] as [number, number, number],
};

const DATE_LOCALES: Record<PDFLanguage, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US'
};

// Translations for PDF
const getTranslations = (lang: PDFLanguage) => {
  const translations = {
    pt: {
      headerTitle: 'BLUEPRINT PESSOAL',
      headerSubtitle: 'Mapa de Personalidade + Arquitetura Pessoal',
      introText: 'Este relatório apresenta uma visão integrada do seu perfil, cruzando os resultados do seu Mapa de Personalidade com a sua Arquitetura Pessoal, revelando padrões únicos de comportamento e tomada de decisão.',
      participantLabel: 'Participante',
      dateLabel: 'Data',
      personalityMapTitle: 'MAPA DE PERSONALIDADE',
      personalArchitectureTitle: 'ARQUITETURA PESSOAL',
      bodygraphTitle: 'SEU BODYGRAPH',
      bodygraphFallback: 'Imagem do Bodygraph não disponível',
      activeChannels: 'Canais Ativos',
      noChannels: 'Nenhum canal completo',
      analysisTitle: 'ANÁLISE INTEGRADA',
      analysisSubtitle: 'Interpretação Detalhada do Seu Perfil',
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Criado por Luciana Belenton',
      fileName: 'Blueprint_Pessoal',
      hdLabels: {
        energyType: 'Tipo Energético',
        strategy: 'Estratégia',
        authority: 'Autoridade',
        profile: 'Perfil',
        definition: 'Definição',
        incarnationCross: 'Cruz de Encarnação'
      },
      centersSection: {
        defined: 'Definidos',
        open: 'Abertos',
        none: 'Nenhum'
      },
      classifications: {
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto'
      },
      traits: {
        'Neuroticismo': 'Estabilidade Emocional',
        'Extroversão': 'Extroversão',
        'Abertura à Experiência': 'Abertura',
        'Amabilidade': 'Amabilidade',
        'Conscienciosidade': 'Conscienciosidade'
      }
    },
    es: {
      headerTitle: 'BLUEPRINT PERSONAL',
      headerSubtitle: 'Mapa de Personalidad + Arquitectura Personal',
      introText: 'Este informe presenta una visión integrada de tu perfil, cruzando los resultados de tu Mapa de Personalidad con tu Arquitectura Personal, revelando patrones únicos de comportamiento y toma de decisiones.',
      participantLabel: 'Participante',
      dateLabel: 'Fecha',
      personalityMapTitle: 'MAPA DE PERSONALIDAD',
      personalArchitectureTitle: 'ARQUITECTURA PERSONAL',
      bodygraphTitle: 'TU BODYGRAPH',
      bodygraphFallback: 'Imagen del Bodygraph no disponible',
      activeChannels: 'Canales Activos',
      noChannels: 'Ningún canal completo',
      analysisTitle: 'ANÁLISIS INTEGRADO',
      analysisSubtitle: 'Interpretación Detallada de Tu Perfil',
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Creado por Luciana Belenton',
      fileName: 'Blueprint_Personal',
      hdLabels: {
        energyType: 'Tipo Energético',
        strategy: 'Estrategia',
        authority: 'Autoridad',
        profile: 'Perfil',
        definition: 'Definición',
        incarnationCross: 'Cruz de Encarnación'
      },
      centersSection: {
        defined: 'Definidos',
        open: 'Abiertos',
        none: 'Ninguno'
      },
      classifications: {
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto'
      },
      traits: {
        'Neuroticismo': 'Estabilidad Emocional',
        'Extroversão': 'Extraversión',
        'Abertura à Experiência': 'Apertura',
        'Amabilidade': 'Amabilidad',
        'Conscienciosidade': 'Responsabilidad'
      }
    },
    en: {
      headerTitle: 'PERSONAL BLUEPRINT',
      headerSubtitle: 'Personality Map + Personal Architecture',
      introText: 'This report presents an integrated view of your profile, combining the results of your Personality Map with your Personal Architecture, revealing unique patterns of behavior and decision-making.',
      participantLabel: 'Participant',
      dateLabel: 'Date',
      personalityMapTitle: 'PERSONALITY MAP',
      personalArchitectureTitle: 'PERSONAL ARCHITECTURE',
      bodygraphTitle: 'YOUR BODYGRAPH',
      bodygraphFallback: 'Bodygraph image not available',
      activeChannels: 'Active Channels',
      noChannels: 'No complete channels',
      analysisTitle: 'INTEGRATED ANALYSIS',
      analysisSubtitle: 'Detailed Interpretation of Your Profile',
      pageOf: 'Page {{current}} of {{total}}',
      createdBy: 'Created by Luciana Belenton',
      fileName: 'Personal_Blueprint',
      hdLabels: {
        energyType: 'Energy Type',
        strategy: 'Strategy',
        authority: 'Authority',
        profile: 'Profile',
        definition: 'Definition',
        incarnationCross: 'Incarnation Cross'
      },
      centersSection: {
        defined: 'Defined',
        open: 'Open',
        none: 'None'
      },
      classifications: {
        low: 'Low',
        medium: 'Medium',
        high: 'High'
      },
      traits: {
        'Neuroticismo': 'Emotional Stability',
        'Extroversão': 'Extraversion',
        'Abertura à Experiência': 'Openness',
        'Amabilidade': 'Agreeableness',
        'Conscienciosidade': 'Conscientiousness'
      }
    }
  };
  return translations[lang] || translations.pt;
};

const getClassificationLabel = (classification: string, t: ReturnType<typeof getTranslations>): string => {
  const normalized = classification.toLowerCase();
  if (normalized === 'low' || normalized === 'baixo' || normalized === 'bajo') return t.classifications.low;
  if (normalized === 'high' || normalized === 'alto') return t.classifications.high;
  return t.classifications.medium;
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

export async function generateIntegratedReport(data: IntegratedReportData): Promise<void> {
  const language = data.language || 'pt';
  const t = getTranslations(language);
  const dateLocale = DATE_LOCALES[language];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = 20;

  // Helper: Check if we need a new page
  const checkAddPage = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 25) {
      doc.addPage();
      yPosition = 25;
      return true;
    }
    return false;
  };

  // Helper: Draw gradient header (padronizado com Big Five)
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
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, subtitle ? 22 : 20, { align: 'center' });
    
    // Subtítulo: 11px normal goldLight
    if (subtitle) {
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.goldLight);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, pageWidth / 2, 34, { align: 'center' });
    }
    
    // Linha dourada: 80px centralizada
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.8);
    doc.line(pageWidth / 2 - 40, headerHeight - 2, pageWidth / 2 + 40, headerHeight - 2);
    
    return headerHeight + 5;
  };

  // =================== PÁGINA 1 - CAPA ===================
  yPosition = drawGradientHeader(t.headerTitle, t.headerSubtitle);
  
  yPosition += 5;

  // Box introdutório (padronizado com Big Five)
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, 'F');
  
  // Linha dourada decorativa no topo do box
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, yPosition + 0.5, pageWidth - margin - 10, yPosition + 0.5);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkText);
  doc.setFont('helvetica', 'normal');
  
  const introLines = doc.splitTextToSize(t.introText, contentWidth - 20);
  doc.text(introLines, margin + 10, yPosition + 12);
  
  // Informações do participante (padronizado com Big Five)
  if (data.userName) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.participantLabel}: ${data.userName}`, margin + 10, yPosition + 28);
  }
  
  const testDate = data.testDate || new Date();
  doc.setTextColor(...COLORS.lightText);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.dateLabel}: ${testDate.toLocaleDateString(dateLocale)}`, data.userName ? margin + 100 : margin + 10, yPosition + 28);
  
  yPosition += 45;

  // =================== SEÇÃO BIG FIVE ===================
  // Header da seção
  doc.setFillColor(...COLORS.carmim);
  doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
  
  // Ícone decorativo
  doc.setFillColor(...COLORS.gold);
  doc.circle(margin + 8, yPosition + 6, 4, 'F');
  doc.setTextColor(...COLORS.carmim);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('5', margin + 6, yPosition + 8);
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(t.personalityMapTitle, margin + 18, yPosition + 8);
  yPosition += 20;

  // Traços do Big Five com design melhorado
  const traitKeys = [
    'Neuroticismo',
    'Extroversão',
    'Abertura à Experiência',
    'Amabilidade',
    'Conscienciosidade'
  ];
  
  traitKeys.forEach((traitKey) => {
    const score = data.traitScores[traitKey] || 0;
    const classification = data.traitClassifications[traitKey] || 'medium';
    const classLabel = getClassificationLabel(classification, t);
    const translatedTrait = t.traits[traitKey as keyof typeof t.traits] || traitKey;
    
    // Card background
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPosition, contentWidth, 14, 2, 2, 'F');
    
    // Progress bar background
    const barX = margin + 75;
    const barWidth = contentWidth - 120;
    doc.setFillColor(...COLORS.dustyMauve);
    doc.roundedRect(barX, yPosition + 4, barWidth, 6, 2, 2, 'F');
    
    // Progress bar fill
    const fillWidth = (score / 100) * barWidth;
    const barColor = classification === 'high' || classification === 'Alto' ? COLORS.success : 
                     classification === 'low' || classification === 'Baixo' ? COLORS.warning : COLORS.carmim;
    doc.setFillColor(...barColor);
    doc.roundedRect(barX, yPosition + 4, Math.max(fillWidth, 3), 6, 2, 2, 'F');
    
    // Trait label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.darkText);
    doc.text(translatedTrait, margin + 5, yPosition + 9);
    
    // Score and classification
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...barColor);
    doc.text(`${Math.round(score)}`, barX + barWidth + 5, yPosition + 9);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(classLabel, barX + barWidth + 18, yPosition + 9);
    
    yPosition += 17;
  });

  yPosition += 8;

  // =================== SEÇÃO DESENHO HUMANO ===================
  // Header da seção
  doc.setFillColor(...COLORS.carmimDark);
  doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
  
  // Ícone decorativo
  doc.setFillColor(...COLORS.gold);
  doc.circle(margin + 8, yPosition + 6, 4, 'F');
  doc.setTextColor(...COLORS.carmimDark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('HD', margin + 4.5, yPosition + 8);
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(t.personalArchitectureTitle, margin + 18, yPosition + 8);
  yPosition += 18;

  // Grid 2x3 de informações HD com cards
  const hdItems = [
    { label: t.hdLabels.energyType, value: data.energyType, highlight: true },
    { label: t.hdLabels.strategy, value: data.strategy || 'N/A', highlight: false },
    { label: t.hdLabels.authority, value: data.authority || 'N/A', highlight: false },
    { label: t.hdLabels.profile, value: data.profile || 'N/A', highlight: false },
    { label: t.hdLabels.definition, value: data.definition || 'N/A', highlight: false },
    { label: t.hdLabels.incarnationCross, value: data.incarnationCross || 'N/A', highlight: false },
  ];

  const cardWidth = (contentWidth - 8) / 2;
  const cardHeight = 18;
  
  hdItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xPos = margin + col * (cardWidth + 8);
    const yPos = yPosition + row * (cardHeight + 4);

    // Card background
    if (item.highlight) {
      doc.setFillColor(...COLORS.carmim);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'F');
      doc.setTextColor(...COLORS.goldLight);
    } else {
      doc.setFillColor(...COLORS.offWhite);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, 'F');
      doc.setTextColor(...COLORS.lightText);
    }
    
    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, xPos + 4, yPos + 6);

    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    if (item.highlight) {
      doc.setTextColor(...COLORS.white);
    } else {
      doc.setTextColor(...COLORS.carmim);
    }
    
    // Truncar texto longo
    let displayValue = item.value;
    const maxWidth = cardWidth - 8;
    while (doc.getTextWidth(displayValue) > maxWidth && displayValue.length > 10) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    doc.text(displayValue, xPos + 4, yPos + 14);
  });

  yPosition += (cardHeight + 4) * 3 + 8;

  // Centros - Layout horizontal com badges
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPosition, contentWidth, 28, 3, 3, 'F');
  
  const definedCenters = data.definedCenters || [];
  const openCenters = data.openCenters || [];

  // Centros Definidos
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text(`● ${t.centersSection.defined} (${definedCenters.length}):`, margin + 4, yPosition + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  const definedText = definedCenters.length > 0 ? definedCenters.join(', ') : t.centersSection.none;
  const definedLines = doc.splitTextToSize(definedText, contentWidth - 50);
  doc.text(definedLines, margin + 42, yPosition + 8);
  
  // Centros Abertos
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dustyMauve);
  doc.text(`○ ${t.centersSection.open} (${openCenters.length}):`, margin + 4, yPosition + 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  const openText = openCenters.length > 0 ? openCenters.join(', ') : t.centersSection.none;
  const openLines = doc.splitTextToSize(openText, contentWidth - 50);
  doc.text(openLines, margin + 42, yPosition + 20);

  // =================== PÁGINA 2 - BODYGRAPH VISUAL ===================
  if (data.bodygraph_image) {
    doc.addPage();
    yPosition = drawGradientHeader(t.bodygraphTitle);

    // BodyGraph image centered
    const imgWidth = 85;
    const imgHeight = 160;
    const imgX = (pageWidth - imgWidth) / 2;
    
    try {
      doc.addImage(data.bodygraph_image, 'PNG', imgX, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Erro ao adicionar imagem do Bodygraph:', error);
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.lightText);
      doc.text(t.bodygraphFallback, pageWidth / 2, yPosition + 50, { align: 'center' });
      yPosition += 80;
    }

    // Summary section below bodygraph
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F');
    
    // Channels summary
    const activeChannels = data.activeChannels || [];
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(`${t.activeChannels} (${activeChannels.length}):`, margin + 5, yPosition + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(9);
    
    if (activeChannels.length > 0) {
      const channelNames = activeChannels.map((ch: any) => {
        if (ch.gates && ch.gates.length === 2) {
          return `${ch.gates[0]}-${ch.gates[1]}`;
        }
        return ch.name || ch.id || 'Canal';
      }).join(', ');
      const channelLines = doc.splitTextToSize(channelNames, contentWidth - 10);
      doc.text(channelLines, margin + 5, yPosition + 20);
    } else {
      doc.text(t.noChannels, margin + 5, yPosition + 20);
    }
  }

  // =================== PÁGINA 3+ - ANÁLISE INTEGRADA ===================
  if (data.ai_analysis) {
    doc.addPage();
    yPosition = drawGradientHeader(t.analysisTitle, t.analysisSubtitle);

    // Processar análise
    const processAnalysis = (text: string) => {
      const cleanedText = cleanMarkdown(text);
      const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
      
      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;
        
        // Detectar se é título (maiúsculas, curto, ou termina com :)
        const isTitle = trimmed.length < 100 && 
                       (trimmed.match(/^[0-9]+\.?\s*[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ]/) || 
                        trimmed.match(/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\d\.\-:]+$/) || 
                        (trimmed.endsWith(':') && trimmed.length < 60) ||
                        trimmed.match(/^[A-Z][A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s]+$/));
        
        if (isTitle) {
          checkAddPage(20);
          
          // Linha decorativa antes do título
          doc.setDrawColor(...COLORS.gold);
          doc.setLineWidth(0.5);
          doc.line(margin, yPosition, margin + 30, yPosition);
          yPosition += 5;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.carmim);
          
          const titleLines = doc.splitTextToSize(trimmed, contentWidth);
          titleLines.forEach((line: string) => {
            doc.text(line, margin, yPosition);
            yPosition += 6;
          });
          yPosition += 4;
        } else if (trimmed.includes('•') || trimmed.match(/^[0-9]+\./m)) {
          // Lista
          const lines = trimmed.split('\n').filter(Boolean);
          lines.forEach((line) => {
            checkAddPage(10);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.darkText);
            
            const itemLines = doc.splitTextToSize(line, contentWidth - 8);
            itemLines.forEach((itemLine: string, idx: number) => {
              checkAddPage(6);
              doc.text(itemLine, margin + (idx === 0 ? 0 : 4), yPosition);
              yPosition += 5;
            });
          });
          yPosition += 4;
        } else {
          // Parágrafo normal
          checkAddPage(15);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.darkText);
          
          const paraLines = doc.splitTextToSize(trimmed, contentWidth);
          paraLines.forEach((line: string) => {
            checkAddPage(6);
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
          yPosition += 6;
        }
      });
    };

    processAnalysis(data.ai_analysis);
  }

  // =================== RODAPÉ EM TODAS AS PÁGINAS (padronizado) ===================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

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
    const pageText = t.pageOf.replace('{{current}}', String(i)).replace('{{total}}', String(totalPages));
    doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Crédito: 8px normal carmim
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.carmim);
    doc.text(t.createdBy, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  // =================== SALVAR PDF ===================
  const today = new Date().toLocaleDateString(dateLocale).replace(/\//g, '-');
  const fileName = data.userName 
    ? `${t.fileName}_${data.userName.toLowerCase().replace(/\s+/g, '-')}_${today}.pdf`
    : `${t.fileName}_${today}.pdf`;
  doc.save(fileName);
}
