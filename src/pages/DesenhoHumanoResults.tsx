import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Brain, User, Zap, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BodyGraph from "@/components/humandesign/BodyGraph";
import PlanetaryColumn from "@/components/humandesign/PlanetaryColumn";
import AnalysisSections from "@/components/humandesign/AnalysisSections";

interface HumanDesignResult {
  id: string;
  energy_type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnation_cross: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  personality_activations: any[];
  design_activations: any[];
  centers: any;
  channels: any[];
  activated_gates: number[];
  created_at: string;
}

const DesenhoHumanoResults = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [result, setResult] = useState<HumanDesignResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) {
        navigate("/dashboard");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('human_design_results')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Resultado não encontrado",
            description: "O mapa solicitado não existe ou foi removido.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setResult(data as HumanDesignResult);
      } catch (error: any) {
        console.error("Erro ao carregar resultado:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o resultado.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7B192B] mx-auto mb-4" />
          <p className="text-[#7B192B]">Carregando seu mapa energético...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const typeColors: Record<string, string> = {
    'Gerador': 'bg-red-500',
    'Gerador Manifestante': 'bg-orange-500',
    'Projetor': 'bg-blue-500',
    'Manifestor': 'bg-yellow-500',
    'Reflector': 'bg-purple-500',
  };

  const personalityGates = result.personality_activations?.map((a: any) => a.gate) || [];
  const designGates = result.design_activations?.map((a: any) => a.gate) || [];
  const definedCenters = Object.entries(result.centers || {})
    .filter(([_, isDefined]) => isDefined)
    .map(([centerId]) => centerId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-[#7B192B] py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-[#F7F3EF] hover:text-white hover:bg-white/10"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-[#F7F3EF]">
              Seu Mapa de Desenho Humano
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="bg-[#F7F3EF] min-h-[calc(100vh-80px)] py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Card Principal - Tipo */}
          <Card className="bg-white border-2 border-[#BFAFB2] overflow-hidden">
            <div className={`${typeColors[result.energy_type] || 'bg-gray-500'} p-6 text-white text-center`}>
              <Badge className="bg-white/20 text-white mb-2">SEU TIPO</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{result.energy_type}</h2>
              <p className="text-lg opacity-90">Estratégia: {result.strategy}</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <Brain className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">Autoridade</p>
                  <p className="font-semibold text-[#7B192B]">{result.authority}</p>
                </div>
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <User className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">Perfil</p>
                  <p className="font-semibold text-[#7B192B]">{result.profile}</p>
                </div>
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">Definição</p>
                  <p className="font-semibold text-[#7B192B]">{result.definition}</p>
                </div>
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">Cruz</p>
                  <p className="font-semibold text-[#7B192B] text-sm">{result.incarnation_cross}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BodyGraph + Colunas Planetárias */}
          <Card className="bg-white border-2 border-[#BFAFB2] overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-start">
                {/* Coluna Design (Esquerda) */}
                <div className="min-w-[100px]">
                  <PlanetaryColumn
                    title="Design"
                    activations={result.design_activations || []}
                    variant="design"
                  />
                </div>

                {/* BodyGraph (Centro) */}
                <div className="flex justify-center">
                  <BodyGraph
                    definedCenters={definedCenters}
                    activeChannels={result.channels || []}
                    activatedGates={result.activated_gates || []}
                    personalityGates={personalityGates}
                    designGates={designGates}
                  />
                </div>

                {/* Coluna Personalidade (Direita) */}
                <div className="min-w-[100px]">
                  <PlanetaryColumn
                    title="Personality"
                    activations={result.personality_activations || []}
                    variant="personality"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canais Ativos */}
          <Card className="bg-white border-2 border-[#BFAFB2]">
            <CardContent className="p-4">
              <h3 className="font-bold text-[#7B192B] mb-3">Canais Definidos</h3>
              {result.channels && Array.isArray(result.channels) ? (
                <div className="flex flex-wrap gap-2">
                  {result.channels
                    .filter((ch: any) => ch.isComplete)
                    .map((channel: any, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="bg-[#7B192B] text-white px-3 py-1"
                      >
                        {channel.id} - {channel.name}
                      </Badge>
                    ))}
                  {result.channels.filter((ch: any) => ch.isComplete).length === 0 && (
                    <p className="text-muted-foreground">Nenhum canal completo definido</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Dados de canais não disponíveis</p>
              )}
            </CardContent>
          </Card>

          {/* Seções de Análise */}
          <AnalysisSections
            energyType={result.energy_type}
            authority={result.authority}
            profile={result.profile}
            definition={result.definition}
            strategy={result.strategy}
          />

          {/* Dados de Nascimento */}
          <Card className="bg-white border-2 border-[#BFAFB2]">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-center text-sm text-muted-foreground">
                <span>📅 {result.birth_date}</span>
                <span>🕐 {result.birth_time}</span>
                <span>📍 {result.birth_location}</span>
                <span>Gerado em: {new Date(result.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="border-[#7B192B] text-[#7B192B]"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesenhoHumanoResults;
