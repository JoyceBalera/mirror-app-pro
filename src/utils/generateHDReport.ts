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
}

// Cores da paleta Luciana
const COLORS = {
  carmim: [123, 25, 43] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  offWhite: [247, 243, 239] as [number, number, number],
  dustyMauve: [191, 175, 178] as [number, number, number],
  darkText: [51, 51, 51] as [number, number, number],
  lightText: [120, 120, 120] as [number, number, number],
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

// Função aprimorada para limpar markdown
const cleanMarkdown = (text: string): string => {
  return text
    // Remove títulos markdown (# ## ### etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove negrito e itálico
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    // Remove separadores (--- ou --)
    .replace(/^[\s]*[-]{2,}[\s]*$/gm, '')
    // Remove linhas só com bullets/pontos
    .replace(/^[\s]*[•]{1,3}[\s]*$/gm, '')
    // Converte listas markdown em bullets
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // Remove links markdown [texto](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove código inline
    .replace(/`(.+?)`/g, '$1')
    // Remove blocos de código
    .replace(/```[\s\S]*?```/g, '')
    // Remove múltiplas linhas vazias
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
  let yPosition = 20;

  // Helper: Check if we need a new page
  const checkAddPage = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 25) {
      doc.addPage();
      yPosition = 25;
    }
  };

  // Helper: Add text with word wrap
  const addText = (
    text: string,
    fontSize: number,
    isBold: boolean = false,
    color: [number, number, number] = COLORS.darkText,
    maxWidth: number = contentWidth
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.45;

    lines.forEach((line: string) => {
      checkAddPage(lineHeight);
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    return lines.length * lineHeight;
  };

  // =================== PÁGINA 1 - CAPA ===================
  // Fundo carmim no topo
  doc.setFillColor(...COLORS.carmim);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('ANÁLISE DE', pageWidth / 2, 40, { align: 'center' });
  doc.text('DESENHO HUMANO', pageWidth / 2, 55, { align: 'center' });

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Personalizado Completo', pageWidth / 2, 72, { align: 'center' });

  yPosition = 110;

  // Box de dados pessoais
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPosition - 10, contentWidth, 45, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text('DADOS DE NASCIMENTO', margin + 10, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.setFontSize(11);

  const birthDate = new Date(data.birth_date).toLocaleDateString('pt-BR');
  doc.text(`Data: ${birthDate}`, margin + 10, yPosition);
  yPosition += 7;
  doc.text(`Horário: ${data.birth_time}`, margin + 10, yPosition);
  yPosition += 7;
  doc.text(`Local: ${data.birth_location}`, margin + 10, yPosition);

  yPosition += 25;

  // =================== RESUMO EXECUTIVO ===================
  doc.setFillColor(...COLORS.carmim);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU PERFIL ENERGÉTICO', margin + 5, yPosition + 7);
  yPosition += 18;

  // Grid de informações básicas
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
    doc.setTextColor(...COLORS.carmim);
    doc.text(item.value, xPos, yPosition + 5);
  });

  // =================== PÁGINA 2 - BODYGRAPH ===================
  doc.addPage();
  yPosition = 25;

  doc.setFillColor(...COLORS.carmim);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SEU BODYGRAPH VISUAL', margin + 5, yPosition + 7);
  yPosition += 25;

  // Calcular dados dos centros
  const definedCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => centerId);
  const openCenters = Object.entries(data.centers || {})
    .filter(([_, isDefined]) => !isDefined)
    .map(([centerId]) => centerId);
  const activeChannels = (data.channels || []).filter((ch: any) => ch.isComplete);

  // Box informativo sobre o Bodygraph
  doc.setFillColor(...COLORS.offWhite);
  doc.roundedRect(margin, yPosition, contentWidth, 55, 3, 3, 'F');
  yPosition += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.carmim);
  doc.text('Seu Bodygraph completo está disponível na plataforma online.', margin + 10, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.text('Acesse sua conta para visualizar o desenho interativo dos seus centros,', margin + 10, yPosition);
  yPosition += 6;
  doc.text('canais e gates ativados com cores e legendas detalhadas.', margin + 10, yPosition);
  yPosition += 12;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text(`Você possui ${definedCenters.length} centro(s) definido(s) e ${openCenters.length} centro(s) aberto(s).`, margin + 10, yPosition);
  yPosition += 6;
  doc.text(`Total de ${activeChannels.length} canal(is) ativo(s).`, margin + 10, yPosition);

  yPosition += 25;

  // =================== CENTROS ENERGÉTICOS ===================
  doc.setFillColor(...COLORS.carmim);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SEUS CENTROS ENERGÉTICOS', margin + 5, yPosition + 7);
  yPosition += 20;

  // Centros Definidos
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.gold);
  doc.text('Centros Definidos (Fontes de Consistência)', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.setFontSize(10);

  if (definedCenters.length > 0) {
    definedCenters.forEach((centerId) => {
      const centerName = CENTER_NAMES[centerId] || centerId;
      doc.text(`• ${centerName}`, margin + 5, yPosition);
      yPosition += 6;
    });
  } else {
    doc.text('Nenhum centro definido (Reflector)', margin + 5, yPosition);
    yPosition += 6;
  }

  yPosition += 8;

  // Centros Abertos
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.dustyMauve);
  doc.text('Centros Abertos (Áreas de Sabedoria)', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.darkText);
  doc.setFontSize(10);

  if (openCenters.length > 0) {
    openCenters.forEach((centerId) => {
      const centerName = CENTER_NAMES[centerId] || centerId;
      doc.text(`• ${centerName}`, margin + 5, yPosition);
      yPosition += 6;
    });
  } else {
    doc.text('Todos os centros definidos', margin + 5, yPosition);
    yPosition += 6;
  }

  yPosition += 15;

  // =================== CANAIS ATIVOS ===================
  checkAddPage(30);
  doc.setFillColor(...COLORS.carmim);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SEUS CANAIS DE PODER', margin + 5, yPosition + 7);
  yPosition += 20;

  if (activeChannels.length > 0) {
    doc.setFontSize(10);
    activeChannels.forEach((ch: any) => {
      checkAddPage(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.gold);
      doc.text(`Canal ${ch.id}`, margin, yPosition);
      
      if (ch.name) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.darkText);
        doc.text(`: ${ch.name}`, margin + 25, yPosition);
      }
      yPosition += 7;
    });
  } else {
    doc.setTextColor(...COLORS.darkText);
    doc.setFontSize(10);
    doc.text('Nenhum canal completo definido', margin, yPosition);
    yPosition += 7;
  }

  // =================== PÁGINA 3 - VARIÁVEIS AVANÇADAS ===================
  doc.addPage();
  yPosition = 25;

  doc.setFillColor(...COLORS.carmim);
  doc.rect(margin, yPosition, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VARIÁVEIS AVANÇADAS', margin + 5, yPosition + 7);
  yPosition += 20;

  const renderVariable = (label: string, variable: any) => {
    if (!variable) return;

    checkAddPage(30);

    doc.setFillColor(...COLORS.offWhite);
    doc.roundedRect(margin, yPosition - 3, contentWidth, 28, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.carmim);
    doc.text(label, margin + 5, yPosition + 3);

    doc.setFontSize(11);
    doc.setTextColor(...COLORS.gold);
    const primaryText = variable.level
      ? `${variable.primary} (${variable.level})`
      : variable.primary;
    doc.text(primaryText, margin + 5, yPosition + 11);

    if (variable.description) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.darkText);
      const descLines = doc.splitTextToSize(variable.description, contentWidth - 15);
      doc.text(descLines[0] || '', margin + 5, yPosition + 18);
    }

    yPosition += 32;
  };

  if (data.variables) {
    renderVariable('DIGESTÃO', data.variables.digestion);
    renderVariable('AMBIENTE', data.variables.environment);
    renderVariable('MOTIVAÇÃO', data.variables.motivation);
    renderVariable('PERSPECTIVA', data.variables.perspective);
    renderVariable('SENTIDO (Personality)', data.variables.sense);
    renderVariable('SENTIDO (Design)', data.variables.designSense);
  }

  // =================== ANÁLISE COMPLETA DA IA ===================
  if (data.ai_analysis_full) {
    doc.addPage();
    yPosition = 25;

    doc.setFillColor(...COLORS.carmim);
    doc.rect(margin, yPosition, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE PERSONALIZADA COMPLETA', margin + 5, yPosition + 7);
    yPosition += 20;

    // Processar análise completa sem limite de páginas
    const processAnalysis = (text: string) => {
      // Limpar markdown primeiro
      const cleanedText = cleanMarkdown(text);
      
      // Dividir por parágrafos
      const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
      
      paragraphs.forEach((paragraph) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return;
        
        // Detectar se é título (linha curta que parece título)
        const isTitle = trimmed.length < 80 && 
                       (trimmed.match(/^[0-9]+\./) || // Começa com número
                        trimmed.match(/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\d\.:]+$/) || // Todo em maiúscula
                        trimmed.endsWith(':') && trimmed.length < 50); // Termina com :
        
        if (isTitle) {
          checkAddPage(15);
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...COLORS.carmim);
          doc.text(trimmed, margin, yPosition);
          yPosition += 10;
        } else if (trimmed.includes('•') || trimmed.match(/^[0-9]+\./m)) {
          // É uma lista
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

    processAnalysis(data.ai_analysis_full);
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

    // Crédito - Corrigido para Luciana Belenton
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.carmim);
    doc.text('Criado por Luciana Belenton', pageWidth / 2, pageHeight - 7, {
      align: 'center',
    });
  }

  // =================== SALVAR PDF ===================
  const birthDateFormatted = new Date(data.birth_date)
    .toLocaleDateString('pt-BR')
    .replace(/\//g, '-');
  const fileName = `Desenho_Humano_${birthDateFormatted}.pdf`;
  doc.save(fileName);
}
