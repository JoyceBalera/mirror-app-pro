import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, CheckCircle2, Sparkles, BarChart3, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR, es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type TestStatus = 'available' | 'locked' | 'unlocked' | 'completed';
export type TestType = 'big-five' | 'desenho-humano';

interface TestCardProps {
  type: TestType;
  status: TestStatus;
  completedAt?: string | null;
  onStart: () => void;
  onViewReport: () => void;
  className?: string;
}

const TestCard = ({
  type,
  status,
  completedAt,
  onStart,
  onViewReport,
  className,
}: TestCardProps) => {
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    switch (i18n.language?.split('-')[0]) {
      case 'es':
        return es;
      case 'en':
        return enUS;
      default:
        return ptBR;
    }
  };

  const testConfig = {
    'big-five': {
      icon: BarChart3,
      emoji: '📊',
      title: t('testCard.bigFive'),
      description: t('testCard.bigFiveDesc'),
      info: t('testCard.bigFiveInfo'),
    },
    'desenho-humano': {
      icon: Star,
      emoji: '🌟',
      title: t('testCard.humanDesign'),
      description: t('testCard.hdDesc'),
      info: t('testCard.hdInfo'),
    },
  };

  const config = testConfig[type];
  const Icon = config.icon;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isUnlocked = status === 'unlocked';

  const formattedDate = completedAt
    ? format(new Date(completedAt), "dd 'de' MMMM 'de' yyyy", { locale: getDateLocale() })
    : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={cn(
            "relative transition-all duration-300 overflow-hidden",
            isLocked && "opacity-70 cursor-not-allowed border-dashed border-secondary bg-card/50",
            isCompleted && "border-2 border-accent shadow-lg",
            !isLocked && !isCompleted && "border-2 border-secondary hover:border-primary hover:shadow-lg",
            isUnlocked && "border-2 border-primary animate-pulse",
            className
          )}
        >
          {/* Badges */}
          {isLocked && (
            <Badge 
              variant="secondary" 
              className="absolute top-4 right-4 bg-secondary text-secondary-foreground"
            >
              {t('testCard.locked')}
            </Badge>
          )}
          {isUnlocked && (
            <Badge 
              className="absolute top-4 right-4 bg-accent text-accent-foreground animate-bounce"
            >
              {t('testCard.unlocked')}
            </Badge>
          )}
          {isCompleted && (
            <Badge 
              className="absolute top-4 right-4 bg-accent text-accent-foreground"
            >
              {t('testCard.completed')}
            </Badge>
          )}

          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isLocked ? "bg-secondary/30" : "bg-primary/10",
                  isCompleted && "bg-accent/20"
                )}
              >
                {isLocked ? (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                ) : (
                  <span className="text-2xl">{config.emoji}</span>
                )}
              </div>
              <h3
                className={cn(
                  "text-xl font-bold",
                  isLocked ? "text-muted-foreground" : "text-primary"
                )}
              >
                {config.title}
              </h3>
            </div>
          </CardHeader>

          <div className="px-6">
            <div className={cn(
              "h-px w-full",
              isLocked ? "bg-secondary/50" : "bg-secondary"
            )} />
          </div>

          <CardContent className="pt-4">
            <p
              className={cn(
                "text-sm mb-3",
                isLocked ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {isLocked
                ? t('testCard.completeBigFiveFirst')
                : isCompleted
                ? t('testCard.testCompleted')
                : isUnlocked
                ? t('testCard.nowAvailable') + " " + config.description
                : config.description}
            </p>

            {isCompleted && formattedDate && (
              <p className="text-sm text-muted-foreground">
                {t('testCard.completedOn')} {formattedDate}
              </p>
            )}

            {!isCompleted && (
              <p
                className={cn(
                  "text-xs",
                  isLocked ? "text-muted-foreground/60" : "text-secondary-foreground"
                )}
              >
                {config.info}
              </p>
            )}
          </CardContent>

          <CardFooter className="pt-0">
            {!isLocked && (
              <Button
                onClick={isCompleted ? onViewReport : onStart}
                variant={isCompleted ? "outline" : "default"}
                className={cn(
                  "w-full",
                  !isCompleted && "bg-primary hover:bg-primary/90"
                )}
              >
                {isCompleted ? (
                  <>{t('testCard.viewReport')}</>
                ) : (
                  <>
                    {t('testCard.startTest')} <Sparkles className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </TooltipTrigger>

      {isLocked && (
        <TooltipContent>
          <p>{t('testCard.completeBigFiveFirst')}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default TestCard;
