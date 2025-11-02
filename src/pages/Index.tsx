import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

type Screen = "welcome" | "test" | "results";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [traitScores, setTraitScores] = useState<TraitScore[]>([]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
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

  const handleStart = () => {
    setScreen("test");
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const handleAnswer = (score: number) => {
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

  const calculateResults = () => {
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
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
        <Welcome onStart={handleStart} onQuickTest={handleQuickTest} />
      </div>
    );
  }

  if (screen === "results") {
    return <Results traitScores={traitScores} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <QuestionCard
          question={questions[currentQuestionIndex]}
          currentAnswer={currentAnswer?.score}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />

        <div className="flex gap-4 mt-8 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!currentAnswer}
            size="lg"
            className="gap-2 gradient-primary hover:opacity-90 disabled:opacity-50"
          >
            {currentQuestionIndex === questions.length - 1 ? "Ver Resultados" : "Próxima"}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
