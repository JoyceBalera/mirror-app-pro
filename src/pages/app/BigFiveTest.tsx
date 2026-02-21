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
import { useTranslation } from "react-i18next";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const saveAnswerWithRetry = async (
  sessionId: string,
  questionId: string,
  score: number,
  maxRetries = 3
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { error } = await supabase.from('test_answers').insert({
      session_id: sessionId,
      question_id: questionId,
      score: score,
      answered_at: new Date().toISOString(),
    });
    if (!error) return true;
    console.error(`Attempt ${attempt}/${maxRetries} failed for ${questionId}:`, error);
    if (attempt < maxRetries) await sleep(1000);
  }
  return false;
};

const BigFiveTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t("bigFiveTest.startError"),
        description: error.message || t("bigFiveTest.startErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const [saving, setSaving] = useState(false);

  const handleAnswer = async (score: number) => {
    if (saving) return;
    const questionId = questions[currentQuestionIndex].id;
    const newAnswers = [...answers, { questionId, score }];
    setAnswers(newAnswers);

    // Save answer to database with retry
    if (currentSessionId) {
      setSaving(true);
      const saved = await saveAnswerWithRetry(currentSessionId, questionId, score);
      setSaving(false);

      if (!saved) {
        // Rollback: remove the answer from local state
        setAnswers(answers);
        toast({
          title: t("bigFiveTest.saveError", "Erro ao salvar"),
          description: t("bigFiveTest.saveErrorDesc", "Não foi possível salvar sua resposta. Verifique sua conexão e tente novamente."),
          variant: "destructive",
        });
        return; // Do NOT advance
      }
    }

    // Check if this is the last question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Validate answer count before completing
      await validateAndComplete(newAnswers);
    }
  };

  const validateAndComplete = async (finalAnswers: Answer[]) => {
    if (!currentSessionId) return;

    // Count answers saved in DB
    const { count, error } = await supabase
      .from('test_answers')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', currentSessionId);

    const savedCount = count ?? 0;

    if (error || savedCount < questions.length) {
      console.warn(`DB has ${savedCount}/${questions.length} answers. Attempting to sync missing...`);

      // Find which answers are missing in DB
      const { data: savedAnswers } = await supabase
        .from('test_answers')
        .select('question_id')
        .eq('session_id', currentSessionId);

      const savedIds = new Set((savedAnswers ?? []).map(a => a.question_id));
      const missing = finalAnswers.filter(a => !savedIds.has(a.questionId));

      // Try to save missing answers
      for (const ans of missing) {
        await saveAnswerWithRetry(currentSessionId, ans.questionId, ans.score);
      }

      // Re-check
      const { count: recheck } = await supabase
        .from('test_answers')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', currentSessionId);

      if ((recheck ?? 0) < questions.length) {
        toast({
          title: t("bigFiveTest.syncError", "Erro de sincronização"),
          description: t("bigFiveTest.syncErrorDesc", `Apenas ${recheck}/${questions.length} respostas salvas. Verifique sua conexão.`),
          variant: "destructive",
        });
        return;
      }
    }

    await completeTest(finalAnswers);
  };

  const completeTest = async (finalAnswers: Answer[]) => {
    const { scores, facetScores } = calculateScore(finalAnswers);

    const traitKeys = Object.keys(scores) as (keyof typeof scores)[];
    const results: TraitScore[] = traitKeys.map((traitKey) => {
      const score = scores[traitKey];
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

    // Save results to database using standardized English keys
    try {
      const traitScoresObj: Record<string, number> = {};
      const facetScoresObj: Record<string, Record<string, number>> = {};

      traitKeys.forEach((traitKey) => {
        traitScoresObj[traitKey] = scores[traitKey];
        facetScoresObj[traitKey] = { ...facetScores[traitKey] };
      });

      const classificationsObj: Record<string, string> = {};
      traitKeys.forEach((traitKey) => {
        classificationsObj[traitKey] = getTraitClassification(scores[traitKey]);
      });

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
        title: t("bigFiveTest.testCompleted"),
        description: t("bigFiveTest.resultsSaved"),
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
          {t("bigFiveTest.backToDashboard")}
        </Button>

        <Card>
          <CardHeader className="text-center pb-2">
            <h1 className="text-3xl font-bold text-primary">
              {t("bigFiveTest.title")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("bigFiveTest.subtitle")}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {resuming && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-primary font-medium">
                  {t("bigFiveTest.testInProgress")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("bigFiveTest.answeredOf", { answered: answers.length, total: questions.length, percent: Math.round((answers.length / questions.length) * 100) })}
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong>{t("bigFiveTest.duration")}</strong> {t("bigFiveTest.durationValue")}
              </p>
              <p className="text-sm">
                <strong>{t("bigFiveTest.questionsLabel")}</strong> {t("bigFiveTest.questionsValue", { count: questions.length })}
              </p>
              <p className="text-sm">
                <strong>{t("bigFiveTest.progress")}</strong> {t("bigFiveTest.progressValue")}
              </p>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-destructive mb-1">
                ⚠️ {t("bigFiveTest.noReturnWarningTitle", "Atenção: Sem retorno!")}
              </p>
              <p className="text-sm text-destructive/80">
                {t("bigFiveTest.noReturnWarningDesc", "Uma vez respondida, cada questão não poderá ser alterada. Não é possível voltar para questões anteriores. Leia com atenção e responda com cuidado.")}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              {t("bigFiveTest.description")}
            </p>

            <Button
              onClick={handleStartTest}
              className="w-full gap-2"
              size="lg"
            >
              <PlayCircle className="w-5 h-5" />
              {resuming ? t("bigFiveTest.continueTest") : t("bigFiveTest.startTest")}
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
          <span>{t("bigFiveTest.questionLabel", { current: currentQuestionIndex + 1, total: questions.length })}</span>
          <span>{t("bigFiveTest.completed", { percent: Math.round(progressPercentage) })}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="max-w-3xl w-full mx-auto relative">
        {saving && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
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
