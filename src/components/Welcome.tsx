import { Button } from "@/components/ui/button";
import { Brain, Zap } from "lucide-react";

interface WelcomeProps {
  onStart: () => void;
  onQuickTest?: () => void;
}

export const Welcome = ({ onStart, onQuickTest }: WelcomeProps) => {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Teste dos Cinco Grandes
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Descubra sua personalidade através do modelo científico dos Cinco Grandes Fatores 
            (Big Five). Este teste avalia cinco dimensões fundamentais da personalidade humana.
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">O que você vai descobrir:</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-accent/50 rounded-lg">
              <h3 className="font-semibold text-blue-600 mb-2">🧠 Abertura</h3>
              <p className="text-sm text-muted-foreground">
                Sua apreciação por arte, criatividade e novas experiências
              </p>
            </div>
            
            <div className="p-4 bg-accent/50 rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">📋 Conscienciosidade</h3>
              <p className="text-sm text-muted-foreground">
                Seu nível de organização e responsabilidade
              </p>
            </div>
            
            <div className="p-4 bg-accent/50 rounded-lg">
              <h3 className="font-semibold text-purple-600 mb-2">🎉 Extroversão</h3>
              <p className="text-sm text-muted-foreground">
                Sua sociabilidade e busca por estimulação
              </p>
            </div>
            
            <div className="p-4 bg-accent/50 rounded-lg">
              <h3 className="font-semibold text-amber-600 mb-2">🤝 Amabilidade</h3>
              <p className="text-sm text-muted-foreground">
                Sua tendência à cooperação e empatia
              </p>
            </div>
            
            <div className="p-4 bg-accent/50 rounded-lg md:col-span-2">
              <h3 className="font-semibold text-red-600 mb-2">😰 Neuroticismo</h3>
              <p className="text-sm text-muted-foreground">
                Sua estabilidade emocional e resiliência ao estresse
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground">
              <strong>Instruções:</strong> O teste contém 50 afirmações. Para cada uma, 
              avalie o quanto ela se aplica a você em uma escala de 1 (Discordo Totalmente) 
              a 5 (Concordo Totalmente). Seja honesto e responda com base em como você 
              realmente é, não como gostaria de ser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onStart}
              size="lg"
              className="flex-1 gradient-primary text-white hover:opacity-90 text-lg py-6"
            >
              Começar Teste
            </Button>
            
            {onQuickTest && (
              <Button
                onClick={onQuickTest}
                variant="outline"
                size="lg"
                className="flex gap-2"
              >
                <Zap className="w-5 h-5" />
                Teste Rápido (Admin)
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          ⏱️ Tempo estimado: 10-15 minutos
        </p>
      </div>
    </div>
  );
};
