import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Home, LogOut, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SCORING, TRAIT_LABELS, getTraitPercentage } from "@/constants/scoring";

interface TestResult {
  id: string;
  session_id: string;
  trait_scores: any;
  facet_scores: any;
  classifications: any;
  calculated_at: string;
  test_sessions: {
    completed_at: string | null;
  };
  ai_analyses?: Array<{
    analysis_text: string;
    model_used: string;
    generated_at: string;
  }>;
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setUser(profile);

      // Fetch test results with sessions
      const { data: testResults, error: resultsError } = await supabase
        .from('test_results')
        .select(`
          *,
          test_sessions!inner(completed_at, user_id)
        `)
        .eq('test_sessions.user_id', userId)
        .order('calculated_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Fetch AI analyses for each result
      if (testResults && testResults.length > 0) {
        const resultsWithAnalyses = await Promise.all(
          testResults.map(async (result) => {
            const { data: analyses } = await supabase
              .from('ai_analyses')
              .select('analysis_text, model_used, generated_at')
              .eq('session_id', result.session_id)
              .order('generated_at', { ascending: false });
            
            return { ...result, ai_analyses: analyses || [] };
          })
        );
        setResults(resultsWithAnalyses);
      } else {
        setResults([]);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTraitLabel = (trait: string) => {
    return TRAIT_LABELS[trait] || trait;
  };

  const getClassificationLabel = (classification: string | number) => {
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

  const handleGenerateAnalysis = async (sessionId: string, traitScores: any, facetScores: any, classifications: any) => {
    setGeneratingAnalysis(sessionId);
    try {
      // Formatar os dados dos traços
      const formattedTraitScores = Object.entries(traitScores).map(([key, score]) => ({
        name: getTraitLabel(key),
        score: score as number,
        classification: getClassificationLabel(classifications[key]),
        facets: Object.entries(facetScores[key]).map(([facetKey, facetScore]) => ({
          name: facetKey,
          score: facetScore as number,
          classification: getClassificationLabel(facetScore as number)
        }))
      }));

      const { data, error } = await supabase.functions.invoke("analyze-personality", {
        body: { traitScores: formattedTraitScores },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Salvar análise no banco
      await supabase.from('ai_analyses').insert({
        session_id: sessionId,
        analysis_text: data.analysis,
        model_used: 'gemini-2.5-flash',
      });

      toast({
        title: "Análise gerada!",
        description: "A análise foi gerada e salva com sucesso.",
      });

      // Recarregar os dados
      fetchUserData();
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      toast({
        title: "Erro ao gerar análise",
        description: error.message || "Não foi possível gerar a análise.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAnalysis(null);
    }
  };

  const handleRecalculateResults = async (sessionId: string) => {
    setRecalculating(sessionId);
    try {
      const { data, error } = await supabase.functions.invoke("recalculate-results", {
        body: { session_id: sessionId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast({
        title: "Resultados recalculados!",
        description: `${data.answers_count} respostas processadas com sucesso.`,
      });

      // Recarregar os dados
      fetchUserData();
    } catch (error: any) {
      console.error("Erro ao recalcular:", error);
      toast({
        title: "Erro ao recalcular",
        description: error.message || "Não foi possível recalcular os resultados.",
        variant: "destructive",
      });
    } finally {
      setRecalculating(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin/dashboard')} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">{user?.full_name || 'Usuário'}</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Teste
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* User Info */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{user?.full_name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cadastrado em</p>
              <p className="font-medium">
                {format(new Date(user?.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </Card>

        {/* Test Results */}
        <h2 className="text-xl font-semibold mb-4">
          Histórico de Testes ({results.length})
        </h2>

        {results.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Este usuário ainda não realizou nenhum teste</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {results.map((result, index) => (
              <Card key={result.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Teste #{results.length - index}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleRecalculateResults(result.session_id)}
                      disabled={recalculating === result.session_id}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {recalculating === result.session_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Recalculando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Recalcular
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(result.test_sessions.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Big Five Scores */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium">Big Five Scores:</h4>
                  {Object.entries(result.trait_scores).map(([trait, score]: [string, any]) => (
                    <div key={trait}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">{getTraitLabel(trait)}</span>
                        <span className="text-sm font-medium">
                          {score.toFixed(0)} <span className="text-muted-foreground">/ {SCORING.TRAIT_MAX}</span>
                        </span>
                      </div>
                      <Progress value={getTraitPercentage(score)} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Classificação: {getClassificationLabel(result.classifications[trait])}
                      </p>
                    </div>
                  ))}
                </div>

                {/* AI Analysis */}
                <div className="border-t pt-4">
                  {result.ai_analyses && result.ai_analyses.length > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setExpandedAnalysis(
                          expandedAnalysis === result.id ? null : result.id
                        )}
                        className="w-full mb-4"
                      >
                        {expandedAnalysis === result.id ? 'Ocultar' : 'Ver'} Análise Completa da IA
                      </Button>

                      {expandedAnalysis === result.id && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">
                            {result.ai_analyses[0].analysis_text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-4">
                            Modelo: {result.ai_analyses[0].model_used}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Nenhuma análise de IA foi gerada para este teste ainda.
                      </p>
                      <Button
                        onClick={() => handleGenerateAnalysis(result.session_id, result.trait_scores, result.facet_scores, result.classifications)}
                        disabled={generatingAnalysis === result.session_id}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {generatingAnalysis === result.session_id ? (
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDetails;
