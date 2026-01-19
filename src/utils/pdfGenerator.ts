import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TRAIT_LABELS } from "@/constants/scoring";
import { facetNames } from "@/utils/scoreCalculator";

interface TraitData {
  name: string;
  score: number;
  classification: string;
  facets: Array<{
    name: string;
    score: number;
    classification: string;
  }>;
}

interface PDFOptions {
  userName?: string;
  testDate?: Date;
  aiAnalysis?: string;
}

const getTraitLabel = (trait: string): string => {
  return TRAIT_LABELS[trait] || trait;
};

const getFacetLabel = (facet: string): string => {
  return facetNames[facet] || facet;
};

const getClassificationLabel = (classification: string | number): string => {
  if (typeof classification === 'number') {
    if (classification < 40) return "Baixo";
    if (classification < 70) return "Médio";
    return "Alto";
  }
  const labels: { [key: string]: string } = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
    Baixa: "Baixo",
    Média: "Médio",
    Alta: "Alto",
  };
  return labels[classification] || classification;
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
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Mapa de Personalidade", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (userName) {
    doc.text(`Participante: ${userName}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
  }
  doc.text(`Data: ${testDate.toLocaleDateString("pt-BR")}`, pageWidth / 2, yPos, { align: "center" });
  
  yPos += 15;

  // Resumo dos traços principais
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo dos Traços e Facetas", 14, yPos);
  yPos += 10;

  Object.entries(traitScores).forEach(([trait, score]) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${getTraitLabel(trait)}: ${score}`, 14, yPos);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Classificação: ${getClassificationLabel(classifications[trait])}`, 14, yPos + 6);
    
    yPos += 15;

    // Tabela de facetas
    const traitFacets = facetScores[trait] || {};
    const facetsData = Object.entries(traitFacets).map(([facetKey, facetScore]) => [
      getFacetLabel(facetKey),
      facetScore.toString(),
      getClassificationLabel(facetScore),
    ]);

    if (facetsData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Faceta", "Score", "Classificação"]],
        body: facetsData,
        theme: "striped",
        headStyles: { fillColor: [100, 100, 100] },
        margin: { left: 14 },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  // Análise da IA (se disponível)
  if (aiAnalysis) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Análise Personalizada", 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const analysisLines = doc.splitTextToSize(aiAnalysis, pageWidth - 28);
    analysisLines.forEach((line: string) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 14, yPos);
      yPos += 6;
    });
  }

  // Rodapé
  doc.addPage();
  yPos = 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Sobre o Mapa de Personalidade", 14, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const footerText = `O Mapa de Personalidade é baseado no modelo dos Cinco Grandes Fatores, um dos modelos de personalidade mais amplamente aceitos na psicologia. Ele mede cinco dimensões fundamentais que capturam as principais diferenças na personalidade humana. Cada traço é medido em um espectro, e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade. Este teste fornece insights sobre seus padrões comportamentais típicos e preferências naturais.`;
  
  const footerLines = doc.splitTextToSize(footerText, pageWidth - 28);
  footerLines.forEach((line: string) => {
    doc.text(line, 14, yPos);
    yPos += 6;
  });

  // Nome do arquivo com data
  const dateStr = testDate.toISOString().split('T')[0];
  const fileName = userName 
    ? `mapa-personalidade-${userName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`
    : `mapa-personalidade-${dateStr}.pdf`;

  doc.save(fileName);
};
