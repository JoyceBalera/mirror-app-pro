import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { SCORING, TRAIT_LABELS, getTraitPercentage } from "@/constants/scoring";
import { generateTestResultPDF } from "@/utils/pdfGenerator";
import { getTraitClassification, getFacetClassification as getScoreFacetClassification } from "@/utils/scoreCalculator";
import { facetNamesLuciana } from "@/data/bigFiveQuestionsLuciana";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFacetPercentage } from "@/constants/scoring";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Usa os nomes corretos das facetas definidos pela Luciana (mapeamento flat)
const FACET_NAMES = facetNamesLuciana;

// Usa o sistema oficial de 5 níveis do scoreCalculator
const getFacetClassification = getScoreFacetClassification;

// Normaliza nome do trait para busca no mapeamento
const normalizeTraitKey = (key: string): string => {
  const map: Record<string, string> = {
    neuroticism: "neuroticismo",
    extraversion: "extroversão", 
    openness: "abertura",
    "abertura a experiencia": "abertura",
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
  const { t, language } = useLanguage();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Get date-fns locale based on current language
  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'es': return es;
      default: return ptBR;
    }
  };

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
          title: t.results.accessDenied,
          description: t.results.noPermission,
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
        title: t.errors.loadingFailed,
        description: t.results.errorLoading,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTraitLabel = (trait: string) => {
    const traitKey = normalizeTraitKey(trait);
    const traitMap: Record<string, keyof typeof t.results.traits> = {
      neuroticismo: 'neuroticism',
      extroversão: 'extroversion',
      abertura: 'openness',
      amabilidade: 'agreeableness',
      conscienciosidade: 'conscientiousness',
      neuroticism: 'neuroticism',
      extraversion: 'extroversion',
      openness: 'openness',
      agreeableness: 'agreeableness',
      conscientiousness: 'conscientiousness'
    };
    const key = traitMap[traitKey] || traitMap[trait.toLowerCase()];
    return key ? t.results.traits[key] : TRAIT_LABELS[trait] || trait;
  };

  const getClassificationLabel = (classification: string) => {
    const classMap: Record<string, string> = {
      "Muito Baixo": t.results.levels.veryLow,
      "Baixo": t.results.levels.low,
      "Médio": t.results.levels.medium,
      "Alto": t.results.levels.high,
      "Muito Alto": t.results.levels.veryHigh,
      "low": t.results.levels.low,
      "medium": t.results.levels.medium,
      "high": t.results.levels.high,
      "Baixa": t.results.levels.low,
      "Média": t.results.levels.medium,
      "Alta": t.results.levels.high,
    };
    return classMap[classification] || classification;
  };

  const getClassificationColor = (classification: string) => {
    const normalizedClass = classification.toLowerCase();
    if (normalizedClass.includes("muito baixo")) return "text-red-700";
    if (normalizedClass.includes("baixo") || normalizedClass === "low") return "text-orange-600";
    if (normalizedClass.includes("médio") || normalizedClass === "medium") return "text-yellow-600";
    if (normalizedClass.includes("muito alto")) return "text-emerald-700";
    if (normalizedClass.includes("alto") || normalizedClass === "high") return "text-green-600";
    return "text-muted-foreground";
  };

  // Prepare formatted data for AI - ALWAYS recalculates classifications from raw scores
  const getFormattedTraitScores = () => {
    if (!result) return [];
    return Object.entries(result.trait_scores).map(([key, score]) => {
      const traitScore = score as number;
      
      // RECALCULA a classificação baseado no score bruto, não usa o salvo no banco
      // Isso garante que mesmo dados antigos sejam interpretados com as faixas corretas
      const recalculatedClassification = getTraitClassification(traitScore);
      
      return {
        trait: getTraitLabel(key), // Nome do traço para a edge function
        name: getTraitLabel(key),  // Backward compatibility
        score: traitScore,
        classification: recalculatedClassification, // Usa classificação recalculada
        facets: Object.entries(result.facet_scores[key] || {}).map(([facetKey, facetScore]) => ({
          // FACET_NAMES agora é flat: { N1: "Ansiedade", E1: "Calor", ... }
          name: FACET_NAMES[facetKey] || facetKey,
          score: facetScore,
          // RECALCULA a classificação da faceta baseado no score bruto
          classification: getScoreFacetClassification(facetScore as number)
        }))
      };
    });
  };

  const handleGenerateAnalysis = async () => {
    if (!result || !sessionId) return;
    
    setGeneratingAnalysis(true);
    try {
      // Agora a edge function busca os dados diretamente do banco e gera no idioma selecionado
      const { data, error } = await supabase.functions.invoke("analyze-personality", {
        body: { sessionId, language },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // A tabela ai_analyses é 1:1 por session_id; então regenerar precisa sobrescrever.
      const { error: upsertError } = await supabase.from('ai_analyses').upsert(
        {
          session_id: sessionId,
          analysis_text: data.analysis,
          model_used: 'google/gemini-2.5-flash',
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      );

      if (upsertError) throw upsertError;

      toast({
        title: t.results.analysisGenerated,
        description: t.results.analysisReady,
      });

      fetchResult();
      setShowAnalysis(true);
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast({
        title: t.results.analysisError,
        description: error.message || t.results.analysisErrorDesc,
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
        language: language as 'pt' | 'es' | 'en',
        userName: userName,
        testDate: result.test_sessions.completed_at 
          ? new Date(result.test_sessions.completed_at) 
          : new Date(),
        aiAnalysis: aiText,
      }
    );
    toast({
      title: t.results.pdfGenerated,
      description: t.results.pdfSuccess,
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
          <p className="text-muted-foreground">{t.results.notFound}</p>
          <Button onClick={() => navigate("/app")} className="mt-4">
            {t.results.backToDashboard}
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
        {t.results.backToDashboard}
      </Button>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {t.results.title} {t.results.pageTitle}
            </h1>
            {result.test_sessions.completed_at && (
              <p className="text-sm text-muted-foreground mt-1">
                {t.results.completedOn} {format(new Date(result.test_sessions.completed_at), "PPP 'às' HH:mm", { locale: getDateLocale() })}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t.results.download}
            </Button>
          </div>
        </div>
      </Card>

      {/* Trait Scores */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">{t.results.traitsSummary}</h2>
        
        <div className="space-y-6">
          {Object.entries(result.trait_scores).map(([trait, scoreValue]) => {
            const score = scoreValue as number;
            // RECALCULA a classificação baseado no score bruto para exibição na UI
            const recalculatedClassification = getTraitClassification(score);
            return (
              <div key={trait}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{getTraitLabel(trait)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {score.toFixed(0)} / {SCORING.TRAIT_MAX}
                    </span>
                    <span className={`text-sm font-medium ${getClassificationColor(recalculatedClassification)}`}>
                      ({getClassificationLabel(recalculatedClassification)})
                    </span>
                  </div>
                </div>
                <Progress value={getTraitPercentage(score)} className="h-3" />

                {/* Facets */}
                {result.facet_scores[trait] && (
                  <Collapsible className="mt-3">
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="w-3 h-3" />
                      {t.results.facets || "Ver facetas"}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {Object.entries(result.facet_scores[trait] as Record<string, number>).map(([facetKey, facetScore]) => {
                          const facetClassification = getScoreFacetClassification(facetScore);
                          return (
                            <div key={facetKey} className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2">
                              <span className="text-sm">{FACET_NAMES[facetKey] || facetKey}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{facetScore}/{SCORING.FACET_MAX}</span>
                                <span className={`text-xs font-medium ${getClassificationColor(facetClassification)}`}>
                                  {getClassificationLabel(facetClassification)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
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
            {t.results.aiAnalysis}
          </h2>
        </div>

        {result.ai_analyses && result.ai_analyses.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full"
              >
                {showAnalysis ? t.results.hideAnalysis : t.results.showAnalysis}
              </Button>

              <Button
                onClick={handleGenerateAnalysis}
                disabled={generatingAnalysis}
                className="w-full gap-2"
              >
                {generatingAnalysis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.results.regeneratingAI}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t.results.regenerateAI}
                  </>
                )}
              </Button>
            </div>

            {showAnalysis && (
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-primary prose-strong:text-foreground">
                  <ReactMarkdown>{result.ai_analyses[0].analysis_text}</ReactMarkdown>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {t.results.generatedOn} {format(new Date(result.ai_analyses[0].generated_at), "PPP 'às' HH:mm", { locale: getDateLocale() })}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">
              {t.results.aiDescription}
            </p>
            <Button
              onClick={handleGenerateAnalysis}
              disabled={generatingAnalysis}
              className="gap-2"
            >
              {generatingAnalysis ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.results.generatingAI}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.results.generateAI}
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
