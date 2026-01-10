import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { QuestionCard } from "@/components/QuestionCard";
import { questionsLuciana as questions, traitInfoLuciana as traitInfo } from "@/data/bigFiveQuestionsLuciana";
import { Answer, TraitScore } from "@/types/test";
import {
  calculateScore,
  getTraitClassification,
  getFacetClassification,
  facetNames,
} from "@/utils/scoreCalculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PlayCircle, Loader2 } from "lucide-react";

const BigFiveTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<"intro" | "test" | "complete">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      
      // Check for existing in_progress session
      const { data: existingSession } = await supabase
        .from('test_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();
      
      if (existingSession) {
        setCurrentSessionId(existingSession.id);
        setResuming(true);
        
        // Load existing answers
        const { data: existingAnswers } = await supabase
          .from('test_answers')
          .select('question_id, score')
          .eq('session_id', existingSession.id)
          .order('answered_at', { ascending: true });
        
        if (existingAnswers && existingAnswers.length > 0) {
          const loadedAnswers = existingAnswers.map(a => ({
            questionId: a.question_id,
            score: a.score
          }));
          setAnswers(loadedAnswers);
          setCurrentQuestionIndex(loadedAnswers.length);
        }
      }
      
      setLoading(false);
    };
    
    init();
  }, [navigate]);

  const handleStartTest = async () => {
    if (!user) return;
    
    try {
      if (resuming && currentSessionId) {
        // Resume existing session
        setScreen("test");
        return;
      }
      
      // Create new session
      const { data: session, error } = await supabase
        .from('test_sessions')
        .insert({ 
          user_id: user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(session.id);
      setScreen("test");
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar teste",
        description: error.message || "Não foi possível iniciar o teste.",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async (score: number) => {
    const questionId = questions[currentQuestionIndex].id;
    const newAnswers = [...answers, { questionId, score }];
    setAnswers(newAnswers);

    // Save answer to database
    if (currentSessionId) {
      try {
        await supabase.from('test_answers').insert({
          session_id: currentSessionId,
          question_id: questionId,
          score: score,
          answered_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }

    // Check if this is the last question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the test
      await completeTest(newAnswers);
    }
  };

  const completeTest = async (finalAnswers: Answer[]) => {
    const { scores, facetScores } = calculateScore(finalAnswers);

    const results: TraitScore[] = Object.entries(scores).map(([trait, score]) => {
      const traitKey = trait as keyof typeof scores;
      const facets = Object.entries(facetScores[traitKey]).map(
        ([facetKey, facetScore]) => ({
          name: facetNames[facetKey] || facetKey,
          score: facetScore,
          classification: getFacetClassification(facetScore),
        })
      );

      return {
        name: traitInfo[traitKey].name,
        score,
        classification: getTraitClassification(score),
        color: traitInfo[traitKey].color,
        facets,
      };
    });

    // Save results to database
    try {
      const traitScoresObj = results.reduce((acc, result) => {
        acc[result.name.toLowerCase()] = result.score;
        return acc;
      }, {} as Record<string, number>);

      const facetScoresObj = results.reduce((acc, result) => {
        acc[result.name.toLowerCase()] = result.facets.reduce((fAcc, facet) => {
          fAcc[facet.name] = facet.score;
          return fAcc;
        }, {} as Record<string, number>);
        return acc;
      }, {} as Record<string, Record<string, number>>);

      const classificationsObj = results.reduce((acc, result) => {
        acc[result.name.toLowerCase()] = result.classification;
        return acc;
      }, {} as Record<string, string>);

      const { data: testResult, error: resultError } = await supabase
        .from('test_results')
        .insert({
          session_id: currentSessionId,
          trait_scores: traitScoresObj,
          facet_scores: facetScoresObj,
          classifications: classificationsObj,
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // Update session status
      await supabase
        .from('test_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentSessionId);

      // Update user_test_access
      if (user) {
        await supabase
          .from('user_test_access')
          .update({ 
            big_five_completed_at: new Date().toISOString() 
          })
          .eq('user_id', user.id);
      }

      toast({
        title: "Teste concluído! 🎉",
        description: "Seus resultados foram salvos com sucesso.",
      });

      // Navigate to results
      navigate(`/app/big-five/results/${currentSessionId}`);
    } catch (error: any) {
      console.error('Error saving results:', error);
      toast({
        title: "Aviso",
        description: "Resultados gerados mas houve um erro ao salvar.",
        variant: "destructive",
      });
    }
  };

  const progressPercentage = (currentQuestionIndex / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (screen === "intro") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/app")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center pb-2">
            <h1 className="text-3xl font-bold text-primary">
              📊 Teste Big Five
            </h1>
            <p className="text-muted-foreground mt-2">
              Descubra os 5 grandes traços da sua personalidade
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {resuming && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-primary font-medium">
                  📌 Você tem um teste em andamento!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {answers.length} de {questions.length} perguntas respondidas ({Math.round((answers.length / questions.length) * 100)}%)
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong>⏱️ Duração:</strong> ~30 minutos
              </p>
              <p className="text-sm">
                <strong>📝 Perguntas:</strong> {questions.length} questões
              </p>
              <p className="text-sm">
                <strong>💾 Progresso:</strong> Salvo automaticamente
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Este teste avalia cinco grandes dimensões da personalidade: Abertura, 
              Conscienciosidade, Extroversão, Amabilidade e Neuroticismo. Responda 
              com sinceridade para obter resultados mais precisos.
            </p>

            <Button
              onClick={handleStartTest}
              className="w-full gap-2"
              size="lg"
            >
              <PlayCircle className="w-5 h-5" />
              {resuming ? "Continuar Teste" : "Iniciar Teste"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero py-4 px-3 sm:py-8 sm:px-4 md:py-12 overflow-y-auto pb-20 sm:pb-8">
      {/* Progress Bar */}
      <div className="max-w-3xl w-full mx-auto mb-4">
        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
          <span>Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
          <span>{Math.round(progressPercentage)}% concluído</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="max-w-3xl w-full mx-auto">
        <QuestionCard
          question={questions[currentQuestionIndex]}
          currentAnswer={answers.find(a => a.questionId === questions[currentQuestionIndex]?.id)?.score}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </div>
    </div>
  );
};

export default BigFiveTest;
