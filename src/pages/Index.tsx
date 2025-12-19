import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Welcome } from "@/components/Welcome";
import { QuestionCard } from "@/components/QuestionCard";
import { Results } from "@/components/Results";
import { questions, traitInfo } from "@/data/questions";
import { Answer, TraitScore } from "@/types/test";
import {
  calculateScore,
  getTraitClassification,
  getFacetClassification,
  facetNames,
} from "@/utils/scoreCalculator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LogOut, LayoutDashboard } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

type Screen = "welcome" | "test" | "results";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [traitScores, setTraitScores] = useState<TraitScore[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    let redirecting = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted || redirecting) return;
        
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          redirecting = true;
          navigate("/auth");
        } else {
          // Defer database call to avoid deadlock
          setTimeout(async () => {
            if (!mounted) return;
            
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", session.user.id)
              .single();
            
            setUserName(profile?.full_name || session.user.email || "");
          }, 0);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted || redirecting) return;
      
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        redirecting = true;
        navigate("/auth");
      } else {
        // Defer database call to avoid deadlock
        setTimeout(async () => {
          if (!mounted) return;
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();
          
          setUserName(profile?.full_name || session.user.email || "");
        }, 0);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const generateMockAnswers = (): Answer[] => {
    return questions.map((question) => ({
      questionId: question.id,
      score: Math.floor(Math.random() * 5) + 1, // Random score between 1-5
    }));
  };

  const handleQuickTest = () => {
    const mockAnswers = generateMockAnswers();
    setAnswers(mockAnswers);
    
    const { scores, facetScores } = calculateScore(mockAnswers);
    
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

    setTraitScores(results);
    setScreen("results");
  };

  const handleStart = async () => {
    if (!user) return;

    try {
      // Create a new test session
      const { data: session, error } = await supabase
        .from('test_sessions')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(session.id);
      setScreen("test");
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o teste",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async (score: number) => {
    const questionId = questions[currentQuestionIndex].id;
    const existingAnswerIndex = answers.findIndex(
      (a) => a.questionId === questionId
    );

    let newAnswers: Answer[];
    if (existingAnswerIndex >= 0) {
      newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = { questionId, score };
    } else {
      newAnswers = [...answers, { questionId, score }];
    }

    setAnswers(newAnswers);

    // Save answer to database (upsert para evitar duplicatas)
    if (currentSessionId) {
      try {
        await supabase.from('test_answers').upsert(
          {
            session_id: currentSessionId,
            question_id: questionId,
            score: score,
            answered_at: new Date().toISOString(),
          },
          { 
            onConflict: 'session_id,question_id',
            ignoreDuplicates: false 
          }
        );
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResults = async () => {
    const { scores, facetScores } = calculateScore(answers);

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

    setTraitScores(results);

    // Save results to database
    if (currentSessionId) {
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

        await supabase.from('test_results').insert({
          session_id: currentSessionId,
          trait_scores: traitScoresObj,
          facet_scores: facetScoresObj,
          classifications: classificationsObj,
        });

        // Update session status
        await supabase
          .from('test_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', currentSessionId);
      } catch (error: any) {
        console.error('Error saving results:', error);
        toast({
          title: "Aviso",
          description: "Resultados gerados mas não puderam ser salvos no banco",
          variant: "destructive",
        });
      }
    }

    setScreen("results");
  };

  const handleRestart = () => {
    setScreen("welcome");
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTraitScores([]);
  };

  const currentAnswer = answers.find(
    (a) => a.questionId === questions[currentQuestionIndex]?.id
  );

  if (screen === "welcome") {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {isAdmin && (
            <Button
              onClick={() => navigate('/admin/dashboard')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Admin
            </Button>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
        <Welcome 
          onStart={handleStart} 
          onQuickTest={isAdmin ? handleQuickTest : undefined} 
        />
      </div>
    );
  }

  if (screen === "results") {
    return <Results 
      traitScores={traitScores} 
      onRestart={handleRestart} 
      sessionId={currentSessionId}
      userName={userName}
    />;
  }

  return (
    <div className="min-h-screen gradient-hero py-4 px-3 sm:py-8 sm:px-4 md:py-12 overflow-y-auto pb-20 sm:pb-8">
      <div className="max-w-3xl w-full mx-auto">
        <QuestionCard
          question={questions[currentQuestionIndex]}
          currentAnswer={currentAnswer?.score}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />

        <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-8 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm md:h-11 md:px-8"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Anterior</span>
            <span className="sm:hidden">Ant.</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm gradient-primary hover:opacity-90 disabled:opacity-50 md:h-11 md:px-8"
          >
            <span className="hidden sm:inline">{currentQuestionIndex === questions.length - 1 ? "Ver Resultados" : "Próxima"}</span>
            <span className="sm:hidden">{currentQuestionIndex === questions.length - 1 ? "Resultados" : "Próx."}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
