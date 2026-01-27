import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Brain, User, Zap, Target, RefreshCw, ChevronDown, ChevronUp, Bug, Sparkles, Utensils, MapPin, Heart, Eye, Hand, Compass, Info, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import HDBodyGraph from "@/components/humandesign/HDBodyGraph";
import PlanetaryColumn from "@/components/humandesign/PlanetaryColumn";
import AnalysisSections from "@/components/humandesign/AnalysisSections";
import { calculateHumanDesignChart } from "@/utils/humanDesignCalculator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { extractAdvancedVariables, type AdvancedVariables } from "@/utils/humanDesignVariables";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateHDReport } from "@/utils/generateHDReport";
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

interface AIAnalysis {
  id: string;
  result_id: string;
  analysis_text: string;
  generated_at: string;
}

const DesenhoHumanoResults = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  
  const [result, setResult] = useState<HumanDesignResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  
  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

        // Fetch user profile to get name
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .maybeSingle();
        
        if (profileData?.full_name) {
          setUserName(profileData.full_name);
        }

        // Fetch existing AI analysis
        const { data: analysisData } = await supabase
          .from('human_design_analyses')
          .select('*')
          .eq('result_id', id)
          .maybeSingle();

        if (analysisData) {
          setAiAnalysis(analysisData as AIAnalysis);
        }
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

  // Calculate advanced variables
  const variables = useMemo<AdvancedVariables | null>(() => {
    if (!result) return null;
    return extractAdvancedVariables({
      personality_activations: result.personality_activations || [],
      design_activations: result.design_activations || [],
    });
  }, [result]);

  // Function to generate AI analysis
  const handleGenerateAnalysis = async () => {
    if (!result) return;

    setGeneratingAnalysis(true);
    try {
      const definedCenters = Object.entries(result.centers || {})
        .filter(([_, isDefined]) => isDefined)
        .map(([centerId]) => centerId);

      // Extract advanced variables for AI
      const advancedVars = extractAdvancedVariables({
        personality_activations: result.personality_activations || [],
        design_activations: result.design_activations || [],
      });

      const humanDesignData = {
        userName: 'você', // Could be fetched from profile if needed
        definedCenters,
        energyType: result.energy_type,
        strategy: result.strategy,
        authority: result.authority,
        definition: result.definition,
        profile: result.profile,
        incarnationCross: result.incarnation_cross,
        activatedGates: result.activated_gates,
        channels: result.channels,
        // Advanced variables for AI analysis
        advancedVariables: advancedVars,
      };

      const { data, error } = await supabase.functions.invoke('analyze-human-design', {
        body: { 
          resultId: result.id, 
          humanDesignData 
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Fetch the saved analysis
      const { data: analysisData } = await supabase
        .from('human_design_analyses')
        .select('*')
        .eq('result_id', result.id)
        .maybeSingle();

      if (analysisData) {
        setAiAnalysis(analysisData as AIAnalysis);
      } else if (data.analysis) {
        // If not saved but returned, use directly
        setAiAnalysis({
          id: 'temp',
          result_id: result.id,
          analysis_text: data.analysis,
          generated_at: new Date().toISOString(),
        });
      }

      toast({
        title: "Análise gerada!",
        description: "Sua análise personalizada de Desenho Humano está pronta.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar análise:", error);
      toast({
        title: "Erro ao gerar análise",
        description: error.message || "Não foi possível gerar a análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  // Function to capture Bodygraph SVG as PNG
  const captureBodyGraphAsImage = async (): Promise<string | null> => {
    try {
      const svgElement = document.querySelector('.bodygraph-svg') as SVGElement;
      if (!svgElement) {
        console.warn('Bodygraph SVG não encontrado');
        return null;
      }

      // Serializar SVG para string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // Criar blob e URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Carregar em imagem e desenhar no canvas
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x para melhor qualidade
          canvas.width = 330 * scale;
          canvas.height = 620 * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, 330, 620);
          }
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        };
        img.onerror = () => {
          console.error('Erro ao carregar SVG como imagem');
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
    } catch (error) {
      console.error('Erro ao capturar Bodygraph:', error);
      return null;
    }
  };

  // Function to download PDF report
  const handleDownloadPDF = async () => {
    if (!result || !variables) return;
    
    setGeneratingPDF(true);
    try {
      // Capturar imagem do Bodygraph
      const bodygraphImage = await captureBodyGraphAsImage();
      
      await generateHDReport({
        user_name: userName,
        birth_date: result.birth_date,
        birth_time: result.birth_time,
        birth_location: result.birth_location,
        energy_type: result.energy_type,
        strategy: result.strategy,
        authority: result.authority,
        profile: result.profile,
        definition: result.definition,
        incarnation_cross: result.incarnation_cross,
        centers: result.centers || {},
        channels: result.channels || [],
        personality_activations: result.personality_activations || [],
        design_activations: result.design_activations || [],
        variables: variables,
        ai_analysis_full: aiAnalysis?.analysis_text || '',
        bodygraph_image: bodygraphImage || undefined,
      });
      
      toast({
        title: "PDF gerado!",
        description: "O download do relatório começará em instantes.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

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
      // Verificar se birth_time já tem segundos (HH:MM:SS) ou só HH:MM
      const timeParts = result.birth_time.split(':');
      const timeValue = timeParts.length === 3 
        ? result.birth_time  // Já tem segundos (HH:MM:SS)
        : `${result.birth_time}:00`;  // Só tem HH:MM, adicionar segundos
      
      // Reconstruir a data/hora UTC do nascimento
      const birthDateTimeUTC = new Date(`${result.birth_date}T${timeValue}Z`);
      
      // Validar se a data é válida
      if (isNaN(birthDateTimeUTC.getTime())) {
        toast({
          title: "Erro",
          description: "Data de nascimento inválida. Verifique os dados salvos.",
          variant: "destructive",
        });
        setRecalculating(false);
        return;
      }
      
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
              Sua Arquitetura Pessoal
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

          {/* Variáveis Avançadas */}
          {variables && (
            <TooltipProvider>
              <Card className="bg-white border-2 border-[#BFAFB2]">
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#7B192B] text-lg mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    Variáveis Avançadas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {variables.digestion && (
                      <div className="p-4 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Utensils className="h-4 w-4 text-[#7B192B]" />
                            <p className="text-xs text-muted-foreground font-medium">Digestão</p>
                          </div>
                          {variables.digestion.tips && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#7B192B]/60 cursor-help hover:text-[#7B192B] transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-sm">
                                <p className="font-medium mb-1">💡 Dica prática:</p>
                                <p>{variables.digestion.tips}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="font-semibold text-[#7B192B]">
                          {variables.digestion.primary} ({variables.digestion.level})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variables.digestion.description}
                        </p>
                        {variables.digestion.subcategory && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {variables.digestion.subcategory}
                          </Badge>
                        )}
                      </div>
                    )}

                    {variables.environment && (
                      <div className="p-4 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#7B192B]" />
                            <p className="text-xs text-muted-foreground font-medium">Ambiente</p>
                          </div>
                          {variables.environment.tips && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#7B192B]/60 cursor-help hover:text-[#7B192B] transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-sm">
                                <p className="font-medium mb-1">💡 Dica prática:</p>
                                <p>{variables.environment.tips}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="font-semibold text-[#7B192B]">
                          {variables.environment.primary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variables.environment.description}
                        </p>
                        {variables.environment.subcategory && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {variables.environment.subcategory}
                          </Badge>
                        )}
                      </div>
                    )}

                    {variables.motivation && (
                      <div className="p-4 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-[#7B192B]" />
                            <p className="text-xs text-muted-foreground font-medium">Motivação</p>
                          </div>
                          {variables.motivation.tips && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#7B192B]/60 cursor-help hover:text-[#7B192B] transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-sm">
                                <p className="font-medium mb-1">💡 Dica prática:</p>
                                <p>{variables.motivation.tips}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="font-semibold text-[#7B192B]">
                          {variables.motivation.primary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variables.motivation.description}
                        </p>
                        {variables.motivation.subcategory && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {variables.motivation.subcategory}
                          </Badge>
                        )}
                      </div>
                    )}

                    {variables.perspective && (
                      <div className="p-4 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-[#7B192B]" />
                            <p className="text-xs text-muted-foreground font-medium">Perspectiva</p>
                          </div>
                          {variables.perspective.tips && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#7B192B]/60 cursor-help hover:text-[#7B192B] transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-sm">
                                <p className="font-medium mb-1">💡 Dica prática:</p>
                                <p>{variables.perspective.tips}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="font-semibold text-[#7B192B]">
                          {variables.perspective.primary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variables.perspective.description}
                        </p>
                        {variables.perspective.subcategory && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {variables.perspective.subcategory}
                          </Badge>
                        )}
                      </div>
                    )}

                    {variables.sense && (
                      <div className="p-4 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hand className="h-4 w-4 text-[#7B192B]" />
                            <p className="text-xs text-muted-foreground font-medium">Sentido</p>
                          </div>
                          {variables.sense.tips && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#7B192B]/60 cursor-help hover:text-[#7B192B] transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-sm">
                                <p className="font-medium mb-1">💡 Dica prática:</p>
                                <p>{variables.sense.tips}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="font-semibold text-[#7B192B]">
                          {variables.sense.primary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variables.sense.description}
                        </p>
                      </div>
                    )}

                    {variables.designSense && (
                      <div className="p-4 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hand className="h-4 w-4 text-[#7B192B]" />
                            <p className="text-xs text-muted-foreground font-medium">Sentido do Design</p>
                          </div>
                          {variables.designSense.tips && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-[#7B192B]/60 cursor-help hover:text-[#7B192B] transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-sm">
                                <p className="font-medium mb-1">💡 Dica prática:</p>
                                <p>{variables.designSense.tips}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="font-semibold text-[#7B192B]">
                          {variables.designSense.primary}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {variables.designSense.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          )}

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
                  <HDBodyGraph
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

          {/* Análise de IA por Luciana Belenton */}
          <Card className="bg-white border-2 border-[#7B192B] overflow-hidden">
            <CardContent className="p-0">
              <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen}>
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-[#F7F3EF] transition-colors bg-gradient-to-r from-[#7B192B] to-[#A02846]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-bold text-lg">Análise Personalizada por IA</span>
                        {aiAnalysis && (
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            Gerada
                          </Badge>
                        )}
                      </div>
                      {analysisOpen ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
                    </div>
                    <p className="text-white/80 text-sm mt-1">
                      Uma análise profunda e empática do seu Desenho Humano
                    </p>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6">
                    {aiAnalysis ? (
                      <div>
                        {/* Resumo Geral */}
                        <div className="mb-6 p-6 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]">
                          <h4 className="font-bold text-[#7B192B] text-lg mb-3">Resumo da sua Análise</h4>
                          <p className="text-foreground leading-relaxed mb-4">
                            A análise completa do seu Desenho Humano foi gerada com sucesso. Ela inclui uma interpretação profunda 
                            do seu tipo energético <strong>{result.energy_type}</strong>, sua estratégia de <strong>{result.strategy}</strong>, 
                            autoridade <strong>{result.authority}</strong>, perfil <strong>{result.profile}</strong> e muito mais.
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Para acessar a análise completa com todos os detalhes, baixe o relatório em PDF abaixo.
                          </p>
                        </div>

                        {/* Botão de Download PDF */}
                        <div className="p-4 bg-gradient-to-r from-[#7B192B] to-[#A02846] rounded-lg">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="text-white">
                              <h4 className="font-semibold">Baixar Relatório Completo em PDF</h4>
                              <p className="text-sm text-white/80">
                                Análise completa, variáveis avançadas e todas as informações do seu mapa
                              </p>
                            </div>
                            <Button
                              onClick={handleDownloadPDF}
                              disabled={generatingPDF}
                              className="bg-white hover:bg-[#F7F3EF] text-[#7B192B] font-semibold"
                            >
                              {generatingPDF ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Gerando PDF...
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar PDF
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#BFAFB2] flex items-center justify-between text-sm text-muted-foreground">
                          <span>Gerada em: {new Date(aiAnalysis.generated_at).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateAnalysis}
                            disabled={generatingAnalysis}
                            className="border-[#7B192B] text-[#7B192B]"
                          >
                            {generatingAnalysis ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Regenerando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerar Análise
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-[#7B192B] mb-4" />
                        <h3 className="text-lg font-semibold text-[#7B192B] mb-2">
                          Sua Análise Personalizada
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Descubra uma análise profunda e empática do seu Desenho Humano, 
                          com orientações especialmente elaboradas para mulheres.
                        </p>
                        <Button
                          onClick={handleGenerateAnalysis}
                          disabled={generatingAnalysis}
                          className="bg-[#7B192B] hover:bg-[#5a1220] text-white"
                        >
                          {generatingAnalysis ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Gerando análise... (pode levar alguns minutos)
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5" />
                              Gerar Análise com IA
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

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

          {/* Painel de Debug (Colapsável) - APENAS ADMIN */}
          {isAdmin && (
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
          )}

          {/* Botões de Ação */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              className="border-[#7B192B] text-[#7B192B]"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
            {/* Botão Recalcular - APENAS ADMIN */}
            {isAdmin && (
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesenhoHumanoResults;
