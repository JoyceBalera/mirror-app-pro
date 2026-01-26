import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FlaskConical, Brain, Sparkles, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { questionsLuciana } from "@/data/bigFiveQuestionsLuciana";
import { generateRandomAnswers } from "@/utils/mockBigFiveData";
import { calculateScore, getTraitClassification, getFacetClassification } from "@/utils/scoreCalculator";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";

const AmbienteTeste = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Big Five state
  const [runningQuickTest, setRunningQuickTest] = useState(false);
  const [quickTestProgress, setQuickTestProgress] = useState(0);
  
  // Manual HD input state
  const [manualBirthDate, setManualBirthDate] = useState("");
  const [manualBirthTime, setManualBirthTime] = useState("");
  const [manualBirthLocation, setManualBirthLocation] = useState("");

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

  // Navigate to HD test with manual data
  const handleManualHD = () => {
    if (!manualBirthDate || !manualBirthTime || !manualBirthLocation) {
      toast({
        title: "Dados incompletos",
        description: "Preencha data, hora e local de nascimento.",
        variant: "destructive",
      });
      return;
    }
    
    const params = new URLSearchParams({
      date: manualBirthDate,
      time: manualBirthTime,
      location: manualBirthLocation,
      demo: "true",
    });
    
    navigate(`/app/desenho-humano?${params.toString()}`);
  };

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
              Este teste tem 300 perguntas. Use o teste rápido para preencher automaticamente com respostas aleatórias e gerar um resultado real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              O teste rápido auto-preenche 300 respostas aleatórias, calcula os scores e gera a análise pela IA.
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
              Insira dados de nascimento para testar o cálculo completo e geração de relatório pela IA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="manual-birth-date">Data de Nascimento</Label>
                <Input
                  id="manual-birth-date"
                  type="date"
                  value={manualBirthDate}
                  onChange={(e) => setManualBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-birth-time">Hora de Nascimento</Label>
                <Input
                  id="manual-birth-time"
                  type="time"
                  value={manualBirthTime}
                  onChange={(e) => setManualBirthTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-birth-location">Local de Nascimento</Label>
                <LocationAutocomplete
                  value={manualBirthLocation}
                  onChange={setManualBirthLocation}
                  placeholder="Digite a cidade..."
                />
              </div>
            </div>

            {manualBirthDate && manualBirthTime && manualBirthLocation && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Data:</strong> {manualBirthDate}</p>
                <p><strong>Hora:</strong> {manualBirthTime}</p>
                <p><strong>Local:</strong> {manualBirthLocation}</p>
              </div>
            )}

            <Button 
              onClick={handleManualHD}
              className="w-full gap-2"
              disabled={!manualBirthDate || !manualBirthTime || !manualBirthLocation}
            >
              <Target className="w-4 h-4" />
              Gerar Mapa com Dados Reais
            </Button>

            <p className="text-xs text-muted-foreground">
              O mapa será calculado com dados reais e a análise será gerada pela IA.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmbienteTeste;
