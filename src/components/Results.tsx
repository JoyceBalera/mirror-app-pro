import { useState, useEffect } from "react";
import { TraitScore } from "@/types/test";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Download, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResultsProps {
  traitScores: TraitScore[];
  onRestart: () => void;
  sessionId?: string | null;
  userName?: string;
}

export const Results = ({ traitScores, onRestart, sessionId, userName }: ResultsProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWaitDialog, setShowWaitDialog] = useState(false);
  const { toast } = useToast();

  // Gera análise automaticamente quando o componente montar
  useEffect(() => {
    handleGenerateAnalysis();
  }, []);

  const getScoreColor = (score: number) => {
    // Para facetas (4-20)
    if (score >= 4 && score <= 9) return "bg-red-500";
    if (score >= 10 && score <= 15) return "bg-yellow-500";
    if (score >= 16 && score <= 20) return "bg-green-500";
    return "bg-gray-500";
  };

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-personality", {
        body: { traitScores },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAiAnalysis(data.analysis);
      
      // Save AI analysis to database
      if (sessionId) {
        try {
          await supabase.from('ai_analyses').insert({
            session_id: sessionId,
            analysis_text: data.analysis,
            model_used: 'gemini-2.5-flash',
          });
        } catch (error) {
          console.error('Error saving AI analysis:', error);
        }
      }
      
      toast({
        title: "🎉 Análise pronta!",
        description: "Seu PDF agora está completo com a análise personalizada.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      
      let errorMessage = "Não foi possível gerar a análise. Tente novamente.";
      
      if (error.message?.includes("429") || error.message?.includes("limite")) {
        errorMessage = "Limite de requisições excedido. Aguarde alguns minutos.";
      } else if (error.message?.includes("402") || error.message?.includes("créditos")) {
        errorMessage = "Créditos de IA esgotados. Adicione créditos nas configurações.";
      }
      
      toast({
        title: "Erro ao gerar análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    // Se ainda está gerando, mostra diálogo de espera
    if (isGenerating) {
      setShowWaitDialog(true);
      return;
    }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Resultados do Big Five", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (userName) {
      doc.text(`Participante: ${userName}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 5;
    }
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, yPos, { align: "center" });
    
    yPos += 15;

    // Resumo dos traços principais
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo dos Traços", 14, yPos);
    yPos += 10;

    traitScores.forEach((trait) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${trait.name}: ${trait.score}`, 14, yPos);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Classificação: ${trait.classification}`, 14, yPos + 6);
      
      yPos += 15;

      // Tabela de facetas
      const facetsData = trait.facets.map((facet) => [
        facet.name,
        facet.score.toString(),
        facet.classification,
      ]);

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
    });

    // Análise da IA (se disponível)
    if (aiAnalysis) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Análise Personalizada por IA", 14, yPos);
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
    doc.text("Sobre o Modelo Big Five", 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const footerText = `O modelo Big Five é um dos modelos de personalidade mais amplamente aceitos na psicologia. Ele mede cinco dimensões fundamentais que capturam as principais diferenças na personalidade humana. Cada traço é medido em um espectro, e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade. Este teste fornece insights sobre seus padrões comportamentais típicos e preferências naturais.`;
    
    const footerLines = doc.splitTextToSize(footerText, pageWidth - 28);
    footerLines.forEach((line: string) => {
      doc.text(line, 14, yPos);
      yPos += 6;
    });

    doc.save("resultados-big-five.pdf");
    
    toast({
      title: "PDF gerado!",
      description: "Seus resultados foram baixados.",
    });
  };

  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Indicador visual discreto durante geração */}
        {isGenerating && !aiAnalysis && (
          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">✨ Gerando análise personalizada...</p>
                <p className="text-xs text-muted-foreground">Isso levará alguns segundos</p>
              </div>
            </div>
          </Card>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {userName ? `Resultados de ${userName}` : "Seus Resultados"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {userName ? `Perfil de personalidade de ${userName} baseado no modelo Big Five` : "Aqui está o seu perfil de personalidade baseado no modelo Big Five"}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {traitScores.map((trait, index) => (
            <Card key={index} className="p-6 shadow-lg">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`text-2xl font-bold ${trait.color}`}>
                    {trait.name}
                  </h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {trait.score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trait.classification}
                    </div>
                  </div>
                </div>
                <Progress
                  value={(trait.score / 120) * 100}
                  className="h-3"
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {trait.facets.map((facet, facetIndex) => (
                  <div
                    key={facetIndex}
                    className="bg-muted/50 p-3 rounded-lg"
                  >
                    <div className="text-sm font-semibold mb-1">
                      {facet.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getScoreColor(
                          facet.score
                        )}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {facet.score} - {facet.classification}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {aiAnalysis && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Análise Personalizada por IA</h3>
                <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRestart}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Refazer Teste
          </Button>
          
          {!aiAnalysis ? (
            <Button
              onClick={handleGenerateAnalysis}
              size="lg"
              disabled={isGenerating}
              className="gradient-primary text-white hover:opacity-90 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Análise...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Análise com IA
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleGenerateAnalysis}
              size="lg"
              variant="outline"
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Regenerar Análise
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={handleDownload}
            size="lg"
            variant="secondary"
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Baixar PDF
          </Button>
        </div>

        <Card className="mt-8 p-6 bg-card/50">
          <h3 className="text-lg font-semibold mb-3">
            Sobre o Modelo Big Five
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O modelo Big Five é um dos modelos de personalidade mais amplamente 
            aceitos na psicologia. Ele mede cinco dimensões fundamentais que capturam as 
            principais diferenças na personalidade humana. Cada traço é medido em um espectro, 
            e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade. 
            Este teste fornece insights sobre seus padrões comportamentais típicos e 
            preferências naturais.
          </p>
        </Card>

        {/* Diálogo de espera para download do PDF */}
        <AlertDialog open={showWaitDialog} onOpenChange={setShowWaitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Preparando seu PDF completo
              </AlertDialogTitle>
              <AlertDialogDescription>
                Estamos finalizando sua análise personalizada para incluir no PDF. 
                Isso levará apenas alguns segundos. Aguarde um momento...
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
