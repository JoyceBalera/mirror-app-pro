import { useState, useEffect, useCallback, useRef } from "react";
import { TraitScore } from "@/types/test";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Download, Sparkles, Loader2, AlertCircle } from "lucide-react";
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
import { SCORING, getTraitPercentage, getFacetPercentage } from "@/constants/scoring";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasGeneratedRef = useRef(false);

  const getScoreColor = (score: number) => {
    // Faixas de faceta para 10 questões (10-50)
    if (score <= 23) return "bg-red-500";      // Baixa (10-23)
    if (score <= 36) return "bg-yellow-500";   // Média (24-36)
    return "bg-green-500";                     // Alta (37-50)
  };

  const handleGenerateAnalysis = useCallback(async () => {
    // Validação: verificar se traitScores está válido
    if (!traitScores || traitScores.length === 0) {
      console.error("TraitScores inválido:", traitScores);
      setError("Dados de traços inválidos");
      toast({
        title: "Erro",
        description: "Não há dados de traços para analisar.",
        variant: "destructive",
      });
      return;
    }

    // Prevenir múltiplas chamadas
    if (hasGeneratedRef.current) {
      console.log("Análise já foi gerada, ignorando chamada duplicada");
      return;
    }

    console.log("Iniciando geração de análise...", { traitScores });
    setIsGenerating(true);
    setError(null);

    // Timeout de segurança de 60 segundos
    timeoutRef.current = setTimeout(() => {
      console.error("Timeout: Análise demorou mais de 60 segundos");
      setIsGenerating(false);
      setError("A geração da análise demorou muito tempo");
      toast({
        title: "Tempo esgotado",
        description: "A análise está demorando muito. Tente novamente.",
        variant: "destructive",
      });
    }, 60000);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-personality", {
        body: { traitScores },
      });

      // Limpar timeout se chegou aqui
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (error) {
        console.error("Erro na função:", error);
        throw error;
      }

      if (data.error) {
        console.error("Erro retornado pela função:", data.error);
        throw new Error(data.error);
      }

      if (!data || !data.analysis) {
        console.error("Resposta inválida da função:", data);
        throw new Error("Resposta inválida da função de análise");
      }

      console.log("=== ANÁLISE RECEBIDA ===");
      console.log("Tipo:", typeof data.analysis);
      console.log("Tamanho:", data.analysis?.length);
      console.log("Preview:", data.analysis?.substring(0, 100));

      console.log("Análise gerada com sucesso");
      setAiAnalysis(data.analysis);
      hasGeneratedRef.current = true; // Marca como gerado APÓS sucesso
      
      // Save AI analysis to database
      if (sessionId) {
        console.log("Salvando análise no banco...", sessionId);
        try {
          await supabase.from('ai_analyses').insert({
            session_id: sessionId,
            analysis_text: data.analysis,
            model_used: 'gemini-2.5-flash',
          });
          console.log("Análise salva com sucesso no banco");
        } catch (error) {
          console.error('Erro ao salvar análise no banco:', error);
        }
      }
      
      toast({
        title: "🎉 Análise pronta!",
        description: "Seu PDF agora está completo com a análise personalizada.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      hasGeneratedRef.current = false; // Permite retry em caso de erro
      
      let errorMessage = "Não foi possível gerar a análise. Tente novamente.";
      
      if (error.message?.includes("429") || error.message?.includes("limite")) {
        errorMessage = "Limite de requisições excedido. Aguarde alguns minutos.";
      } else if (error.message?.includes("402") || error.message?.includes("créditos")) {
        errorMessage = "Créditos de IA esgotados. Adicione créditos nas configurações.";
      }
      
      setError(errorMessage);
      toast({
        title: "Erro ao gerar análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // Garantir que sempre para o loading
      setIsGenerating(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [traitScores, sessionId, toast, aiAnalysis, isGenerating]);

  // Gera análise automaticamente quando o componente montar
  useEffect(() => {
    console.log("useEffect executado, traitScores:", traitScores);
    console.log("hasGeneratedRef.current:", hasGeneratedRef.current);
    
    // Só executa se ainda não foi gerado
    if (!hasGeneratedRef.current && !isGenerating) {
      console.log("Iniciando geração automática...");
      handleGenerateAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mantém array vazio para executar apenas na montagem

  // Auto-fechar modal e baixar PDF quando análise terminar
  useEffect(() => {
    if (showWaitDialog && aiAnalysis && !isGenerating) {
      console.log("Análise pronta, fechando modal e iniciando download...");
      setShowWaitDialog(false);
      // Pequeno delay para garantir que o modal fechou
      setTimeout(() => {
        handleDownload();
      }, 150);
    }
  }, [aiAnalysis, isGenerating, showWaitDialog]);

  // Fechar modal em caso de erro
  useEffect(() => {
    if (showWaitDialog && error && !isGenerating) {
      console.log("Erro detectado, fechando modal...");
      setShowWaitDialog(false);
    }
  }, [error, isGenerating, showWaitDialog]);

  // Log do estado atual no render
  console.log("=== RENDER Results ===");
  console.log("aiAnalysis:", aiAnalysis ? `${aiAnalysis.length} caracteres` : "null");
  console.log("isGenerating:", isGenerating);
  console.log("hasGeneratedRef.current:", hasGeneratedRef.current);

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

        {/* Mensagem de erro com opção de retry */}
        {error && !isGenerating && (
          <Card className="mb-6 p-4 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Erro ao gerar análise</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    hasGeneratedRef.current = false;
                    handleGenerateAnalysis();
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
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
                  value={getTraitPercentage(trait.score)}
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
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowWaitDialog(false);
                  // Baixa o PDF sem a análise
                  handleDownload();
                }}
              >
                Baixar sem análise
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWaitDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
