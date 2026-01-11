import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, FileText, RefreshCw, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { generateIntegratedReport, IntegratedReportData } from "@/utils/generateIntegratedReport";

interface IntegratedData {
  bigFiveSession: {
    id: string;
    traitScores: Record<string, number>;
  } | null;
  humanDesignResult: {
    id: string;
    energy_type: string;
    strategy: string;
    authority: string;
    profile: string;
    definition: string;
    incarnation_cross: string;
    centers: Record<string, string>;
  } | null;
  existingAnalysis: {
    id: string;
    analysis_text: string;
    generated_at: string;
  } | null;
}

const IntegratedResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [data, setData] = useState<IntegratedData>({
    bigFiveSession: null,
    humanDesignResult: null,
    existingAnalysis: null,
  });
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [fullHDData, setFullHDData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch Big Five completed session with results
      const { data: bigFiveSession } = await supabase
        .from("test_sessions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let bigFiveData = null;
      if (bigFiveSession) {
        const { data: results } = await supabase
          .from("test_results")
          .select("trait_scores")
          .eq("session_id", bigFiveSession.id)
          .maybeSingle();

        if (results) {
          bigFiveData = {
            id: bigFiveSession.id,
            traitScores: results.trait_scores as Record<string, number>,
          };
        }
      }

      // Fetch Human Design result
      const { data: hdResult } = await supabase
        .from("human_design_results")
        .select("id, energy_type, strategy, authority, profile, definition, incarnation_cross, centers")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Store full HD data for PDF
      setFullHDData(hdResult);

      // Check for existing integrated analysis
      let existingAnalysis = null;
      if (bigFiveData && hdResult) {
        const { data: analysis } = await supabase
          .from("integrated_analyses")
          .select("id, analysis_text, generated_at")
          .eq("user_id", user.id)
          .eq("big_five_session_id", bigFiveData.id)
          .eq("human_design_result_id", hdResult.id)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysis) {
          existingAnalysis = analysis;
          setAnalysisText(analysis.analysis_text);
        }
      }

      setData({
        bigFiveSession: bigFiveData,
        humanDesignResult: hdResult as IntegratedData["humanDesignResult"],
        existingAnalysis,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    if (!data.bigFiveSession || !data.humanDesignResult) {
      toast({
        title: "Dados incompletos",
        description: "É necessário completar ambos os testes para gerar a análise integrada.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Call edge function
      const { data: response, error } = await supabase.functions.invoke("analyze-integrated", {
        body: {
          bigFiveData: {
            traitScores: data.bigFiveSession.traitScores,
          },
          humanDesignData: data.humanDesignResult,
        },
      });

      if (error) throw error;

      const analysis = response.analysis;
      setAnalysisText(analysis);

      // Save to database
      const { error: insertError } = await supabase
        .from("integrated_analyses")
        .insert({
          user_id: user.id,
          big_five_session_id: data.bigFiveSession.id,
          human_design_result_id: data.humanDesignResult.id,
          analysis_text: analysis,
          model_used: "google/gemini-2.5-flash",
        });

      if (insertError) {
        console.error("Erro ao salvar análise:", insertError);
      }

      toast({
        title: "Análise gerada!",
        description: "Seu relatório integrado está pronto.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a análise.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysisText || !data.bigFiveSession || !fullHDData) {
      toast({
        title: "Dados incompletos",
        description: "Gere a análise primeiro para baixar o PDF.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingPdf(true);

    try {
      // Derive classifications from trait scores
      const getClassification = (score: number) => {
        if (score <= 40) return "low";
        if (score <= 60) return "medium";
        return "high";
      };

      const traitScores = data.bigFiveSession.traitScores;
      const traitClassifications: Record<string, string> = {};
      Object.keys(traitScores).forEach((trait) => {
        traitClassifications[trait] = getClassification(traitScores[trait]);
      });

      // Derive defined and open centers
      const definedCenters: string[] = [];
      const openCenters: string[] = [];
      const centerNames: Record<string, string> = {
        head: 'Cabeça', ajna: 'Ajna', throat: 'Garganta',
        g: 'G (Identidade)', heart: 'Coração (Ego)', sacral: 'Sacral',
        spleen: 'Baço', solar: 'Plexo Solar', root: 'Raiz',
      };
      if (fullHDData.centers) {
        Object.entries(fullHDData.centers).forEach(([centerId, isDefined]) => {
          const centerName = centerNames[centerId] || centerId;
          if (isDefined) {
            definedCenters.push(centerName);
          } else {
            openCenters.push(centerName);
          }
        });
      }

      const reportData: IntegratedReportData = {
        traitScores: traitScores as Record<string, number>,
        traitClassifications,
        energyType: fullHDData.energy_type,
        strategy: fullHDData.strategy || '',
        authority: fullHDData.authority || '',
        profile: fullHDData.profile || '',
        definition: fullHDData.definition || '',
        incarnationCross: fullHDData.incarnation_cross || '',
        definedCenters,
        openCenters,
        ai_analysis: analysisText,
      };

      await generateIntegratedReport(reportData);

      toast({
        title: "PDF gerado!",
        description: "O download do relatório foi iniciado.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  const canGenerate = data.bigFiveSession && data.humanDesignResult;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Relatório Integrado
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Big Five + Desenho Humano: uma visão única e completa do seu perfil
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className={data.bigFiveSession ? "border-green-500/50" : "border-muted"}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.bigFiveSession ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"}`}>
              {data.bigFiveSession ? "✓" : "○"}
            </div>
            <div>
              <p className="font-semibold">Big Five</p>
              <p className="text-sm text-muted-foreground">
                {data.bigFiveSession ? "Teste concluído" : "Teste pendente"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={data.humanDesignResult ? "border-green-500/50" : "border-muted"}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.humanDesignResult ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"}`}>
              {data.humanDesignResult ? "✓" : "○"}
            </div>
            <div>
              <p className="font-semibold">Desenho Humano</p>
              <p className="text-sm text-muted-foreground">
                {data.humanDesignResult ? "Mapa calculado" : "Mapa pendente"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Section */}
      {!canGenerate ? (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Testes Incompletos</h3>
            <p className="text-muted-foreground mb-4">
              Complete ambos os testes para gerar seu relatório integrado.
            </p>
            <Button onClick={() => navigate("/app")} variant="outline">
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : analysisText ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Sua Análise Integrada
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="gap-2"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Baixar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAnalysis}
                disabled={generating}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                Regenerar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{analysisText}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-accent/10 to-background">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Gerar Análise Integrada
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Nossa IA irá cruzar os dados do seu Big Five com seu Desenho Humano
              para revelar padrões únicos do seu perfil.
            </p>
            <Button
              onClick={generateAnalysis}
              disabled={generating}
              size="lg"
              className="gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Gerando análise...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Relatório Integrado
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegratedResults;
