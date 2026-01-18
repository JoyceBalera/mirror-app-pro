import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SCORING, TRAIT_LABELS, getTraitPercentage } from "@/constants/scoring";
import { generateTestResultPDF } from "@/utils/pdfGenerator";

// Mapeamento de códigos de facetas para nomes legíveis
const FACET_NAMES: Record<string, Record<string, string>> = {
  neuroticismo: {
    N1: "Ansiedade", N2: "Raiva", N3: "Depressão", 
    N4: "Constrangimento", N5: "Imoderação", N6: "Vulnerabilidade"
  },
  extroversão: {
    E1: "Simpatia", E2: "Gregarismo", E3: "Assertividade",
    E4: "Atividade", E5: "Busca por Excitação", E6: "Emoções Positivas"
  },
  abertura: {
    O1: "Imaginação", O2: "Interesse Artístico", O3: "Emotividade",
    O4: "Aventura", O5: "Intelecto", O6: "Liberalismo"
  },
  amabilidade: {
    A1: "Confiança", A2: "Moralidade", A3: "Altruísmo",
    A4: "Cooperação", A5: "Modéstia", A6: "Simpatia"
  },
  conscienciosidade: {
    C1: "Autoeficácia", C2: "Ordem", C3: "Senso de Dever",
    C4: "Busca por Realização", C5: "Autodisciplina", C6: "Cautela"
  }
};

// Calcula classificação de faceta baseado no score (10-50)
const getFacetClassification = (score: number): string => {
  if (score <= 23) return "Baixa";
  if (score <= 36) return "Média";
  return "Alta";
};

// Normaliza nome do trait para busca no mapeamento
const normalizeTraitKey = (key: string): string => {
  const map: Record<string, string> = {
    neuroticism: "neuroticismo",
    extraversion: "extroversão", 
    openness: "abertura",
    agreeableness: "amabilidade",
    conscientiousness: "conscienciosidade"
  };
  return map[key.toLowerCase()] || key.toLowerCase();
};

interface TestResult {
  id: string;
  session_id: string;
  trait_scores: any;
  facet_scores: any;
  classifications: any;
  calculated_at: string;
  test_sessions: {
    completed_at: string | null;
    user_id?: string;
  };
  ai_analyses?: Array<{
    analysis_text: string;
    model_used: string;
    generated_at: string;
  }>;
}

const BigFiveResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get user name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.full_name || "");

      // Fetch result
      const { data: testResult, error } = await supabase
        .from('test_results')
        .select(`
          *,
          test_sessions!inner(completed_at, user_id)
        `)
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;

      // Verify ownership
      if (testResult.test_sessions.user_id !== user.id) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para ver este resultado.",
          variant: "destructive",
        });
        navigate("/app");
        return;
      }

      // Fetch AI analysis
      const { data: analyses } = await supabase
        .from('ai_analyses')
        .select('analysis_text, model_used, generated_at')
        .eq('session_id', sessionId)
        .order('generated_at', { ascending: false });

      setResult({ ...testResult, ai_analyses: analyses || [] });
    } catch (error: any) {
      console.error("Error fetching result:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os resultados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTraitLabel = (trait: string) => {
    return TRAIT_LABELS[trait] || trait;
  };

  const getClassificationLabel = (classification: string) => {
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

  const getClassificationColor = (classification: string) => {
    const colors: { [key: string]: string } = {
      low: "text-red-600",
      medium: "text-yellow-600",
      high: "text-green-600",
      Baixa: "text-red-600",
      Média: "text-yellow-600",
      Alta: "text-green-600",
    };
    return colors[classification] || "text-muted-foreground";
  };

  // Prepare formatted data for AI
  const getFormattedTraitScores = () => {
    if (!result) return [];
    return Object.entries(result.trait_scores).map(([key, score]) => {
      const normalizedKey = normalizeTraitKey(key);
      const facetNames = FACET_NAMES[normalizedKey] || {};
      
      return {
        name: getTraitLabel(key),
        score: score,
        classification: getClassificationLabel(result.classifications[key]),
        facets: Object.entries(result.facet_scores[key] || {}).map(([facetKey, facetScore]) => ({
          name: facetNames[facetKey] || facetKey,
          score: facetScore,
          classification: getFacetClassification(facetScore as number)
        }))
      };
    });
  };

  const handleGenerateAnalysis = async () => {
    if (!result) return;
    
    setGeneratingAnalysis(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-personality", {
        body: { traitScores: getFormattedTraitScores() },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await supabase.from('ai_analyses').insert({
        session_id: sessionId,
        analysis_text: data.analysis,
        model_used: 'gemini-2.5-flash',
      });

      toast({
        title: "Análise gerada! ✨",
        description: "Sua análise personalizada está pronta.",
      });

      fetchResult();
      setShowAnalysis(true);
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Erro ao gerar análise",
        description: error.message || "Não foi possível gerar a análise.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    const aiText = result.ai_analyses?.[0]?.analysis_text;
    generateTestResultPDF(
      result.trait_scores,
      result.facet_scores,
      result.classifications,
      {
        userName: userName,
        testDate: result.test_sessions.completed_at 
          ? new Date(result.test_sessions.completed_at) 
          : new Date(),
        aiAnalysis: aiText,
      }
    );
    toast({
      title: "PDF gerado!",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Resultado não encontrado.</p>
          <Button onClick={() => navigate("/app")} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/app")}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Dashboard
      </Button>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Seus Resultados Big Five
            </h1>
            {result.test_sessions.completed_at && (
              <p className="text-sm text-muted-foreground mt-1">
                Realizado em {format(new Date(result.test_sessions.completed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Trait Scores */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Seus Traços de Personalidade</h2>
        
        <div className="space-y-6">
          {Object.entries(result.trait_scores).map(([trait, scoreValue]) => {
            const score = scoreValue as number;
            return (
              <div key={trait}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{getTraitLabel(trait)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {score.toFixed(0)} / {SCORING.TRAIT_MAX}
                    </span>
                    <span className={`text-sm font-medium ${getClassificationColor(result.classifications[trait])}`}>
                      ({getClassificationLabel(result.classifications[trait])})
                    </span>
                  </div>
                </div>
                <Progress value={getTraitPercentage(score)} className="h-3" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* AI Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Análise Personalizada
          </h2>
        </div>

        {result.ai_analyses && result.ai_analyses.length > 0 ? (
          <>
            <Button
              variant="outline"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full mb-4"
            >
              {showAnalysis ? 'Ocultar' : 'Ver'} Análise Completa
            </Button>

            {showAnalysis && (
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result.ai_analyses[0].analysis_text}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Gerado em {format(new Date(result.ai_analyses[0].generated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">
              Gere uma análise personalizada com inteligência artificial para 
              entender melhor seus resultados.
            </p>
            <Button
              onClick={handleGenerateAnalysis}
              disabled={generatingAnalysis}
              className="gap-2"
            >
              {generatingAnalysis ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando Análise...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Análise com IA
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BigFiveResults;
