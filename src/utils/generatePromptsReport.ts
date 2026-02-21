import jsPDF from 'jspdf';
import { ALL_EDGE_FUNCTION_PROMPTS, LANGUAGES } from '@/data/edgeFunctionPrompts';

const CARMIM = [123, 25, 43] as const;
const CARMIM_DARK = [90, 18, 32] as const;
const GOLD = [191, 155, 48] as const;
const GOLD_LIGHT = [218, 190, 110] as const;
const OFF_WHITE = [248, 246, 242] as const;
const LIGHT_TEXT = [120, 120, 120] as const;

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 17;
const CONTENT_TOP = MARGIN + HEADER_HEIGHT + 10;
const CONTENT_BOTTOM = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT - 5;

let currentPage = 0;
let totalPages = 0;

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Gradient header
  const steps = 20;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r = CARMIM[0] + (CARMIM_DARK[0] - CARMIM[0]) * ratio;
    const g = CARMIM[1] + (CARMIM_DARK[1] - CARMIM[1]) * ratio;
    const b = CARMIM[2] + (CARMIM_DARK[2] - CARMIM[2]) * ratio;
    doc.setFillColor(r, g, b);
    doc.rect(0, MARGIN + (HEADER_HEIGHT / steps) * i, PAGE_WIDTH, HEADER_HEIGHT / steps + 0.5, 'F');
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, PAGE_WIDTH / 2, MARGIN + 16, { align: 'center' });

  doc.setTextColor(...GOLD_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(subtitle, PAGE_WIDTH / 2, MARGIN + 28, { align: 'center' });

  // Gold line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  const lineWidth = 80;
  doc.line((PAGE_WIDTH - lineWidth) / 2, MARGIN + 34, (PAGE_WIDTH + lineWidth) / 2, MARGIN + 34);
}

function addFooter(doc: jsPDF, pageNum: number) {
  const y = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT;
  doc.setFillColor(...OFF_WHITE);
  doc.rect(0, y, PAGE_WIDTH, FOOTER_HEIGHT + MARGIN, 'F');

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 1, PAGE_WIDTH - MARGIN, y + 1);

  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Página ${pageNum}`, PAGE_WIDTH / 2, y + 9, { align: 'center' });

  doc.setTextColor(...CARMIM);
  doc.setFontSize(7);
  doc.text('Documentação de Prompts – Criado por Luciana Belenton', PAGE_WIDTH / 2, y + 14, { align: 'center' });
}

function newPage(doc: jsPDF, headerTitle: string, headerSubtitle: string): number {
  if (currentPage > 0) doc.addPage();
  currentPage++;
  addHeader(doc, headerTitle, headerSubtitle);
  addFooter(doc, currentPage);
  return CONTENT_TOP;
}

function writeMonoText(doc: jsPDF, text: string, startY: number, headerTitle: string, headerSubtitle: string): number {
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 4);
  const lineHeight = 3.5;
  let y = startY;

  for (const line of lines) {
    if (y + lineHeight > CONTENT_BOTTOM) {
      y = newPage(doc, headerTitle, headerSubtitle);
    }
    doc.text(line, MARGIN + 2, y);
    y += lineHeight;
  }

  return y;
}

function writeSectionTitle(doc: jsPDF, title: string, y: number, headerTitle: string, headerSubtitle: string): number {
  if (y + 15 > CONTENT_BOTTOM) {
    y = newPage(doc, headerTitle, headerSubtitle);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...CARMIM);
  doc.text(title, MARGIN, y);
  
  // Underline
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 2, MARGIN + doc.getTextWidth(title), y + 2);

  return y + 8;
}

export function generatePromptsReport() {
  const doc = new jsPDF('p', 'mm', 'a4');
  currentPage = 0;

  // ── COVER PAGE ──
  currentPage++;
  doc.setFillColor(...CARMIM_DARK);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Gold accent lines
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(40, 80, PAGE_WIDTH - 40, 80);
  doc.line(40, 200, PAGE_WIDTH - 40, 200);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Documentação', PAGE_WIDTH / 2, 110, { align: 'center' });
  doc.text('de Prompts', PAGE_WIDTH / 2, 125, { align: 'center' });

  doc.setTextColor(...GOLD_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text('Edge Functions – IA', PAGE_WIDTH / 2, 145, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, PAGE_WIDTH / 2, 165, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Modelo: google/gemini-2.5-flash', PAGE_WIDTH / 2, 180, { align: 'center' });

  addFooter(doc, currentPage);

  // ── INDEX PAGE ──
  let y = newPage(doc, 'Índice', 'Sumário dos Prompts');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  for (const fn of ALL_EDGE_FUNCTION_PROMPTS) {
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...CARMIM);
    doc.setFontSize(11);
    doc.text(`● ${fn.displayName}`, MARGIN + 5, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(`Função: ${fn.name} | Modelo: ${fn.model}`, MARGIN + 10, y);
    y += 4;

    for (const lang of LANGUAGES) {
      doc.text(`– System Prompt (${lang.label})`, MARGIN + 15, y);
      y += 4;
    }
    doc.text(`– User Prompt Template (PT/EN/ES)`, MARGIN + 15, y);
    y += 8;
  }

  // ── PROMPT PAGES ──
  for (const fn of ALL_EDGE_FUNCTION_PROMPTS) {
    for (const lang of LANGUAGES) {
      const prompt = fn.prompts[lang.code];
      const headerTitle = fn.displayName;
      const headerSubtitle = `System Prompt – ${lang.label}`;

      y = newPage(doc, headerTitle, headerSubtitle);

      // Metadata box
      doc.setFillColor(...OFF_WHITE);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2, 2, 'F');
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...CARMIM);
      doc.text(`Função: ${fn.name}`, MARGIN + 4, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...LIGHT_TEXT);
      doc.text(`Modelo: ${fn.model} | Idioma: ${lang.label}`, MARGIN + 4, y + 11);
      y += 20;

      // System prompt
      y = writeSectionTitle(doc, `System Prompt (${lang.label})`, y, headerTitle, headerSubtitle);
      y = writeMonoText(doc, prompt.systemPrompt, y, headerTitle, headerSubtitle);
      y += 8;

      // User prompt template
      if (y + 20 > CONTENT_BOTTOM) {
        y = newPage(doc, headerTitle, `User Prompt Template – ${lang.label}`);
      }
      y = writeSectionTitle(doc, `User Prompt Template (${lang.label})`, y, headerTitle, `User Prompt Template – ${lang.label}`);
      y = writeMonoText(doc, prompt.userPromptTemplate, y, headerTitle, `User Prompt Template – ${lang.label}`);
    }
  }

  doc.save('Documentacao_Prompts_Edge_Functions.pdf');
}
