import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegratedReportCardProps {
  onView: () => void;
  className?: string;
}

const IntegratedReportCard = ({ onView, className }: IntegratedReportCardProps) => {
  return (
    <Card
      className={cn(
        "relative border-2 border-accent overflow-hidden",
        "bg-gradient-to-r from-accent/10 via-accent/5 to-background",
        className
      )}
    >
      {/* Badge "NOVO" */}
      <Badge
        className="absolute top-4 right-4 bg-accent text-accent-foreground flex items-center gap-1"
      >
        <Gift className="w-3 h-3" />
        NOVO
      </Badge>

      <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
          <span className="text-3xl">🌟</span>
        </div>

        <h3 className="text-2xl font-bold text-primary mb-2">
          RELATÓRIO INTEGRADO
        </h3>

        <p className="text-muted-foreground mb-6 max-w-md">
          Sua análise completa: Big Five + Desenho Humano. Uma visão integrada
          do seu perfil de personalidade e mapa energético.
        </p>

        <Button
          onClick={onView}
          size="lg"
          className="bg-primary hover:bg-primary/90 px-8 py-3"
        >
          VER ANÁLISE COMPLETA
          <Sparkles className="ml-2 w-5 h-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default IntegratedReportCard;
