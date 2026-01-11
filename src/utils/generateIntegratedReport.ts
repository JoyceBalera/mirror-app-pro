import jsPDF from 'jspdf';
import { TRAIT_LABELS } from '@/constants/scoring';

export interface IntegratedReportData {
  // Big Five data
  traitScores: {
    neuroticism: number;
    extraversion: number;
    openness: number;
    agreeableness: number;
    conscientiousness: number;
  };
  classifications: Record<string, string>;
  
  // Human Design data
  energy_type: string;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  incarnation_cross: string | null;
  centers: Record<string, boolean>;
  
  // Analysis
  ai_analysis: string;
  
  // Optional: BodyGraph image
  bodygraph_image?: string;
}

// Cores da paleta Luciana (mesma do HD)
const COLORS = {
  carmim: [123, 25, 43] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  offWhite: [247, 243, 239] as [number, number, number],
  dustyMauve: [191, 175, 178] as [number, number, number],
  darkText: [51, 51, 51] as [number, number, number],
  lightText: [120, 120, 120] as [number, number, number],
  accent: [147, 51, 234] as [number, number, number], // Purple for integrated
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

const CLASSIFICATION_LABELS: Record<string, string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
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
    }
  };

  // =================== PÁGINA 1 - CAPA ===================
  // Fundo gradiente - carmim para accent
  doc.setFillColor(...COLORS.carmim);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 50, pageWidth, 40, 'F');

  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO', pageWidth / 2, 35, { align: 'center' });
  doc.text('INTEGRADO', pageWidth / 2, 48, { align: 'center' });

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Big Five + Desenho Humano', pageWidth / 2, 72, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('Uma visão única e completa do seu perfil', pageWidth / 2, 82, { align: 'center' });

  yPosition = 110;

  // =================== RESUMO BIG FIVE ===================
  doc.setFillColor(...COLORS.carmim);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFIL BIG FIVE', margin + 5, yPosition + 7);
  yPosition += 18;

  // Traços do Big Five
  const traits = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'] as const;
  
  traits.forEach((trait, index) => {
    const score = data.traitScores[trait];
    const classification = data.classifications[trait] || 'medium';
    const label = TRAIT_LABELS[trait] || trait;
    const classLabel = CLASSIFICATION_LABELS[classification] || classification;
    
    const xPos = margin;
    
    // Background bar
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(xPos, yPosition - 3, contentWidth, 12, 2, 2, 'F');
    
    // Progress bar
    const barWidth = (score / 100) * (contentWidth - 50);
    const barColor = classification === 'high' ? COLORS.gold : 
                     classification === 'low' ? COLORS.dustyMauve : COLORS.carmim;
    doc.setFillColor(...barColor);
    doc.roundedRect(xPos + 2, yPosition - 1, Math.max(barWidth, 5), 8, 1, 1, 'F');
    
    // Label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.darkText);
    doc.text(label, xPos + 5, yPosition + 4);
    
    // Score
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(`${score} - ${classLabel}`, xPos + contentWidth - 30, yPosition + 4);
    
    yPosition += 16;
  });

  yPosition += 5;

  // =================== RESUMO DESENHO HUMANO ===================
  doc.setFillColor(...COLORS.accent);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PERFIL DESENHO HUMANO', margin + 5, yPosition + 7);
  yPosition += 18;

  // Grid de informações HD
  const hdItems = [
    { label: 'Tipo Energético', value: data.energy_type },
    { label: 'Estratégia', value: data.strategy || 'N/A' },
    { label: 'Autoridade', value: data.authority || 'N/A' },
    { label: 'Perfil', value: data.profile || 'N/A' },
    { label: 'Definição', value: data.definition || 'N/A' },
    { label: 'Cruz', value: data.incarnation_cross || 'N/A' },
  ];

  const colWidth = contentWidth / 2;
  hdItems.forEach((item, index) => {
    const col = index % 2;
    const xPos = margin + col * colWidth;

    if (col === 0 && index > 0) {
      yPosition += 14;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(item.label, xPos, yPosition);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.accent);
    
    // Truncar texto longo
    const maxTextWidth = colWidth - 10;
    let displayValue = item.value;
    while (doc.getTextWidth(displayValue) > maxTextWidth && displayValue.length > 10) {
      displayValue = displayValue.slice(0, -4) + '...';
    }
    doc.text(displayValue, xPos, yPosition + 5);
  });

  yPosition += 20;

  // Centros
  const definedCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => CENTER_NAMES[centerId] || centerId);
  
  const openCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => !isDefined)
    .map(([centerId]) => CENTER_NAMES[centerId] || centerId);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text(`Centros Definidos (${definedCenters.length}):`, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.text(definedCenters.join(', ') || 'Nenhum', margin + 45, yPosition);
  
  yPosition += 7;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dustyMauve);
  doc.text(`Centros Abertos (${openCenters.length}):`, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.text(openCenters.join(', ') || 'Nenhum', margin + 45, yPosition);

  // =================== PÁGINA 2+ - ANÁLISE INTEGRADA ===================
  if (data.ai_analysis) {
    doc.addPage();
    yPosition = 25;

    doc.setFillColor(...COLORS.carmim);
    doc.rect(margin, yPosition, contentWidth / 2 - 2, 10, 'F');
    doc.setFillColor(...COLORS.accent);
    doc.rect(margin + contentWidth / 2 + 2, yPosition, contentWidth / 2 - 2, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE INTEGRADA COMPLETA', pageWidth / 2, yPosition + 7, { align: 'center' });
    yPosition += 20;

    // Processar análise
    const processAnalysis = (text: string) => {
      const cleanedText = cleanMarkdown(text);
      const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
      
      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;
        
        // Detectar se é título
        const isTitle = trimmed.length < 80 && 
                       (trimmed.match(/^[0-9]+\./) || 
                        trimmed.match(/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\d\.:]+$/) || 
                        (trimmed.endsWith(':') && trimmed.length < 50));
        
        if (isTitle) {
          checkAddPage(15);
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.carmim);
          doc.text(trimmed, margin, yPosition);
          yPosition += 10;
        } else if (trimmed.includes('•') || trimmed.match(/^[0-9]+\./m)) {
          // Lista
          const lines = trimmed.split('\n').filter(Boolean);
          lines.forEach((line) => {
            checkAddPage(8);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.darkText);
            
            const itemLines = doc.splitTextToSize(line, contentWidth - 5);
            itemLines.forEach((itemLine: string) => {
              checkAddPage(5);
              doc.text(itemLine, margin + 5, yPosition);
              yPosition += 5;
            });
          });
          yPosition += 3;
        } else {
          // Parágrafo normal
          checkAddPage(15);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...COLORS.darkText);
          
          const paraLines = doc.splitTextToSize(trimmed, contentWidth);
          paraLines.forEach((line: string) => {
            checkAddPage(5);
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
          yPosition += 5;
        }
      });
    };

    processAnalysis(data.ai_analysis);
  }

  // =================== RODAPÉ EM TODAS AS PÁGINAS ===================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Linha separadora
    doc.setDrawColor(...COLORS.dustyMauve);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    // Número da página
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.lightText);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 12, {
      align: 'center',
    });

    // Crédito
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.text('Criado por Luciana Belenton', pageWidth / 2, pageHeight - 7, {
      align: 'center',
    });
  }

  // =================== SALVAR PDF ===================
  const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const fileName = `Relatorio_Integrado_${today}.pdf`;
  doc.save(fileName);
}
