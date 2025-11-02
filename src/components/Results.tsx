import { TraitScore } from "@/types/test";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Download } from "lucide-react";

interface ResultsProps {
  traitScores: TraitScore[];
  onRestart: () => void;
}

export const Results = ({ traitScores, onRestart }: ResultsProps) => {
  const getScoreColor = (score: number) => {
    if (score < 2) return "bg-red-500";
    if (score < 2.5) return "bg-orange-500";
    if (score < 3.5) return "bg-yellow-500";
    if (score < 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const handleDownload = () => {
    const resultsText = traitScores
      .map((trait) => {
        const facetsText = trait.facets
          .map((facet) => `  - ${facet.name}: ${facet.score.toFixed(2)} (${facet.classification})`)
          .join("\n");
        return `${trait.name}: ${trait.score.toFixed(2)} (${trait.classification})\n${facetsText}`;
      })
      .join("\n\n");

    const blob = new Blob([`RESULTADOS DO TESTE DOS CINCO GRANDES\n\n${resultsText}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultados-big-five.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen gradient-hero py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Seus Resultados</h1>
          <p className="text-xl text-muted-foreground">
            Aqui está o seu perfil de personalidade baseado no modelo dos Cinco Grandes
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {traitScores.map((trait, index) => (
            <Card key={index} className="p-6 shadow-lg">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`text-2xl font-bold ${trait.color}`}>
                    {trait.name}
                  </h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {trait.score.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trait.classification}
                    </div>
                  </div>
                </div>
                <Progress
                  value={(trait.score / 5) * 100}
                  className="h-3"
                />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
                {trait.facets.map((facet, facetIndex) => (
                  <div
                    key={facetIndex}
                    className="bg-muted/50 p-3 rounded-lg"
                  >
                    <div className="text-sm font-semibold mb-1">
                      {facet.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getScoreColor(
                          facet.score
                        )}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {facet.score.toFixed(2)} - {facet.classification}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRestart}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Refazer Teste
          </Button>
          
          <Button
            onClick={handleDownload}
            size="lg"
            className="gradient-primary text-white hover:opacity-90 gap-2"
          >
            <Download className="w-5 h-5" />
            Baixar Resultados
          </Button>
        </div>

        <Card className="mt-8 p-6 bg-card/50">
          <h3 className="text-lg font-semibold mb-3">
            Sobre o Modelo dos Cinco Grandes
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O modelo dos Cinco Grandes é um dos modelos de personalidade mais amplamente 
            aceitos na psicologia. Ele mede cinco dimensões fundamentais que capturam as 
            principais diferenças na personalidade humana. Cada traço é medido em um espectro, 
            e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade. 
            Este teste fornece insights sobre seus padrões comportamentais típicos e 
            preferências naturais.
          </p>
        </Card>
      </div>
    </div>
  );
};
