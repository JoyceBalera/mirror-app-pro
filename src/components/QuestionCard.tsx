import { Question } from "@/types/test";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuestionCardProps {
  question: Question;
  currentAnswer?: number;
  onAnswer: (score: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionCard = ({
  question,
  currentAnswer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) => {
  const progress = (questionNumber / totalQuestions) * 100;

  const options = [
    { value: 1, label: "Discordo Totalmente" },
    { value: 2, label: "Discordo" },
    { value: 3, label: "Neutro" },
    { value: 4, label: "Concordo" },
    { value: 5, label: "Concordo Totalmente" },
  ];

  return (
    <Card className="p-4 sm:p-6 md:p-8 shadow-xl bg-card">
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Questão {questionNumber} de {totalQuestions}
          </span>
          <span className="text-xs sm:text-sm font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-2">
          {question.text}
        </h2>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {options.map((option) => (
          <Button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            variant={currentAnswer === option.value ? "default" : "outline"}
            className={`w-full justify-start text-left h-auto py-3 px-4 sm:py-4 sm:px-6 transition-all ${
              currentAnswer === option.value
                ? "gradient-primary text-white border-transparent"
                : "hover:border-primary"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-4 w-full">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  currentAnswer === option.value
                    ? "border-white bg-white/20"
                    : "border-current"
                }`}
              >
                {currentAnswer === option.value && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm sm:text-base">{option.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
