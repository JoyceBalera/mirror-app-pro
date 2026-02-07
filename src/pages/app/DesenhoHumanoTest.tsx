import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActiveSession } from "@/hooks/useActiveSession";
import { geocodeLocation, getTimezoneFromCoords, convertLocalBirthToUTC } from "@/utils/geocoding";
import { calculateHumanDesignChart } from "@/utils/humanDesignCalculator";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";

const DesenhoHumanoTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { hasActiveSession, activeSessionType, refetch } = useActiveSession();
  
  // Check if coming from admin test environment
  const isDemo = searchParams.get('demo') === 'true';
  
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Pre-fill form from query params (admin test environment)
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    const locationParam = searchParams.get('location');
    
    if (dateParam) setBirthDate(dateParam);
    if (timeParam) setBirthTime(timeParam);
    if (locationParam) setBirthLocation(locationParam);
  }, [searchParams]);

  // Check if there's an existing HD session in progress (skip in demo mode)
  useEffect(() => {
    if (isDemo) return;

    const checkExistingSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (hasActiveSession && activeSessionType === 'big_five') {
        toast({
          title: t('humanDesignForm.testInProgress'),
          description: t('humanDesignForm.finishFirst'),
          variant: "destructive",
        });
        navigate("/app");
        return;
      }

      const { data: existingSession } = await supabase
        .from('human_design_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (existingSession) {
        setSessionId(existingSession.id);
      }
    };

    checkExistingSession();
  }, [hasActiveSession, activeSessionType, navigate, toast, t]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!birthDate) {
      newErrors.birthDate = t('humanDesignForm.birthDateRequired');
    } else {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.birthDate = t('humanDesignForm.birthDateFuture');
      }
    }
    
    if (!birthTime) {
      newErrors.birthTime = t('humanDesignForm.birthTimeRequired');
    }
    
    if (!birthLocation) {
      newErrors.birthLocation = t('humanDesignForm.birthLocationRequired');
    } else if (birthLocation.length < 5) {
      newErrors.birthLocation = t('humanDesignForm.birthLocationMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = birthDate && birthTime && birthLocation && birthLocation.length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('humanDesignForm.authError'),
          description: t('humanDesignForm.authErrorDesc'),
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        setLoadingMessage(t('humanDesignForm.startingSession'));
        const { data: newSession, error: sessionError } = await supabase
          .from('human_design_sessions')
          .insert({
            user_id: user.id,
            status: 'in_progress'
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        currentSessionId = newSession.id;
        setSessionId(currentSessionId);
      }

      setLoadingMessage(t('humanDesignForm.searchingCoordinates'));
      const location = await geocodeLocation(birthLocation);
      
      setLoadingMessage(t('humanDesignForm.determiningTimezone'));
      const timezoneResult = await getTimezoneFromCoords(location.lat, location.lon);
      
      const birthDateTimeUTC = convertLocalBirthToUTC(birthDate, birthTime, timezoneResult.timezone);
      
      setLoadingMessage(t('humanDesignForm.calculatingPositions'));
      const chart = await calculateHumanDesignChart(birthDateTimeUTC, {
        lat: location.lat,
        lon: location.lon,
        name: birthLocation
      });
      
      setLoadingMessage(t('humanDesignForm.savingMap'));
      
      // Convert centers array to Record<string, boolean> for consistent storage
      const centersData: Record<string, boolean> = {};
      chart.centers.forEach(center => {
        centersData[center.id] = center.defined;
      });

      const insertData = {
        user_id: user.id,
        session_id: currentSessionId,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_location: birthLocation,
        birth_lat: location.lat,
        birth_lon: location.lon,
        design_date: chart.designDate.toISOString(),
        energy_type: chart.type,
        strategy: chart.strategy,
        authority: chart.authority,
        profile: chart.profile,
        definition: chart.definition,
        incarnation_cross: chart.incarnationCross,
        personality_activations: chart.personality as unknown as any,
        design_activations: chart.design as unknown as any,
        centers: centersData,
        channels: chart.channels as unknown as any,
        activated_gates: chart.allActivatedGates
      };

      const { data: result, error } = await supabase
        .from('human_design_results')
        .insert(insertData as any)
        .select()
        .single();
      
      if (error) throw error;

      await supabase
        .from('human_design_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentSessionId);

      await supabase
        .from('user_test_access')
        .update({ 
          desenho_humano_completed_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      await refetch();
      
      toast({
        title: t('humanDesignForm.successTitle'),
        description: t('humanDesignForm.successDesc', { type: chart.type, profile: chart.profile }),
      });
      
      navigate(`/app/desenho-humano/results/${result.id}`);
      
    } catch (error: any) {
      console.error('Erro ao calcular HD:', error);
      toast({
        title: t('humanDesignForm.calcError'),
        description: error.message || t('humanDesignForm.calcErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-primary py-6 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
            {t('humanDesignForm.pageTitle')}
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            {t('humanDesignForm.pageSubtitle')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-background min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-[600px] mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/app")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('humanDesignForm.backToDashboard')}
          </Button>
          
          {/* Form Card */}
          <Card className="border-2">
            <CardContent className="p-6">
              {isDemo && (
                <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm mb-4 flex items-center gap-2">
                  🧪 <span className="font-medium">{t('humanDesignForm.demoMode')}</span> - {t('humanDesignForm.demoModeDesc')}
                </div>
              )}

              <h2 className="text-xl font-semibold text-primary mb-6">
                {t('humanDesignForm.requiredData')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    {t('humanDesignForm.birthDate')} *
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={errors.birthDate ? "border-destructive" : ""}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isSubmitting}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-destructive">{errors.birthDate}</p>
                  )}
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <Label htmlFor="birthTime">
                    {t('humanDesignForm.birthTime')} *
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className={errors.birthTime ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.birthTime && (
                    <p className="text-sm text-destructive">{errors.birthTime}</p>
                  )}
                  <p className="text-sm text-muted-foreground italic">
                    💡 {t('humanDesignForm.birthCertificateHint')}
                  </p>
                </div>

                {/* Birth Location */}
                <div className="space-y-2">
                  <Label htmlFor="birthLocation">
                    {t('humanDesignForm.birthLocation')} *
                  </Label>
                  <LocationAutocomplete
                    value={birthLocation}
                    onChange={setBirthLocation}
                    placeholder={t('humanDesignForm.locationPlaceholder')}
                    disabled={isSubmitting}
                    error={!!errors.birthLocation}
                  />
                  {errors.birthLocation && (
                    <p className="text-sm text-destructive">{errors.birthLocation}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {t('humanDesignForm.locationHint')}
                  </p>
                </div>

                {/* Loading Message */}
                {loadingMessage && (
                  <div className="bg-primary/10 text-primary p-3 rounded-lg text-center">
                    {loadingMessage}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/app")}
                    disabled={isSubmitting}
                  >
                    ← {t('humanDesignForm.back')}
                  </Button>

                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('humanDesignForm.calculating')}
                      </>
                    ) : (
                      t('humanDesignForm.generateMyMap')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DesenhoHumanoTest;
