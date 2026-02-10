import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { extractAdvancedVariables, type AdvancedVariables, type AdvancedVariable } from "@/utils/humanDesignVariables";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateHDReport } from "@/utils/generateHDReport";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { translateCross } from "@/data/humanDesignCrosses";

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
  const { t, i18n } = useTranslation();
  
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

  // Get current locale for date formatting
  const getDateLocale = () => {
    const lang = i18n.language?.split('-')[0] || 'pt';
    switch (lang) {
      case 'es': return 'es-ES';
      case 'en': return 'en-US';
      default: return 'pt-BR';
    }
  };

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
            title: t('humanDesignResults.resultNotFound'),
            description: t('humanDesignResults.resultNotFoundDesc'),
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
        console.error("Error loading result:", error);
        toast({
          title: t('humanDesignResults.error'),
          description: t('humanDesignResults.errorLoadingResult'),
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, navigate, toast, t]);

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
      // Handle both formats: array of objects OR key-value object
      let definedCenters: string[];
      let openCenters: string[];

      if (Array.isArray(result.centers)) {
        // Array format: [{ id: 'head', defined: true }, ...]
        definedCenters = result.centers
          .filter((c: any) => c.defined)
          .map((c: any) => c.id);
        openCenters = result.centers
          .filter((c: any) => !c.defined)
          .map((c: any) => c.id);
      } else {
        // Object format: { head: true, ajna: false, ... }
        definedCenters = Object.entries(result.centers || {})
          .filter(([_, isDefined]) => isDefined)
          .map(([centerId]) => centerId);
        openCenters = Object.entries(result.centers || {})
          .filter(([_, isDefined]) => !isDefined)
          .map(([centerId]) => centerId);
      }

      // Extract advanced variables for AI
      const advancedVars = extractAdvancedVariables({
        personality_activations: result.personality_activations || [],
        design_activations: result.design_activations || [],
      });

      const humanDesignData = {
        userName: userName || 'você',
        definedCenters,
        openCenters,
        energyType: result.energy_type,
        strategy: result.strategy,
        authority: result.authority,
        definition: result.definition,
        profile: result.profile,
        incarnationCross: result.incarnation_cross,
        activatedGates: result.activated_gates,
        channels: result.channels,
        advancedVariables: advancedVars,
      };

      const { data, error } = await supabase.functions.invoke('analyze-human-design', {
        body: { 
          resultId: result.id, 
          humanDesignData,
          language: i18n.language?.split('-')[0] || 'pt'
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
        setAiAnalysis({
          id: 'temp',
          result_id: result.id,
          analysis_text: data.analysis,
          generated_at: new Date().toISOString(),
        });
      }

      toast({
        title: t('humanDesignResults.analysisGenerated'),
        description: t('humanDesignResults.analysisGeneratedDesc'),
      });
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast({
        title: t('humanDesignResults.analysisError'),
        description: error.message || t('humanDesignResults.analysisErrorDesc'),
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
        console.warn('Bodygraph SVG not found');
        return null;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = 2;
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
          console.error('Error loading SVG as image');
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
    } catch (error) {
      console.error('Error capturing Bodygraph:', error);
      return null;
    }
  };

  // Function to download PDF report
  const handleDownloadPDF = async () => {
    if (!result || !variables) return;
    
    setGeneratingPDF(true);
    try {
      const bodygraphImage = await captureBodyGraphAsImage();
      
      // Get current language
      const currentLanguage = (i18n.language?.split('-')[0] || 'pt') as 'pt' | 'es' | 'en';
      
      await generateHDReport({
        language: currentLanguage,
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
        title: t('humanDesignResults.pdfGenerated'),
        description: t('humanDesignResults.pdfGeneratedDesc'),
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: t('humanDesignResults.pdfError'),
        description: t('humanDesignResults.pdfErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Function to recalculate map with new algorithm
  const handleRecalculate = async () => {
    if (!result || !result.birth_lat || !result.birth_lon) {
      toast({
        title: t('humanDesignResults.error'),
        description: t('humanDesignResults.coordinatesNotAvailable'),
        variant: "destructive",
      });
      return;
    }

    setRecalculating(true);
    try {
      const timeParts = result.birth_time.split(':');
      const timeValue = timeParts.length === 3 
        ? result.birth_time
        : `${result.birth_time}:00`;
      
      const birthDateTimeUTC = new Date(`${result.birth_date}T${timeValue}Z`);
      
      if (isNaN(birthDateTimeUTC.getTime())) {
        toast({
          title: t('humanDesignResults.error'),
          description: t('humanDesignResults.invalidBirthDate'),
          variant: "destructive",
        });
        setRecalculating(false);
        return;
      }
      
      const chart = await calculateHumanDesignChart(birthDateTimeUTC, {
        lat: result.birth_lat,
        lon: result.birth_lon,
        name: result.birth_location
      });

      const centersData: Record<string, boolean> = {};
      chart.centers.forEach(center => {
        centersData[center.id] = center.defined;
      });

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

      const { data: updatedData } = await supabase
        .from('human_design_results')
        .select('*')
        .eq('id', result.id)
        .single();

      if (updatedData) {
        setResult(updatedData as HumanDesignResult);
      }

      toast({
        title: t('humanDesignResults.mapRecalculated'),
        description: t('humanDesignResults.mapRecalculatedDesc'),
      });
    } catch (error: any) {
      console.error("Error recalculating:", error);
      toast({
        title: t('humanDesignResults.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRecalculating(false);
    }
  };

  // Format design_date for display
  const formatDesignDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString(getDateLocale(), { 
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' UTC';
  };

  // Get Sun longitudes for debug
  const getSunLongitude = (activations: any[], label: string) => {
    const sun = activations?.find((a: any) => a.planet === 'Sun');
    return sun ? `${sun.longitude?.toFixed(2)}° (Gate ${sun.gate}.${sun.line})` : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7B192B] mx-auto mb-4" />
          <p className="text-[#7B192B]">{t('humanDesignResults.loading')}</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const typeColors: Record<string, string> = {
    'Gerador': 'bg-red-500',
    'Generator': 'bg-red-500',
    'Gerador Manifestante': 'bg-orange-500',
    'Manifesting Generator': 'bg-orange-500',
    'Projetor': 'bg-blue-500',
    'Projector': 'bg-blue-500',
    'Manifestor': 'bg-yellow-500',
    'Manifestador': 'bg-yellow-500',
    'Refletor': 'bg-purple-500',
    'Reflector': 'bg-purple-500',
  };

  const personalityGates = result.personality_activations?.map((a: any) => a.gate) || [];
  const designGates = result.design_activations?.map((a: any) => a.gate) || [];
  // Handle both formats: array of objects OR key-value object
  const definedCenters = Array.isArray(result.centers)
    ? result.centers.filter((c: any) => c.defined).map((c: any) => c.id)
    : Object.entries(result.centers || {})
        .filter(([_, isDefined]) => isDefined)
        .map(([centerId]) => centerId);

  // Translation helpers for HD values
  const tv = (value: string | null | undefined): string => {
    if (!value) return 'N/A';
    const key = `hdValues.${value}`;
    const translated = t(key);
    return translated === key ? value : translated;
  };

  const tvd = (variableType: string, value: string | null | undefined): string => {
    if (!value) return '';
    const key = `hdVariableDetails.${variableType}.${value}.desc`;
    const translated = t(key);
    return translated === key ? '' : translated;
  };

  const tvt = (variableType: string, value: string | null | undefined): string => {
    if (!value) return '';
    const key = `hdVariableDetails.${variableType}.${value}.tips`;
    const translated = t(key);
    return translated === key ? '' : translated;
  };

  const renderVariableCard = (variableType: string, variable: AdvancedVariable | undefined, icon: ReactNode, label: string, showSubCategory?: boolean) => {
    if (!variable) return null;
    const description = tvd(variableType, variable.primary) || variable.description;
    const tip = tvt(variableType, variable.primary) || variable.tips;
    const translatedValue = tv(variable.primary);
    const translatedSubCategory = variable.subcategory ? tv(variable.subcategory) : undefined;
    
    return (
      <div className="p-3 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]/50 hover:border-[#BFAFB2] transition-colors">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <p className="font-semibold text-[#7B192B] text-sm">{translatedValue}</p>
              {showSubCategory && translatedSubCategory && (
                <p className="text-xs text-muted-foreground mt-0.5">{translatedSubCategory}</p>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">{description}</p>
            {tip && (
              <p className="text-xs text-muted-foreground mt-2 italic">💡 {tip}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-[#7B192B] py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-[#F7F3EF] hover:text-white hover:bg-white/10"
              onClick={() => navigate("/app")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('humanDesignResults.back')}
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-[#F7F3EF]">
              {t('humanDesignResults.pageTitle')}
            </h1>
            <LanguageSwitcher variant="compact" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 [&_svg]:text-white" />
          </div>
        </div>
      </header>

      <main className="bg-[#F7F3EF] min-h-[calc(100vh-80px)] py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Main Card - Type */}
          <Card className="bg-white border-2 border-[#BFAFB2] overflow-hidden">
            <div className={`${typeColors[result.energy_type] || 'bg-gray-500'} p-6 text-white text-center`}>
              <Badge className="bg-white/20 text-white mb-2">{t('humanDesignResults.yourType')}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{tv(result.energy_type)}</h2>
              <p className="text-lg opacity-90">{t('humanDesignResults.strategy')}: {tv(result.strategy)}</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <Brain className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">{t('humanDesignResults.authority')}</p>
                  <p className="font-semibold text-[#7B192B]">{tv(result.authority)}</p>
                </div>
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <User className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">{t('humanDesignResults.profile')}</p>
                  <p className="font-semibold text-[#7B192B]">{result.profile}</p>
                </div>
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">{t('humanDesignResults.definition')}</p>
                  <p className="font-semibold text-[#7B192B]">{tv(result.definition)}</p>
                </div>
                <div className="p-4 bg-[#F7F3EF] rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-[#7B192B]" />
                  <p className="text-xs text-muted-foreground">{t('humanDesignResults.cross')}</p>
                  <p className="font-semibold text-[#7B192B] text-sm">{translateCross(result.incarnation_cross, i18n.language?.split('-')[0] || 'pt')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Variables */}
          {variables && (
            <TooltipProvider>
              <Card className="bg-white border-2 border-[#BFAFB2]">
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#7B192B] text-lg mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5" />
                    {t('humanDesignResults.advancedVariables')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {renderVariableCard('digestion', variables.digestion, <Utensils className="h-4 w-4 text-[#7B192B]" />, t('humanDesignResults.digestion'), true)}
                    {renderVariableCard('environment', variables.environment, <MapPin className="h-4 w-4 text-[#7B192B]" />, t('humanDesignResults.environment'))}
                    {renderVariableCard('motivation', variables.motivation, <Heart className="h-4 w-4 text-[#7B192B]" />, t('humanDesignResults.motivation'))}
                    {renderVariableCard('perspective', variables.perspective, <Eye className="h-4 w-4 text-[#7B192B]" />, t('humanDesignResults.perspective'))}
                    {renderVariableCard('sense', variables.designSense || variables.sense, <Hand className="h-4 w-4 text-[#7B192B]" />, t('humanDesignResults.sense'))}
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          )}

          {/* BodyGraph + Planetary Columns */}
          <Card className="bg-white border-2 border-[#BFAFB2] overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 md:gap-8 items-start">
                {/* Design Column (Left) */}
                <div className="min-w-[100px]">
                  <PlanetaryColumn
                    title="Design"
                    activations={result.design_activations || []}
                    variant="design"
                  />
                </div>

                {/* BodyGraph (Center) */}
                <div className="flex justify-center">
                  <HDBodyGraph
                    definedCenters={definedCenters}
                    activeChannels={result.channels || []}
                    activatedGates={result.activated_gates || []}
                    personalityGates={personalityGates}
                    designGates={designGates}
                  />
                </div>

                {/* Personality Column (Right) */}
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

          {/* Active Channels */}
          <Card className="bg-white border-2 border-[#BFAFB2]">
            <CardContent className="p-4">
              <h3 className="font-bold text-[#7B192B] mb-3">{t('humanDesignResults.definedChannels')}</h3>
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
                    <p className="text-muted-foreground">{t('humanDesignResults.noDefinedChannels')}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">{t('humanDesignResults.channelDataNotAvailable')}</p>
              )}
            </CardContent>
          </Card>

          {/* Analysis Sections */}
          <AnalysisSections
            energyType={result.energy_type}
            authority={result.authority}
            profile={result.profile}
            definition={result.definition}
            strategy={result.strategy}
          />

          {/* AI Analysis */}
          <Card className="bg-white border-2 border-[#7B192B] overflow-hidden">
            <CardContent className="p-0">
              <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen}>
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-[#F7F3EF] transition-colors bg-gradient-to-r from-[#7B192B] to-[#A02846]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5" />
                        <span className="font-bold text-lg">{t('humanDesignResults.aiAnalysis')}</span>
                        {aiAnalysis && (
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            {t('humanDesignResults.generated')}
                          </Badge>
                        )}
                      </div>
                      {analysisOpen ? <ChevronUp className="h-5 w-5 text-white" /> : <ChevronDown className="h-5 w-5 text-white" />}
                    </div>
                    <p className="text-white/80 text-sm mt-1">
                      {t('humanDesignResults.aiAnalysisSubtitle')}
                    </p>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6">
                    {aiAnalysis ? (
                      <div>
                        {/* General Summary */}
                        <div className="mb-6 p-6 bg-[#F7F3EF] rounded-lg border border-[#BFAFB2]">
                          <h4 className="font-bold text-[#7B192B] text-lg mb-3">{t('humanDesignResults.analysisSummary')}</h4>
                          <p className="text-foreground leading-relaxed mb-4">
                            {t('humanDesignResults.analysisSummaryText')}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {t('humanDesignResults.downloadFullPdf')}
                          </p>
                        </div>

                        {/* Download PDF Button */}
                        <div className="p-4 bg-gradient-to-r from-[#7B192B] to-[#A02846] rounded-lg">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="text-white">
                              <h4 className="font-semibold">{t('humanDesignResults.downloadPdfTitle')}</h4>
                              <p className="text-sm text-white/80">
                                {t('humanDesignResults.downloadPdfSubtitle')}
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
                                  {t('humanDesignResults.generatingPdf')}
                                </>
                              ) : (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  {t('humanDesignResults.downloadPdf')}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#BFAFB2] flex items-center justify-between text-sm text-muted-foreground">
                          <span>{t('humanDesignResults.generatedAt')}: {new Date(aiAnalysis.generated_at).toLocaleDateString(getDateLocale(), { 
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
                                {t('humanDesignResults.regenerating')}
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t('humanDesignResults.regenerate')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-[#7B192B] mb-4" />
                        <h3 className="text-lg font-semibold text-[#7B192B] mb-2">
                          {t('humanDesignResults.yourPersonalizedAnalysis')}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {t('humanDesignResults.analysisDescription')}
                        </p>
                        <Button
                          onClick={handleGenerateAnalysis}
                          disabled={generatingAnalysis}
                          className="bg-[#7B192B] hover:bg-[#5a1220] text-white"
                        >
                          {generatingAnalysis ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {t('humanDesignResults.generatingAnalysis')}
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5" />
                              {t('humanDesignResults.generateWithAI')}
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

          {/* Birth Data */}
          <Card className="bg-white border-2 border-[#BFAFB2]">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-center text-sm text-muted-foreground">
                <span>📅 {result.birth_date}</span>
                <span>🕐 {result.birth_time}</span>
                <span>📍 {result.birth_location}</span>
                <span>{t('humanDesignResults.generatedOn')}: {new Date(result.created_at).toLocaleDateString(getDateLocale())}</span>
              </div>
            </CardContent>
          </Card>

          {/* Debug Panel (Collapsible) - ADMIN ONLY */}
          {isAdmin && (
            <Collapsible open={debugOpen} onOpenChange={setDebugOpen}>
              <Card className="bg-white border-2 border-amber-300">
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-amber-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Bug className="h-5 w-5" />
                        <span className="font-medium">{t('humanDesignResults.debugPanel')}</span>
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
                        <h4 className="font-bold text-amber-800">{t('humanDesignResults.birthPersonality')}</h4>
                        <p><span className="text-muted-foreground">{t('humanDesignResults.dateSaved')}:</span> {result.birth_date} {result.birth_time} UTC</p>
                        <p><span className="text-muted-foreground">{t('humanDesignResults.coordinates')}:</span> {result.birth_lat?.toFixed(4)}, {result.birth_lon?.toFixed(4)}</p>
                        <p><span className="text-muted-foreground">{t('humanDesignResults.sunPersonality')}:</span> {getSunLongitude(result.personality_activations, 'Personality')}</p>
                      </div>
                      
                      {/* Design Data */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-amber-800">{t('humanDesignResults.designBefore')}</h4>
                        <p><span className="text-muted-foreground">{t('humanDesignResults.designDate')}:</span> {formatDesignDate(result.design_date)}</p>
                        <p><span className="text-muted-foreground">{t('humanDesignResults.sunDesign')}:</span> {getSunLongitude(result.design_activations, 'Design')}</p>
                      </div>

                      {/* Moon and Mercury debug */}
                      <div className="md:col-span-2 pt-2 border-t border-amber-100">
                        <h4 className="font-bold text-amber-800 mb-2">{t('humanDesignResults.moonMercuryVerification')}</h4>
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

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              className="border-[#7B192B] text-[#7B192B]"
              onClick={() => navigate("/app")}
            >
              {t('humanDesignResults.backToDashboard')}
            </Button>
            {/* Recalculate Button - ADMIN ONLY */}
            {isAdmin && (
              <Button
                onClick={handleRecalculate}
                disabled={recalculating || !result.birth_lat || !result.birth_lon}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {recalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('humanDesignResults.recalculating')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('humanDesignResults.recalculateMap')}
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
