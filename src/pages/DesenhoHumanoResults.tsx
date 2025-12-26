import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Brain, User, Zap, Target, RefreshCw, ChevronDown, ChevronUp, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BodyGraph from "@/components/humandesign/BodyGraph";
import PlanetaryColumn from "@/components/humandesign/PlanetaryColumn";
import AnalysisSections from "@/components/humandesign/AnalysisSections";
import { calculateHumanDesignChart } from "@/utils/humanDesignCalculator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface HumanDesignResult {
  id: string;
  user_id: string;
  energy_type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnation_cross: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  birth_lat: number | null;
  birth_lon: number | null;
  design_date: string | null;
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
  const [recalculating, setRecalculating] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

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

  // Função para recalcular o mapa com o novo algoritmo
  const handleRecalculate = async () => {
    if (!result || !result.birth_lat || !result.birth_lon) {
      toast({
        title: "Erro",
        description: "Coordenadas do local de nascimento não disponíveis.",
        variant: "destructive",
      });
      return;
    }

    setRecalculating(true);
    try {
      // Reconstruir a data/hora UTC do nascimento a partir dos dados salvos
      const [year, month, day] = result.birth_date.split('-').map(Number);
      const [hours, minutes] = result.birth_time.split(':').map(Number);
      
      // Buscar o design_date salvo para determinar o offset original
      // Usamos UTC diretamente como salvo no banco
      const birthDateTimeUTC = new Date(`${result.birth_date}T${result.birth_time}:00Z`);
      
      // Recalcular o chart
      const chart = await calculateHumanDesignChart(birthDateTimeUTC, {
        lat: result.birth_lat,
        lon: result.birth_lon,
        name: result.birth_location
      });

      // Preparar dados dos centros como objeto
      const centersData: Record<string, boolean> = {};
      chart.centers.forEach(center => {
        centersData[center.id] = center.defined;
      });

      // Atualizar no banco de dados - converter para JSON serializable
      const { error } = await supabase
        .from('human_design_results')
        .update({
          energy_type: chart.type,
          strategy: chart.strategy,
          authority: chart.authority,
          profile: chart.profile,
          definition: chart.definition,
          incarnation_cross: chart.incarnationCross,
          personality_activations: JSON.parse(JSON.stringify(chart.personality)),
          design_activations: JSON.parse(JSON.stringify(chart.design)),
          design_date: chart.designDate.toISOString(),
          centers: centersData,
          channels: JSON.parse(JSON.stringify(chart.channels)),
          activated_gates: chart.allActivatedGates,
          updated_at: new Date().toISOString()
        })
        .eq('id', result.id);

      if (error) throw error;

      // Recarregar os dados atualizados
      const { data: updatedData } = await supabase
        .from('human_design_results')
        .select('*')
        .eq('id', result.id)
        .single();

      if (updatedData) {
        setResult(updatedData as HumanDesignResult);
      }

      toast({
        title: "Mapa recalculado!",
        description: "Os dados foram atualizados com o novo algoritmo.",
      });
    } catch (error: any) {
      console.error("Erro ao recalcular:", error);
      toast({
        title: "Erro",
        description: `Não foi possível recalcular: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setRecalculating(false);
    }
  };

  // Formatar design_date para exibição
  const formatDesignDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' UTC';
  };

  // Obter longitudes do Sol para debug
  const getSunLongitude = (activations: any[], label: string) => {
    const sun = activations?.find((a: any) => a.planet === 'Sun');
    return sun ? `${sun.longitude?.toFixed(2)}° (Gate ${sun.gate}.${sun.line})` : 'N/A';
  };

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

          {/* Painel de Debug (Colapsável) */}
          <Collapsible open={debugOpen} onOpenChange={setDebugOpen}>
            <Card className="bg-white border-2 border-amber-300">
              <CollapsibleTrigger asChild>
                <CardContent className="p-4 cursor-pointer hover:bg-amber-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Bug className="h-5 w-5" />
                      <span className="font-medium">Painel de Debug (Validação)</span>
                    </div>
                    {debugOpen ? <ChevronUp className="h-5 w-5 text-amber-600" /> : <ChevronDown className="h-5 w-5 text-amber-600" />}
                  </div>
                </CardContent>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 p-4 border-t border-amber-200">
                  <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                    {/* Birth Data */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-amber-800">Nascimento (Personality)</h4>
                      <p><span className="text-muted-foreground">Data/Hora Salva:</span> {result.birth_date} {result.birth_time} UTC</p>
                      <p><span className="text-muted-foreground">Coordenadas:</span> {result.birth_lat?.toFixed(4)}, {result.birth_lon?.toFixed(4)}</p>
                      <p><span className="text-muted-foreground">Sol (Personality):</span> {getSunLongitude(result.personality_activations, 'Personality')}</p>
                    </div>
                    
                    {/* Design Data */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-amber-800">Design (88° antes)</h4>
                      <p><span className="text-muted-foreground">Design Date:</span> {formatDesignDate(result.design_date)}</p>
                      <p><span className="text-muted-foreground">Sol (Design):</span> {getSunLongitude(result.design_activations, 'Design')}</p>
                    </div>

                    {/* Moon and Mercury debug */}
                    <div className="md:col-span-2 pt-2 border-t border-amber-100">
                      <h4 className="font-bold text-amber-800 mb-2">Lua e Mercúrio (Verificação)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Personality</p>
                          {result.personality_activations?.filter((a: any) => ['Moon', 'Mercury'].includes(a.planet)).map((a: any) => (
                            <p key={a.planet}>{a.planetLabel}: <strong>{a.gate}.{a.line}</strong> ({a.longitude?.toFixed(2)}°)</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Design</p>
                          {result.design_activations?.filter((a: any) => ['Moon', 'Mercury'].includes(a.planet)).map((a: any) => (
                            <p key={a.planet}>{a.planetLabel}: <strong>{a.gate}.{a.line}</strong> ({a.longitude?.toFixed(2)}°)</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Botões de Ação */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              className="border-[#7B192B] text-[#7B192B]"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
            <Button
              onClick={handleRecalculate}
              disabled={recalculating || !result.birth_lat || !result.birth_lon}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {recalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recalculando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalcular Mapa
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesenhoHumanoResults;
