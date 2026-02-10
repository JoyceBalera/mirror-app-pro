import jsPDF from "jspdf";
import { TRAIT_LABELS } from "@/constants/scoring";
import { facetNames } from "@/utils/scoreCalculator";

type PDFLanguage = 'pt' | 'es' | 'en';

interface PDFOptions {
  language?: PDFLanguage;
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

// Date locale mapping
const DATE_LOCALES: Record<PDFLanguage, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US'
};

// Translation type definition
interface PDFTranslations {
  headerTitle: string;
  headerSubtitle: string;
  introText: string;
  participantLabel: string;
  dateLabel: string;
  traitsHeader: string;
  detailHeader: string;
  detailSubtitle: string;
  scoreLabel: string;
  analysisHeader: string;
  analysisSubtitle: string;
  aboutHeader: string;
  aboutText: string;
  pageOf: string;
  createdBy: string;
  fileName: string;
  traits: {
    neuroticism: string;
    extraversion: string;
    openness: string;
    agreeableness: string;
    conscientiousness: string;
  };
  traitClassifications: {
    veryLow: string;
    low: string;
    medium: string;
    high: string;
    veryHigh: string;
  };
  facetClassifications: {
    veryLow: string;
    low: string;
    medium: string;
    high: string;
    veryHigh: string;
  };
  facetNames: Record<string, string>;
}

// Get translations based on language
const getTranslations = (lang: PDFLanguage): PDFTranslations => {
  const translations: Record<PDFLanguage, PDFTranslations> = {
    pt: {
      headerTitle: 'MAPA DE PERSONALIDADE',
      headerSubtitle: 'Análise Comportamental Big Five',
      introText: 'Este relatório apresenta uma análise detalhada do seu perfil de personalidade baseado no modelo Big Five, amplamente reconhecido na psicologia como uma das estruturas mais robustas para compreender as principais dimensões da personalidade humana.',
      participantLabel: 'Participante',
      dateLabel: 'Data',
      traitsHeader: 'GRANDES TRAÇOS DE PERSONALIDADE',
      detailHeader: 'DETALHAMENTO POR TRAÇO',
      detailSubtitle: 'Facetas e Scores Individuais',
      scoreLabel: 'Score',
      analysisHeader: 'ANÁLISE PERSONALIZADA',
      analysisSubtitle: 'Interpretação Detalhada do Seu Perfil',
      aboutHeader: 'SOBRE O BIG FIVE',
      aboutText: `O Mapa de Personalidade é baseado no modelo Big Five, um dos modelos de personalidade mais amplamente aceitos e validados na psicologia contemporânea. Ele mede cinco dimensões fundamentais que capturam as principais diferenças na personalidade humana:

• Neuroticismo - Tendência a experimentar emoções negativas
• Extroversão - Nível de energia e sociabilidade
• Abertura - Curiosidade intelectual e criatividade
• Amabilidade - Cooperação e consideração pelos outros
• Conscienciosidade - Organização e autodisciplina

Cada traço é medido em um espectro, e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade que refletem suas tendências naturais e preferências comportamentais.`,
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Criado por Luciana Belenton',
      fileName: 'mapa-personalidade',
      traits: {
        neuroticism: 'Neuroticismo',
        extraversion: 'Extroversão',
        openness: 'Abertura à Experiência',
        agreeableness: 'Amabilidade',
        conscientiousness: 'Conscienciosidade'
      },
      traitClassifications: {
        veryLow: 'Muito Baixo',
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto',
        veryHigh: 'Muito Alto'
      },
      facetClassifications: {
        veryLow: 'Muito Baixa',
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        veryHigh: 'Muito Alta'
      },
      facetNames: {
        N1: 'Ansiedade', N2: 'Hostilidade', N3: 'Depressão', N4: 'Autoconsciência', N5: 'Impulsividade', N6: 'Vulnerabilidade',
        E1: 'Calor', E2: 'Sociabilidade', E3: 'Assertividade', E4: 'Atividade', E5: 'Busca de Aventuras', E6: 'Emoções Positivas',
        O1: 'Fantasia', O2: 'Estética', O3: 'Sentimentos', O4: 'Ações', O5: 'Ideias', O6: 'Valores',
        A1: 'Confiança', A2: 'Franqueza', A3: 'Altruísmo', A4: 'Aquiescência', A5: 'Modéstia', A6: 'Sensibilidade',
        C1: 'Competência', C2: 'Ordem', C3: 'Sentido de Dever', C4: 'Esforço por Realização', C5: 'Autodisciplina', C6: 'Ponderação'
      }
    },
    es: {
      headerTitle: 'MAPA DE PERSONALIDAD',
      headerSubtitle: 'Análisis Conductual Big Five',
      introText: 'Este informe presenta un análisis detallado de su perfil de personalidad basado en el modelo Big Five, ampliamente reconocido en psicología como una de las estructuras más robustas para comprender las principales dimensiones de la personalidad humana.',
      participantLabel: 'Participante',
      dateLabel: 'Fecha',
      traitsHeader: 'GRANDES RASGOS DE PERSONALIDAD',
      detailHeader: 'DETALLE POR RASGO',
      detailSubtitle: 'Facetas y Puntuaciones Individuales',
      scoreLabel: 'Puntuación',
      analysisHeader: 'ANÁLISIS PERSONALIZADO',
      analysisSubtitle: 'Interpretación Detallada de Su Perfil',
      aboutHeader: 'SOBRE EL BIG FIVE',
      aboutText: `El Mapa de Personalidad está basado en el modelo Big Five, uno de los modelos de personalidad más ampliamente aceptados y validados en la psicología contemporánea. Mide cinco dimensiones fundamentales que capturan las principales diferencias en la personalidad humana:

• Neuroticismo - Tendencia a experimentar emociones negativas
• Extraversión - Nivel de energía y sociabilidad
• Apertura - Curiosidad intelectual y creatividad
• Amabilidad - Cooperación y consideración hacia los demás
• Responsabilidad - Organización y autodisciplina

Cada rasgo se mide en un espectro, y no hay puntuaciones "buenas" o "malas" - solo diferentes perfiles de personalidad que reflejan sus tendencias naturales y preferencias conductuales.`,
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Creado por Luciana Belenton',
      fileName: 'mapa-personalidad',
      traits: {
        neuroticism: 'Neuroticismo',
        extraversion: 'Extraversión',
        openness: 'Apertura a la Experiencia',
        agreeableness: 'Amabilidad',
        conscientiousness: 'Responsabilidad'
      },
      traitClassifications: {
        veryLow: 'Muy Bajo',
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto',
        veryHigh: 'Muy Alto'
      },
      facetClassifications: {
        veryLow: 'Muy Baja',
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        veryHigh: 'Muy Alta'
      },
      facetNames: {
        N1: 'Ansiedad', N2: 'Hostilidad', N3: 'Depresión', N4: 'Autoconciencia', N5: 'Impulsividad', N6: 'Vulnerabilidad',
        E1: 'Calidez', E2: 'Sociabilidad', E3: 'Asertividad', E4: 'Actividad', E5: 'Búsqueda de Aventuras', E6: 'Emociones Positivas',
        O1: 'Fantasía', O2: 'Estética', O3: 'Sentimientos', O4: 'Acciones', O5: 'Ideas', O6: 'Valores',
        A1: 'Confianza', A2: 'Franqueza', A3: 'Altruismo', A4: 'Complacencia', A5: 'Modestia', A6: 'Sensibilidad',
        C1: 'Competencia', C2: 'Orden', C3: 'Sentido del Deber', C4: 'Esfuerzo por el Logro', C5: 'Autodisciplina', C6: 'Deliberación'
      }
    },
    en: {
      headerTitle: 'PERSONALITY MAP',
      headerSubtitle: 'Big Five Behavioral Analysis',
      introText: 'This report presents a detailed analysis of your personality profile based on the Big Five model, widely recognized in psychology as one of the most robust frameworks for understanding the main dimensions of human personality.',
      participantLabel: 'Participant',
      dateLabel: 'Date',
      traitsHeader: 'BIG FIVE PERSONALITY TRAITS',
      detailHeader: 'TRAIT BREAKDOWN',
      detailSubtitle: 'Individual Facets and Scores',
      scoreLabel: 'Score',
      analysisHeader: 'PERSONALIZED ANALYSIS',
      analysisSubtitle: 'Detailed Interpretation of Your Profile',
      aboutHeader: 'ABOUT THE BIG FIVE',
      aboutText: `The Personality Map is based on the Big Five model, one of the most widely accepted and validated personality models in contemporary psychology. It measures five fundamental dimensions that capture the main differences in human personality:

• Neuroticism - Tendency to experience negative emotions
• Extraversion - Level of energy and sociability
• Openness - Intellectual curiosity and creativity
• Agreeableness - Cooperation and consideration for others
• Conscientiousness - Organization and self-discipline

Each trait is measured on a spectrum, and there are no "good" or "bad" scores - just different personality profiles that reflect your natural tendencies and behavioral preferences.`,
      pageOf: 'Page {{current}} of {{total}}',
      createdBy: 'Created by Luciana Belenton',
      fileName: 'personality-map',
      traits: {
        neuroticism: 'Neuroticism',
        extraversion: 'Extraversion',
        openness: 'Openness to Experience',
        agreeableness: 'Agreeableness',
        conscientiousness: 'Conscientiousness'
      },
      traitClassifications: {
        veryLow: 'Very Low',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        veryHigh: 'Very High'
      },
      facetClassifications: {
        veryLow: 'Very Low',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        veryHigh: 'Very High'
      },
      facetNames: {
        N1: 'Anxiety', N2: 'Hostility', N3: 'Depression', N4: 'Self-Consciousness', N5: 'Impulsiveness', N6: 'Vulnerability',
        E1: 'Warmth', E2: 'Gregariousness', E3: 'Assertiveness', E4: 'Activity', E5: 'Excitement-Seeking', E6: 'Positive Emotions',
        O1: 'Fantasy', O2: 'Aesthetics', O3: 'Feelings', O4: 'Actions', O5: 'Ideas', O6: 'Values',
        A1: 'Trust', A2: 'Straightforwardness', A3: 'Altruism', A4: 'Compliance', A5: 'Modesty', A6: 'Tender-Mindedness',
        C1: 'Competence', C2: 'Order', C3: 'Dutifulness', C4: 'Achievement Striving', C5: 'Self-Discipline', C6: 'Deliberation'
      }
    }
  };
  return translations[lang] || translations.pt;
};

// Trait key mapping (normalize trait names to standard keys)
const normalizeTraitKey = (trait: string): keyof PDFTranslations['traits'] | null => {
  const mapping: Record<string, keyof PDFTranslations['traits']> = {
    neuroticism: 'neuroticism',
    neuroticismo: 'neuroticism',
    extraversion: 'extraversion',
    extroversao: 'extraversion',
    openness: 'openness',
    abertura: 'openness',
    agreeableness: 'agreeableness',
    amabilidade: 'agreeableness',
    conscientiousness: 'conscientiousness',
    conscienciosidade: 'conscientiousness'
  };
  // First try direct match, then try with accents removed for keys like "extroversão"
  const direct = mapping[trait.toLowerCase()];
  if (direct) return direct;
  const normalized = trait.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return mapping[normalized] || null;
};

// Get localized trait label
const getTraitLabelLocalized = (trait: string, t: PDFTranslations): string => {
  const normalizedKey = normalizeTraitKey(trait);
  if (normalizedKey) {
    return t.traits[normalizedKey];
  }
  return TRAIT_LABELS[trait] || trait;
};

// Get localized facet label
const getFacetLabelLocalized = (facet: string, t: PDFTranslations): string => {
  return t.facetNames[facet] || facetNames[facet] || facet;
};

// Get localized trait classification
const getTraitClassificationLocalized = (score: number, t: PDFTranslations): string => {
  if (score <= 108) return t.traitClassifications.veryLow;
  if (score <= 156) return t.traitClassifications.low;
  if (score <= 198) return t.traitClassifications.medium;
  if (score <= 246) return t.traitClassifications.high;
  return t.traitClassifications.veryHigh;
};

// Get localized facet classification
const getFacetClassificationLocalized = (score: number, t: PDFTranslations): string => {
  if (score <= 18) return t.facetClassifications.veryLow;
  if (score <= 26) return t.facetClassifications.low;
  if (score <= 33) return t.facetClassifications.medium;
  if (score <= 41) return t.facetClassifications.high;
  return t.facetClassifications.veryHigh;
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
  const { language = 'pt', userName, testDate = new Date(), aiAnalysis } = options;
  
  // Get translations for the selected language
  const t = getTranslations(language);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentPage = 1;

  // Função auxiliar para adicionar rodapé (padronizada com HD e Integrado)
  const addFooter = (pageNum: number, totalPages: number) => {
    // Linha dourada no topo do rodapé
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Fundo off-white do rodapé
    doc.setFillColor(...COLORS.offWhite);
    doc.rect(0, pageHeight - 17, pageWidth, 17, 'F');
    
    // Número da página: "Página X de Y"
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont("helvetica", "normal");
    const pageText = t.pageOf.replace('{{current}}', String(pageNum)).replace('{{total}}', String(totalPages));
    doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    // Crédito
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.carmim);
    doc.text(t.createdBy, pageWidth / 2, pageHeight - 5, { align: "center" });
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

  // Função para verificar quebra de página (sem adicionar rodapé durante geração)
  const checkAddPage = (yPos: number, requiredSpace: number = 40): number => {
    if (yPos + requiredSpace > pageHeight - 25) {
      doc.addPage();
      currentPage++;
      return 20;
    }
    return yPos;
  };

  // ============ PÁGINA 1 - CAPA ============
  let yPos = drawGradientHeader(t.headerTitle, t.headerSubtitle);
  
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
  
  const introLines = doc.splitTextToSize(t.introText, contentWidth - 20);
  doc.text(introLines, margin + 10, yPos + 12);
  
  // Informações do participante
  if (userName) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont("helvetica", "bold");
    doc.text(`${t.participantLabel}: ${userName}`, margin + 10, yPos + 28);
  }
  doc.setTextColor(...COLORS.lightText);
  doc.setFont("helvetica", "normal");
  doc.text(`${t.dateLabel}: ${testDate.toLocaleDateString(DATE_LOCALES[language])}`, userName ? margin + 100 : margin + 10, yPos + 28);
  
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
  doc.text(t.traitsHeader, margin + 25, yPos + 8);
  
  yPos += 18;

  // Cards dos traços com progress bars
  // Normalize all trait keys by removing accents for reliable matching
  const normalizeKey = (k: string) => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  const traitOrder = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'];
  const ptMapping: Record<string, string> = {
    neuroticismo: 'neuroticism',
    extroversao: 'extraversion',
    abertura: 'openness',
    amabilidade: 'agreeableness',
    conscienciosidade: 'conscientiousness'
  };
  
  // Build a normalized lookup from the input traitScores
  const normalizedScores: Record<string, number> = {};
  Object.entries(traitScores).forEach(([key, val]) => {
    const nk = normalizeKey(key);
    // Map Portuguese keys to English
    const mapped = ptMapping[nk] || nk;
    normalizedScores[mapped] = val;
    // Also keep original key mapping for downstream use
    normalizedScores[key] = val;
  });
  
  const traitEntries = traitOrder
    .filter(trait => normalizedScores[trait] !== undefined)
    .map(trait => [trait, normalizedScores[trait]] as [string, number]);

  traitEntries.forEach(([trait, score], index) => {
    yPos = checkAddPage(yPos, 22);
    
    // Card do traço
    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, 'F');
    
    // Nome do traço (localizado)
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.darkText);
    doc.setFont("helvetica", "bold");
    doc.text(getTraitLabelLocalized(trait, t), margin + 5, yPos + 7);
    
    // Classificação recalculada (localizada)
    const classification = getTraitClassificationLocalized(score, t);
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
  
  // ============ PÁGINA 2+ - FACETAS DETALHADAS ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.detailHeader, t.detailSubtitle);
  yPos += 5;

  traitEntries.forEach(([trait, traitScore]) => {
    yPos = checkAddPage(yPos, 60);
    
    // Linha decorativa dourada antes do título
    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 30, yPos);
    
    // Título do traço (localizado)
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.carmim);
    doc.setFont("helvetica", "bold");
    doc.text(getTraitLabelLocalized(trait, t), margin + 35, yPos + 1);
    
    // Score do traço (localizado)
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.lightText);
    doc.setFont("helvetica", "normal");
    const traitClassification = getTraitClassificationLocalized(traitScore, t);
    doc.text(`${t.scoreLabel}: ${traitScore} • ${traitClassification}`, margin + 35, yPos + 8);
    
    yPos += 15;

    // Cards das facetas - try English key first, then find by normalized Portuguese key
    let traitFacets = facetScores[trait] || {};
    if (Object.keys(traitFacets).length === 0) {
      // Find the original key in facetScores that maps to this English trait
      const originalKey = Object.keys(facetScores).find(k => {
        const nk = normalizeKey(k);
        return ptMapping[nk] === trait || nk === trait;
      });
      if (originalKey) traitFacets = facetScores[originalKey];
    }
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
        
        // Nome da faceta (localizado)
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.darkText);
        doc.setFont("helvetica", "bold");
        const facetLabel = getFacetLabelLocalized(facetKey, t);
        doc.text(facetLabel.substring(0, 25), cardX + 3, cardY + 5);
        
        // Score e classificação (localizada)
        const facetClassification = getFacetClassificationLocalized(facetScore, t);
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
  // ============ ANÁLISE DA IA ============
  if (aiAnalysis) {
    doc.addPage();
    currentPage++;
    yPos = drawGradientHeader(t.analysisHeader, t.analysisSubtitle);
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
  }

  // ============ PÁGINA FINAL - SOBRE ============
  doc.addPage();
  currentPage++;
  yPos = drawGradientHeader(t.aboutHeader);
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
  
  const aboutLines = doc.splitTextToSize(t.aboutText, contentWidth - 20);
  doc.text(aboutLines, margin + 10, yPos + 12);

  // ============ RODAPÉ EM TODAS AS PÁGINAS (padronizado) ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Nome do arquivo localizado
  const dateStr = testDate.toLocaleDateString(DATE_LOCALES[language]).replace(/\//g, '-');
  const fileName = userName 
    ? `${t.fileName}-${userName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`
    : `${t.fileName}-${dateStr}.pdf`;

  doc.save(fileName);
};
