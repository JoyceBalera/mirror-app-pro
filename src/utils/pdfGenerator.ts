import jsPDF from "jspdf";
import { TRAIT_LABELS } from "@/constants/scoring";
import { facetNames } from "@/utils/scoreCalculator";

interface PDFOptions {
  userName?: string;
  testDate?: Date;
  aiAnalysis?: string;
}

// Paleta de cores Luciana (RGB)
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
  info: [70, 130, 180] as [number, number, number],
};

const getTraitLabel = (trait: string): string => {
  return TRAIT_LABELS[trait] || trait;
};

const getFacetLabel = (facet: string): string => {
  return facetNames[facet] || facet;
};

const getClassificationLabel = (classification: string | number): string => {
  if (typeof classification === 'number') {
    if (classification <= 18) return "Muito Baixa";
    if (classification <= 26) return "Baixa";
    if (classification <= 33) return "Média";
    if (classification <= 41) return "Alta";
    return "Muito Alta";
  }
  const labels: { [key: string]: string } = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
    "Muito Baixo": "Muito Baixo",
    "Baixo": "Baixo",
    "Médio": "Médio",
    "Alto": "Alto",
    "Muito Alto": "Muito Alto",
    "Muito Baixa": "Muito Baixa",
    "Baixa": "Baixa",
    "Média": "Média",
    "Alta": "Alta",
    "Muito Alta": "Muito Alta",
  };
  return labels[classification] || classification;
};

const getTraitClassification = (score: number): string => {
  if (score <= 108) return "Muito Baixo";
  if (score <= 156) return "Baixo";
  if (score <= 198) return "Médio";
  if (score <= 246) return "Alto";
  return "Muito Alto";
};

const getFacetClassification = (score: number): string => {
  if (score <= 18) return "Muito Baixa";
  if (score <= 26) return "Baixa";
  if (score <= 33) return "Média";
  if (score <= 41) return "Alta";
  return "Muito Alta";
};

const getScoreColor = (score: number, isTraitScore: boolean): [number, number, number] => {
  const thresholds = isTraitScore 
    ? { low: 156, high: 198 }
    : { low: 26, high: 33 };
  
  if (score <= thresholds.low) return COLORS.warning;
  if (score >= thresholds.high) return COLORS.success;
  return COLORS.carmim;
};

const cleanMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/^[-•]\s/gm, '• ')
    .replace(/^\d+\.\s/gm, (match) => match)
    .trim();
};

export const generateTestResultPDF = (
  traitScores: Record<string, number>,
  facetScores: Record<string, Record<string, number>>,
  classifications: Record<string, string>,
  options: PDFOptions = {}
): void => {
  const { userName, testDate = new Date(), aiAnalysis } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let currentPage = 1;

  // Função auxiliar para adicionar rodapé
  const addFooter = () => {
    // Linha dourada no topo do rodapé
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Fundo off-white do rodapé
    doc.setFillColor(...COLORS.offWhite);
    doc.rect(0, pageHeight - 17, pageWidth, 17, 'F');
    
    // Número da página
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont("helvetica", "normal");
    doc.text(`Página ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    // Crédito
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.carmim);
    doc.text("Criado por Luciana Belenton", pageWidth / 2, pageHeight - 5, { align: "center" });
  };

  // Função para desenhar header com gradiente simulado
  const drawGradientHeader = (title: string, subtitle?: string, yPos: number = 0) => {
    // Simular gradiente com retângulos
    const headerHeight = subtitle ? 45 : 35;
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(COLORS.carmim[0] + (COLORS.carmimDark[0] - COLORS.carmim[0]) * ratio);
      const g = Math.round(COLORS.carmim[1] + (COLORS.carmimDark[1] - COLORS.carmim[1]) * ratio);
      const b = Math.round(COLORS.carmim[2] + (COLORS.carmimDark[2] - COLORS.carmim[2]) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(0, yPos + (i * headerHeight / steps), pageWidth, headerHeight / steps + 0.5, 'F');
    }
    
    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, yPos + (subtitle ? 22 : 20), { align: "center" });
    
    // Subtítulo
    if (subtitle) {
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.goldLight);
      doc.setFont("helvetica", "normal");
      doc.text(subtitle, pageWidth / 2, yPos + 34, { align: "center" });
    }
    
    // Linha decorativa dourada
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.8);
    doc.line(pageWidth / 2 - 40, yPos + headerHeight - 2, pageWidth / 2 + 40, yPos + headerHeight - 2);
    
    return yPos + headerHeight + 5;
  };

  // Função para verificar quebra de página
  const checkAddPage = (yPos: number, requiredSpace: number = 40): number => {
    if (yPos + requiredSpace > pageHeight - 25) {
      addFooter();
      doc.addPage();
      currentPage++;
      return 20;
    }
    return yPos;
  };

  // ============ PÁGINA 1 - CAPA ============
  let yPos = drawGradientHeader("MAPA DE PERSONALIDADE", "Teste dos Cinco Grandes Fatores");
  
  yPos += 5;
  
  // Box introdutório
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');
  
  // Linha dourada decorativa no topo do box
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, yPos + 0.5, pageWidth - margin - 10, yPos + 0.5);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkText);
  doc.setFont("helvetica", "normal");
  
  const introText = "Este relatório apresenta uma análise detalhada do seu perfil de personalidade baseado no modelo dos Cinco Grandes Fatores (Big Five), amplamente reconhecido na psicologia como uma das estruturas mais robustas para compreender as principais dimensões da personalidade humana.";
  const introLines = doc.splitTextToSize(introText, contentWidth - 20);
  doc.text(introLines, margin + 10, yPos + 12);
  
  // Informações do participante
  if (userName) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont("helvetica", "bold");
    doc.text(`Participante: ${userName}`, margin + 10, yPos + 28);
  }
  doc.setTextColor(...COLORS.lightText);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${testDate.toLocaleDateString("pt-BR")}`, userName ? margin + 100 : margin + 10, yPos + 28);
  
  yPos += 45;

  // ============ SEÇÃO: 5 GRANDES TRAÇOS ============
  // Header da seção
  doc.setFillColor(...COLORS.carmim);
  doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
  
  // Ícone "5" em dourado
  doc.setFillColor(...COLORS.gold);
  doc.circle(margin + 12, yPos + 6, 5, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.carmim);
  doc.setFont("helvetica", "bold");
  doc.text("5", margin + 12, yPos + 8, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text("GRANDES TRAÇOS DE PERSONALIDADE", margin + 25, yPos + 8);
  
  yPos += 18;

  // Cards dos traços com progress bars
  const traitOrder = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'];
  const traitEntries = traitOrder
    .filter(trait => traitScores[trait] !== undefined)
    .map(trait => [trait, traitScores[trait]] as [string, number]);
  
  // Se não encontrou com chaves em inglês, tenta português
  if (traitEntries.length === 0) {
    const ptTraitOrder = ['neuroticismo', 'extroversao', 'abertura', 'amabilidade', 'conscienciosidade'];
    ptTraitOrder.forEach(trait => {
      if (traitScores[trait] !== undefined) {
        traitEntries.push([trait, traitScores[trait]]);
      }
    });
  }

  traitEntries.forEach(([trait, score], index) => {
    yPos = checkAddPage(yPos, 22);
    
    // Card do traço
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
    
    // Nome do traço
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.darkText);
    doc.setFont("helvetica", "bold");
    doc.text(getTraitLabel(trait), margin + 5, yPos + 7);
    
    // Classificação recalculada
    const classification = getTraitClassification(score);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont("helvetica", "normal");
    doc.text(classification, margin + 5, yPos + 14);
    
    // Progress bar
    const barX = margin + 70;
    const barWidth = contentWidth - 100;
    const barHeight = 6;
    const barY = yPos + 6;
    
    // Fundo da barra
    doc.setFillColor(...COLORS.dustyMauve);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    // Barra de progresso (60-300 range)
    const progress = Math.min(Math.max((score - 60) / 240, 0), 1);
    const progressColor = getScoreColor(score, true);
    doc.setFillColor(...progressColor);
    doc.roundedRect(barX, barY, barWidth * progress, barHeight, 2, 2, 'F');
    
    // Score
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont("helvetica", "bold");
    doc.text(score.toString(), pageWidth - margin - 15, yPos + 11, { align: "right" });
    
    yPos += 20;
  });

  addFooter();
  
  // ============ PÁGINA 2+ - FACETAS DETALHADAS ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("DETALHAMENTO POR TRAÇO", "Facetas e Scores Individuais");
  yPos += 5;

  traitEntries.forEach(([trait, traitScore]) => {
    yPos = checkAddPage(yPos, 60);
    
    // Linha decorativa dourada antes do título
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 30, yPos);
    
    // Título do traço
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont("helvetica", "bold");
    doc.text(getTraitLabel(trait), margin + 35, yPos + 1);
    
    // Score do traço
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont("helvetica", "normal");
    const traitClassification = getTraitClassification(traitScore);
    doc.text(`Score: ${traitScore} • ${traitClassification}`, margin + 35, yPos + 8);
    
    yPos += 15;

    // Cards das facetas
    const traitFacets = facetScores[trait] || {};
    const facetEntries = Object.entries(traitFacets);
    
    if (facetEntries.length > 0) {
      // Grid de facetas (2 colunas)
      const cardWidth = (contentWidth - 5) / 2;
      const cardHeight = 14;
      
      facetEntries.forEach(([facetKey, facetScore], idx) => {
        const isLeft = idx % 2 === 0;
        const cardX = isLeft ? margin : margin + cardWidth + 5;
        
        if (isLeft && idx > 0) {
          yPos += cardHeight + 3;
          yPos = checkAddPage(yPos, cardHeight + 5);
        }
        
        const cardY = yPos;
        
        // Fundo do card
        doc.setFillColor(...COLORS.offWhite);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'F');
        
        // Nome da faceta
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.darkText);
        doc.setFont("helvetica", "bold");
        const facetLabel = getFacetLabel(facetKey);
        doc.text(facetLabel.substring(0, 25), cardX + 3, cardY + 5);
        
        // Score e classificação
        const facetClassification = getFacetClassification(facetScore);
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.lightText);
        doc.setFont("helvetica", "normal");
        doc.text(`${facetScore}`, cardX + 3, cardY + 11);
        
        // Badge de classificação
        const badgeColor = getScoreColor(facetScore, false);
        const badgeX = cardX + cardWidth - 35;
        doc.setFillColor(...badgeColor);
        doc.roundedRect(badgeX, cardY + 3, 32, 8, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(...COLORS.white);
        doc.setFont("helvetica", "bold");
        doc.text(facetClassification, badgeX + 16, cardY + 8, { align: "center" });
      });
      
      yPos += cardHeight + 10;
    }
    
    yPos += 5;
  });

  addFooter();

  // ============ ANÁLISE DA IA ============
  if (aiAnalysis) {
    doc.addPage();
    currentPage++;
    yPos = drawGradientHeader("ANÁLISE PERSONALIZADA", "Interpretação Detalhada do Seu Perfil");
    yPos += 10;

    const cleanedAnalysis = cleanMarkdown(aiAnalysis);
    const paragraphs = cleanedAnalysis.split('\n\n').filter(p => p.trim());

    paragraphs.forEach((paragraph) => {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) return;

      yPos = checkAddPage(yPos, 20);

      // Detectar se é um título (geralmente curto e pode ter " – " ou ":")
      const isSectionTitle = (
        trimmedParagraph.length < 80 && 
        (trimmedParagraph.includes(' – ') || 
         trimmedParagraph.includes(':') ||
         trimmedParagraph.toUpperCase() === trimmedParagraph ||
         /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(trimmedParagraph) && !trimmedParagraph.includes('.'))
      );

      if (isSectionTitle) {
        yPos = checkAddPage(yPos, 25);
        
        // Linha decorativa dourada
        doc.setDrawColor(...COLORS.gold);
        doc.setLineWidth(0.4);
        doc.line(margin, yPos, margin + 20, yPos);
        
        // Título em carmim
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.carmim);
        doc.setFont("helvetica", "bold");
        
        const titleLines = doc.splitTextToSize(trimmedParagraph, contentWidth - 25);
        doc.text(titleLines, margin + 25, yPos + 1);
        yPos += (titleLines.length * 6) + 8;
      } else {
        // Parágrafo normal
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.darkText);
        doc.setFont("helvetica", "normal");

        // Verificar se é uma lista
        if (trimmedParagraph.startsWith('•') || trimmedParagraph.startsWith('-')) {
          const lines = trimmedParagraph.split('\n');
          lines.forEach((line) => {
            yPos = checkAddPage(yPos, 8);
            const bulletLine = line.replace(/^[-•]\s*/, '• ');
            const wrappedLines = doc.splitTextToSize(bulletLine, contentWidth - 10);
            doc.text(wrappedLines, margin + 5, yPos);
            yPos += wrappedLines.length * 5 + 2;
          });
          yPos += 4;
        } else {
          const wrappedLines = doc.splitTextToSize(trimmedParagraph, contentWidth);
          
          wrappedLines.forEach((line: string, lineIdx: number) => {
            yPos = checkAddPage(yPos, 6);
            doc.text(line, margin, yPos);
            yPos += 5;
          });
          yPos += 4;
        }
      }
    });

    addFooter();
  }

  // ============ PÁGINA FINAL - SOBRE ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader("SOBRE O MAPA DE PERSONALIDADE");
  yPos += 10;

  // Box explicativo
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'F');
  
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, yPos + 0.5, pageWidth - margin - 10, yPos + 0.5);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkText);
  doc.setFont("helvetica", "normal");
  
  const aboutText = `O Mapa de Personalidade é baseado no modelo dos Cinco Grandes Fatores (Big Five), um dos modelos de personalidade mais amplamente aceitos e validados na psicologia contemporânea. Ele mede cinco dimensões fundamentais que capturam as principais diferenças na personalidade humana:

• Neuroticismo - Tendência a experimentar emoções negativas
• Extroversão - Nível de energia e sociabilidade
• Abertura - Curiosidade intelectual e criatividade
• Amabilidade - Cooperação e consideração pelos outros
• Conscienciosidade - Organização e autodisciplina

Cada traço é medido em um espectro, e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade que refletem suas tendências naturais e preferências comportamentais.`;
  
  const aboutLines = doc.splitTextToSize(aboutText, contentWidth - 20);
  doc.text(aboutLines, margin + 10, yPos + 12);

  addFooter();

  // Nome do arquivo
  const dateStr = testDate.toISOString().split('T')[0];
  const fileName = userName 
    ? `mapa-personalidade-${userName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`
    : `mapa-personalidade-${dateStr}.pdf`;

  doc.save(fileName);
};
