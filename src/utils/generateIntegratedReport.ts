import jsPDF from 'jspdf';

export interface IntegratedReportData {
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
  
  // Analysis
  ai_analysis: string;
  
  // Optional: BodyGraph image
  bodygraph_image?: string;
}

// Cores da paleta Luciana (refinada)
const COLORS = {
  carmim: [123, 25, 43] as [number, number, number],
  carmimLight: [163, 65, 83] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  goldLight: [232, 205, 115] as [number, number, number],
  offWhite: [247, 243, 239] as [number, number, number],
  dustyMauve: [191, 175, 178] as [number, number, number],
  darkText: [45, 45, 45] as [number, number, number],
  lightText: [100, 100, 100] as [number, number, number],
  accent: [128, 45, 100] as [number, number, number], // Purple mais elegante
  accentLight: [168, 85, 140] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bgLight: [252, 250, 248] as [number, number, number],
  success: [76, 175, 80] as [number, number, number],
  warning: [255, 152, 0] as [number, number, number],
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  Baixo: 'Baixo',
  Médio: 'Médio', 
  Alto: 'Alto',
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

  // Helper: Draw rounded rectangle with gradient effect
  const drawGradientHeader = (y: number, height: number, color1: [number, number, number], color2: [number, number, number]) => {
    const steps = 20;
    const stepHeight = height / steps;
    for (let i = 0; i < steps; i++) {
      const r = color1[0] + ((color2[0] - color1[0]) * i) / steps;
      const g = color1[1] + ((color2[1] - color1[1]) * i) / steps;
      const b = color1[2] + ((color2[2] - color1[2]) * i) / steps;
      doc.setFillColor(r, g, b);
      doc.rect(0, y + i * stepHeight, pageWidth, stepHeight + 0.5, 'F');
    }
  };

  // =================== PÁGINA 1 - CAPA ELEGANTE ===================
  // Header gradient
  drawGradientHeader(0, 70, COLORS.carmim, COLORS.accent);

  // Decorative line
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.8);
  doc.line(margin + 20, 55, pageWidth - margin - 20, 55);

  // Título principal
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO', pageWidth / 2, 30, { align: 'center' });
  doc.text('INTEGRADO', pageWidth / 2, 45, { align: 'center' });

  // Subtítulo na barra
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.goldLight);
  doc.text('Big Five + Desenho Humano', pageWidth / 2, 63, { align: 'center' });

  yPosition = 85;

  // Descrição introdutória
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.lightText);
  const introText = 'Este relatório apresenta uma visão integrada do seu perfil, cruzando os resultados do teste Big Five (Cinco Grandes Fatores) com o seu mapa de Desenho Humano.';
  const introLines = doc.splitTextToSize(introText, contentWidth - 10);
  doc.text(introLines, margin + 5, yPosition + 8);
  
  yPosition += 30;

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
  doc.text('PERFIL BIG FIVE', margin + 18, yPosition + 8);
  yPosition += 20;

  // Traços do Big Five com design melhorado
  const traits = [
    { key: 'Neuroticismo', icon: '🧠' },
    { key: 'Extroversão', icon: '🌟' },
    { key: 'Abertura à Experiência', icon: '🎨' },
    { key: 'Amabilidade', icon: '❤️' },
    { key: 'Conscienciosidade', icon: '📋' }
  ];
  
  traits.forEach((trait) => {
    const score = data.traitScores[trait.key] || 0;
    const classification = data.traitClassifications[trait.key] || 'medium';
    const classLabel = CLASSIFICATION_LABELS[classification] || classification;
    
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
    doc.text(trait.key, margin + 5, yPosition + 9);
    
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
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, yPosition, contentWidth, 12, 2, 2, 'F');
  
  // Ícone decorativo
  doc.setFillColor(...COLORS.gold);
  doc.circle(margin + 8, yPosition + 6, 4, 'F');
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('HD', margin + 4.5, yPosition + 8);
  
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFIL DESENHO HUMANO', margin + 18, yPosition + 8);
  yPosition += 18;

  // Grid 2x3 de informações HD com cards
  const hdItems = [
    { label: 'Tipo Energético', value: data.energyType, highlight: true },
    { label: 'Estratégia', value: data.strategy || 'N/A', highlight: false },
    { label: 'Autoridade', value: data.authority || 'N/A', highlight: false },
    { label: 'Perfil', value: data.profile || 'N/A', highlight: false },
    { label: 'Definição', value: data.definition || 'N/A', highlight: false },
    { label: 'Cruz de Encarnação', value: data.incarnationCross || 'N/A', highlight: false },
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
      doc.setTextColor(...COLORS.accent);
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
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(margin, yPosition, contentWidth, 28, 3, 3, 'F');
  
  const definedCenters = data.definedCenters || [];
  const openCenters = data.openCenters || [];

  // Centros Definidos
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text(`● Definidos (${definedCenters.length}):`, margin + 4, yPosition + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  const definedText = definedCenters.length > 0 ? definedCenters.join(', ') : 'Nenhum';
  const definedLines = doc.splitTextToSize(definedText, contentWidth - 50);
  doc.text(definedLines, margin + 42, yPosition + 8);
  
  // Centros Abertos
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dustyMauve);
  doc.text(`○ Abertos (${openCenters.length}):`, margin + 4, yPosition + 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  const openText = openCenters.length > 0 ? openCenters.join(', ') : 'Nenhum';
  const openLines = doc.splitTextToSize(openText, contentWidth - 50);
  doc.text(openLines, margin + 42, yPosition + 20);

  // =================== PÁGINA 2+ - ANÁLISE INTEGRADA ===================
  if (data.ai_analysis) {
    doc.addPage();
    yPosition = 15;

    // Header elegante
    drawGradientHeader(0, 25, COLORS.carmim, COLORS.accent);
    
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE INTEGRADA', pageWidth / 2, 16, { align: 'center' });
    
    yPosition = 35;

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

  // =================== RODAPÉ EM TODAS AS PÁGINAS ===================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Fundo do rodapé
    doc.setFillColor(...COLORS.bgLight);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Linha decorativa
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

    // Número da página
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

    // Crédito
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text('Criado por Luciana Belenton', pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  // =================== SALVAR PDF ===================
  const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const fileName = `Relatorio_Integrado_${today}.pdf`;
  doc.save(fileName);
}
