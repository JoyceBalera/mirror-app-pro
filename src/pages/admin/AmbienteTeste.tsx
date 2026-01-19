import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, FlaskConical, Brain, Sparkles, Eye, Zap, Target, User, Layers, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { questionsLuciana } from "@/data/bigFiveQuestionsLuciana";
import { generateRandomAnswers, DEMO_BIG_FIVE_RESULT } from "@/utils/mockBigFiveData";
import { DEMO_PROFILES, DEMO_HD_RESULT } from "@/utils/mockHumanDesignData";
import { calculateScore, getTraitClassification, getFacetClassification } from "@/utils/scoreCalculator";
import DemoResultBadge from "@/components/admin/DemoResultBadge";
import HDBodyGraph from "@/components/humandesign/HDBodyGraph";
import { SCORING, TRAIT_LABELS, getTraitPercentage } from "@/constants/scoring";
import ReactMarkdown from "react-markdown";

const AmbienteTeste = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Big Five state
  const [runningQuickTest, setRunningQuickTest] = useState(false);
  const [quickTestProgress, setQuickTestProgress] = useState(0);
  const [showBigFivePreview, setShowBigFivePreview] = useState(false);
  
  // Human Design state
  const [selectedProfile, setSelectedProfile] = useState<string>("einstein");
  const [showHDPreview, setShowHDPreview] = useState(false);
  
  // Integrated Analysis state
  const [showIntegratedPreview, setShowIntegratedPreview] = useState(false);
  const [generatingIntegrated, setGeneratingIntegrated] = useState(false);
  const [integratedAnalysis, setIntegratedAnalysis] = useState<string | null>(null);

  // Quick Big Five Test - auto-fill and complete
  const handleQuickBigFive = async () => {
    setRunningQuickTest(true);
    setQuickTestProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
        return;
      }

      // Check for existing in_progress session
      const existingSessionResult = await supabase
        .from('test_sessions')
        .select('id')
        .match({ user_id: user.id, test_type: 'big_five', status: 'in_progress' })
        .maybeSingle();
      
      const existingSession = existingSessionResult.data;

      let sessionId: string;

      if (existingSession) {
        sessionId = existingSession.id;
        // Clear existing answers
        await supabase.from('test_answers').delete().eq('session_id', sessionId);
      } else {
        // Create new session
        const { data: newSession, error: sessionError } = await supabase
          .from('test_sessions')
          .insert({
            user_id: user.id,
            test_type: 'big_five',
            status: 'in_progress',
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionId = newSession.id;
      }

      setQuickTestProgress(10);

      // Generate random answers
      const answers = generateRandomAnswers(questionsLuciana);
      
      // Insert answers in batches
      const batchSize = 50;
      for (let i = 0; i < answers.length; i += batchSize) {
        const batch = answers.slice(i, i + batchSize);
        const answersToInsert = batch.map((answer) => ({
          session_id: sessionId,
          question_id: answer.questionId,
          score: answer.score,
        }));

        const { error: insertError } = await supabase
          .from('test_answers')
          .insert(answersToInsert);

        if (insertError) throw insertError;
        
        setQuickTestProgress(10 + Math.floor((i / answers.length) * 60));
      }

      setQuickTestProgress(70);

      // Calculate scores using the existing calculateScore function
      const { scores: traitScores, facetScores } = calculateScore(answers);

      // Build classifications
      const traitClassifications: Record<string, string> = {};
      const facetClassifications: Record<string, Record<string, string>> = {};

      Object.entries(traitScores).forEach(([trait, score]) => {
        traitClassifications[trait] = getTraitClassification(score);
      });

      Object.entries(facetScores).forEach(([trait, facets]) => {
        facetClassifications[trait] = {};
        Object.entries(facets).forEach(([facet, score]) => {
          facetClassifications[trait][facet] = getFacetClassification(score);
        });
      });

      setQuickTestProgress(85);

      // Save results
      const { error: resultError } = await supabase
        .from('test_results')
        .insert({
          session_id: sessionId,
          trait_scores: traitScores,
          facet_scores: facetScores,
          classifications: traitClassifications,
          facet_classifications: facetClassifications,
        });

      if (resultError) throw resultError;

      // Update session to completed
      await supabase
        .from('test_sessions')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      setQuickTestProgress(100);

      toast({
        title: "Teste rápido concluído!",
        description: "Redirecionando para os resultados...",
      });

      // Navigate to results
      setTimeout(() => {
        navigate(`/app/big-five/results/${sessionId}`);
      }, 500);

    } catch (error: any) {
      console.error("Erro no teste rápido:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível completar o teste rápido.",
        variant: "destructive",
      });
    } finally {
      setRunningQuickTest(false);
      setQuickTestProgress(0);
    }
  };

  // Navigate to HD test with pre-filled data
  const handleQuickHD = () => {
    const profile = DEMO_PROFILES[selectedProfile];
    if (!profile) return;
    
    // Navigate to HD test with query params
    const params = new URLSearchParams({
      date: profile.birth_date,
      time: profile.birth_time,
      location: profile.birth_location,
      demo: "true",
    });
    
    navigate(`/app/desenho-humano?${params.toString()}`);
  };

  // Generate integrated analysis with mock data
  const handleGenerateIntegrated = async () => {
    setGeneratingIntegrated(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke("analyze-integrated", {
        body: {
          bigFiveData: {
            traitScores: DEMO_BIG_FIVE_RESULT.trait_scores,
          },
          humanDesignData: {
            energy_type: DEMO_HD_RESULT.energy_type,
            strategy: DEMO_HD_RESULT.strategy,
            authority: DEMO_HD_RESULT.authority,
            profile: DEMO_HD_RESULT.profile,
            definition: DEMO_HD_RESULT.definition,
            incarnation_cross: DEMO_HD_RESULT.incarnation_cross,
            centers: DEMO_HD_RESULT.centers,
          },
        },
      });

      if (error) throw error;

      setIntegratedAnalysis(response.analysis);
      toast({
        title: "Análise integrada gerada!",
        description: "A simulação foi concluída com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar análise integrada:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a análise.",
        variant: "destructive",
      });
    } finally {
      setGeneratingIntegrated(false);
    }
  };

  const getClassificationLabel = (classification: string) => {
    const labels: Record<string, string> = {
      low: "Baixo",
      medium: "Médio",
      high: "Alto",
    };
    return labels[classification] || classification;
  };

  const getClassificationColor = (classification: string) => {
    const colors: Record<string, string> = {
      low: "text-red-600",
      medium: "text-yellow-600",
      high: "text-green-600",
    };
    return colors[classification] || "text-muted-foreground";
  };

  // Extract data for HD preview
  const hdResult = DEMO_HD_RESULT;
  const personalityGates = hdResult.personality_activations.map(a => a.gate);
  const designGates = hdResult.design_activations.map(a => a.gate);
  const definedCenters = Object.entries(hdResult.centers)
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => centerId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Ambiente de Teste</h1>
        </div>
        <p className="text-muted-foreground">
          Use esta área para testar os fluxos de teste sem afetar dados de usuários reais.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Big Five Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle>Mapa de Personalidade</CardTitle>
            </div>
            <CardDescription>
              Este teste tem 300 perguntas. Use as opções abaixo para testar o fluxo rapidamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowBigFivePreview(!showBigFivePreview)}
              variant="outline"
              className="w-full gap-2"
            >
              <Eye className="w-4 h-4" />
              {showBigFivePreview ? "Ocultar Preview" : "Ver Preview de Resultado Demo"}
            </Button>

            <Button 
              onClick={handleQuickBigFive}
              disabled={runningQuickTest}
              className="w-full gap-2"
            >
              {runningQuickTest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Executando... {quickTestProgress}%
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Executar Teste Rápido
                </>
              )}
            </Button>

            {runningQuickTest && (
              <Progress value={quickTestProgress} className="h-2" />
            )}

            <p className="text-xs text-muted-foreground">
              O teste rápido auto-preenche 300 respostas aleatórias e gera um resultado real no banco de dados.
            </p>
          </CardContent>
        </Card>

        {/* Human Design Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>Arquitetura Pessoal</CardTitle>
            </div>
            <CardDescription>
              O cálculo do mapa usa dados de nascimento. Use perfis conhecidos para testar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Perfil Demo:</label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEMO_PROFILES).map(([key, profile]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span>{profile.name}</span>
                        <span className="text-xs text-muted-foreground">{profile.expected_type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile && DEMO_PROFILES[selectedProfile] && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Data:</strong> {DEMO_PROFILES[selectedProfile].birth_date}</p>
                <p><strong>Hora:</strong> {DEMO_PROFILES[selectedProfile].birth_time}</p>
                <p><strong>Local:</strong> {DEMO_PROFILES[selectedProfile].birth_location}</p>
                <p className="text-muted-foreground mt-1">{DEMO_PROFILES[selectedProfile].description}</p>
              </div>
            )}

            <Button 
              onClick={handleQuickHD}
              className="w-full gap-2"
            >
              <Target className="w-4 h-4" />
              Gerar Mapa com Perfil Selecionado
            </Button>

            <Button 
              onClick={() => setShowHDPreview(!showHDPreview)}
              variant="outline"
              className="w-full gap-2"
            >
              <Eye className="w-4 h-4" />
              {showHDPreview ? "Ocultar Preview" : "Ver Preview de Mapa Demo"}
            </Button>
          </CardContent>
        </Card>

        {/* Integrated Analysis Card */}
        <Card className="md:col-span-2 border-accent/30 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              <CardTitle>Blueprint Pessoal - Mapa de Personalidade + Arquitetura Pessoal</CardTitle>
            </div>
            <CardDescription>
              Simulação do cruzamento de dados do Mapa de Personalidade com a Arquitetura Pessoal usando dados mock.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Dados Mapa de Personalidade Demo:</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(DEMO_BIG_FIVE_RESULT.trait_scores).map(([trait, score]) => (
                    <div key={trait} className="flex justify-between">
                      <span className="text-muted-foreground">{TRAIT_LABELS[trait]}:</span>
                      <span className="font-medium">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Dados Arquitetura Pessoal Demo:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{DEMO_HD_RESULT.energy_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autoridade:</span>
                    <span className="font-medium">{DEMO_HD_RESULT.authority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Perfil:</span>
                    <span className="font-medium">{DEMO_HD_RESULT.profile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Definição:</span>
                    <span className="font-medium">{DEMO_HD_RESULT.definition}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setShowIntegratedPreview(!showIntegratedPreview)}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Eye className="w-4 h-4" />
                {showIntegratedPreview ? "Ocultar Painel" : "Ver Painel de Simulação"}
              </Button>

              <Button 
                onClick={handleGenerateIntegrated}
                disabled={generatingIntegrated}
                className="flex-1 gap-2"
              >
                {generatingIntegrated ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Análise Integrada
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              A análise integrada usa IA para cruzar os dados de ambas as metodologias e gerar um relatório único.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Big Five Preview */}
      {showBigFivePreview && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview - Mapa de Personalidade</CardTitle>
              <DemoResultBadge />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(DEMO_BIG_FIVE_RESULT.trait_scores).map(([trait, score]) => (
                <div key={trait}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{TRAIT_LABELS[trait] || trait}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {score} / {SCORING.TRAIT_MAX}
                      </span>
                      <span className={`text-sm font-medium ${getClassificationColor(DEMO_BIG_FIVE_RESULT.classifications[trait])}`}>
                        ({getClassificationLabel(DEMO_BIG_FIVE_RESULT.classifications[trait])})
                      </span>
                    </div>
                  </div>
                  <Progress value={getTraitPercentage(score)} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Human Design Preview */}
      {showHDPreview && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview - Arquitetura Pessoal</CardTitle>
              <DemoResultBadge />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Type Card */}
              <div className="space-y-4">
                <div className="bg-orange-500 p-4 rounded-lg text-white text-center">
                  <Badge className="bg-white/20 text-white mb-2">TIPO</Badge>
                  <h3 className="text-2xl font-bold">{hdResult.energy_type}</h3>
                  <p className="opacity-90">{hdResult.strategy}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Brain className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Autoridade</p>
                    <p className="font-semibold text-sm">{hdResult.authority}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <User className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Perfil</p>
                    <p className="font-semibold text-sm">{hdResult.profile}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Definição</p>
                    <p className="font-semibold text-sm">{hdResult.definition}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Cruz</p>
                    <p className="font-semibold text-xs">{hdResult.incarnation_cross}</p>
                  </div>
                </div>
              </div>

              {/* BodyGraph */}
              <div className="flex justify-center">
                <div className="w-[330px]">
                  <HDBodyGraph
                    definedCenters={definedCenters}
                    activeChannels={hdResult.channels.map(ch => ({
                      id: ch.gates.join('-'),
                      gates: ch.gates,
                      isComplete: true,
                    }))}
                    activatedGates={hdResult.activated_gates}
                    personalityGates={personalityGates}
                    designGates={designGates}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrated Analysis Preview */}
      {showIntegratedPreview && (
        <Card className="mt-6 border-accent/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                Simulação - Blueprint Pessoal
              </CardTitle>
              <div className="flex items-center gap-2">
                {integratedAnalysis && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateIntegrated}
                    disabled={generatingIntegrated}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${generatingIntegrated ? "animate-spin" : ""}`} />
                    Regenerar
                  </Button>
                )}
                <DemoResultBadge />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {integratedAnalysis ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{integratedAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Clique em "Gerar Análise Integrada" para simular o relatório.</p>
                <Button 
                  onClick={handleGenerateIntegrated}
                  disabled={generatingIntegrated}
                  className="gap-2"
                >
                  {generatingIntegrated ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Análise Integrada
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AmbienteTeste;
