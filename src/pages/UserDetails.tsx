import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Home, LogOut, Sparkles, Loader2, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SCORING, TRAIT_LABELS, getTraitPercentage } from "@/constants/scoring";
import { generateTestResultPDF } from "@/utils/pdfGenerator";
import { generateHDReport, type HDReportData } from "@/utils/generateHDReport";

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

interface HDResult {
  id: string;
  session_id: string;
  user_id: string;
  energy_type: string;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  incarnation_cross: string | null;
  centers: any;
  channels: any;
  personality_activations?: any;
  design_activations?: any;
  variables?: any;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  created_at: string;
  human_design_sessions: {
    completed_at: string | null;
  };
  human_design_analyses?: Array<{
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
  const [hdResults, setHdResults] = useState<HDResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [expandedHDAnalysis, setExpandedHDAnalysis] = useState<string | null>(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState<string | null>(null);
  const [generatingHDAnalysis, setGeneratingHDAnalysis] = useState<string | null>(null);
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

      // Fetch Big Five test results with sessions
      const { data: testResults, error: resultsError } = await supabase
        .from('test_results')
        .select(`
          *,
          test_sessions!inner(completed_at, user_id)
        `)
        .eq('test_sessions.user_id', userId)
        .order('calculated_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Fetch AI analyses for each Big Five result
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

      // Fetch Human Design results with sessions
      const { data: hdResultsData, error: hdError } = await supabase
        .from('human_design_results')
        .select(`
          *,
          human_design_sessions!inner(completed_at, user_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (hdError) throw hdError;

      // Fetch HD analyses for each result
      if (hdResultsData && hdResultsData.length > 0) {
        const hdResultsWithAnalyses = await Promise.all(
          hdResultsData.map(async (result) => {
            const { data: analyses } = await supabase
              .from('human_design_analyses')
              .select('analysis_text, model_used, generated_at')
              .eq('result_id', result.id)
              .order('generated_at', { ascending: false });
            
            return { ...result, human_design_analyses: analyses || [] };
          })
        );
        setHdResults(hdResultsWithAnalyses);
      } else {
        setHdResults([]);
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

      await supabase.from('ai_analyses').insert({
        session_id: sessionId,
        analysis_text: data.analysis,
        model_used: 'gemini-2.5-flash',
      });

      toast({
        title: "Análise gerada!",
        description: "A análise foi gerada e salva com sucesso.",
      });

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

  const handleGenerateHDAnalysis = async (resultId: string, hdResult: HDResult) => {
    setGeneratingHDAnalysis(resultId);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-human-design", {
        body: {
          energy_type: hdResult.energy_type,
          strategy: hdResult.strategy,
          authority: hdResult.authority,
          profile: hdResult.profile,
          definition: hdResult.definition,
          incarnation_cross: hdResult.incarnation_cross,
          centers: hdResult.centers,
          channels: hdResult.channels,
          variables: hdResult.variables,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await supabase.from('human_design_analyses').insert({
        result_id: resultId,
        analysis_text: data.analysis,
        model_used: 'gemini-2.5-flash',
      });

      toast({
        title: "Análise gerada!",
        description: "A análise de Desenho Humano foi gerada e salva com sucesso.",
      });

      fetchUserData();
    } catch (error: any) {
      console.error("Erro ao gerar análise HD:", error);
      toast({
        title: "Erro ao gerar análise",
        description: error.message || "Não foi possível gerar a análise.",
        variant: "destructive",
      });
    } finally {
      setGeneratingHDAnalysis(null);
    }
  };

  const handleDownloadHDPDF = async (hdResult: HDResult) => {
    try {
      const reportData: HDReportData = {
        birth_date: hdResult.birth_date,
        birth_time: hdResult.birth_time,
        birth_location: hdResult.birth_location,
        energy_type: hdResult.energy_type,
        strategy: hdResult.strategy,
        authority: hdResult.authority,
        profile: hdResult.profile,
        definition: hdResult.definition,
        incarnation_cross: hdResult.incarnation_cross,
        centers: hdResult.centers || {},
        channels: hdResult.channels || [],
        personality_activations: hdResult.personality_activations || [],
        design_activations: hdResult.design_activations || [],
        variables: hdResult.variables || {},
        ai_analysis_full: hdResult.human_design_analyses?.[0]?.analysis_text || '',
      };

      await generateHDReport(reportData);

      toast({
        title: "PDF gerado!",
        description: "O relatório de Desenho Humano foi baixado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message || "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
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

  const getCenterName = (centerId: string): string => {
    const names: Record<string, string> = {
      head: 'Cabeça', ajna: 'Ajna', throat: 'Garganta',
      g: 'G (Identidade)', heart: 'Coração', sacral: 'Sacral',
      spleen: 'Baço', solar: 'Plexo Solar', root: 'Raiz',
    };
    return names[centerId] || centerId;
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
            <Button onClick={() => navigate('/admin')} variant="ghost" size="sm">
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
                {user?.created_at 
                  ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })
                  : 'Não informado'}
              </p>
            </div>
          </div>
        </Card>

        {/* Big Five Results */}
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">Big Five</Badge>
          Histórico de Testes ({results.length})
        </h2>

        {results.length === 0 ? (
          <Card className="p-8 text-center mb-8">
            <p className="text-muted-foreground">Este usuário ainda não realizou nenhum teste Big Five</p>
          </Card>
        ) : (
          <div className="space-y-6 mb-8">
            {results.map((result, index) => (
              <Card key={result.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Teste #{results.length - index}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const aiText = result.ai_analyses?.[0]?.analysis_text;
                        generateTestResultPDF(
                          result.trait_scores,
                          result.facet_scores,
                          result.classifications,
                          {
                            userName: user?.full_name,
                            testDate: new Date(result.test_sessions.completed_at!),
                            aiAnalysis: aiText,
                          }
                        );
                        toast({
                          title: "PDF gerado!",
                          description: "O relatório foi baixado com sucesso.",
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
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
                      {result.test_sessions.completed_at 
                        ? format(new Date(result.test_sessions.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : 'Em andamento'}
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

        {/* Human Design Results */}
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">Desenho Humano</Badge>
          Histórico de Análises ({hdResults.length})
        </h2>

        {hdResults.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Este usuário ainda não realizou nenhuma análise de Desenho Humano</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {hdResults.map((hdResult, index) => (
              <Card key={hdResult.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Análise #{hdResults.length - index}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDownloadHDPDF(hdResult)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => navigate(`/desenho-humano/results/${hdResult.session_id}`)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Online
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {hdResult.human_design_sessions.completed_at 
                        ? format(new Date(hdResult.human_design_sessions.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : 'Em andamento'}
                    </p>
                  </div>
                </div>

                {/* HD Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo Energético</p>
                    <p className="font-semibold text-primary">{hdResult.energy_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estratégia</p>
                    <p className="font-medium">{hdResult.strategy || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Autoridade</p>
                    <p className="font-medium">{hdResult.authority || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Perfil</p>
                    <p className="font-medium">{hdResult.profile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Definição</p>
                    <p className="font-medium">{hdResult.definition || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cruz de Encarnação</p>
                    <p className="font-medium text-sm">{hdResult.incarnation_cross || 'N/A'}</p>
                  </div>
                </div>

                {/* Centers */}
                {hdResult.centers && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Centros:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(hdResult.centers).map(([centerId, isDefined]) => (
                        <Badge 
                          key={centerId}
                          variant="outline"
                          className={isDefined ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                        >
                          {getCenterName(centerId)} {isDefined ? '●' : '○'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* HD AI Analysis */}
                <div className="border-t pt-4">
                  {hdResult.human_design_analyses && hdResult.human_design_analyses.length > 0 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setExpandedHDAnalysis(
                          expandedHDAnalysis === hdResult.id ? null : hdResult.id
                        )}
                        className="w-full mb-4"
                      >
                        {expandedHDAnalysis === hdResult.id ? 'Ocultar' : 'Ver'} Análise Completa da IA
                      </Button>

                      {expandedHDAnalysis === hdResult.id && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">
                            {hdResult.human_design_analyses[0].analysis_text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-4">
                            Modelo: {hdResult.human_design_analyses[0].model_used}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Nenhuma análise de IA foi gerada para este resultado ainda.
                      </p>
                      <Button
                        onClick={() => handleGenerateHDAnalysis(hdResult.id, hdResult)}
                        disabled={generatingHDAnalysis === hdResult.id}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {generatingHDAnalysis === hdResult.id ? (
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
