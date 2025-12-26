import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { geocodeLocation } from "@/utils/geocoding";
import { calculateHumanDesignChart } from "@/utils/humanDesignCalculator";

const DesenhoHumanoTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    } else {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.birthDate = "Data não pode ser no futuro";
      }
    }
    
    if (!birthTime) {
      newErrors.birthTime = "Hora de nascimento é obrigatória";
    }
    
    if (!birthLocation) {
      newErrors.birthLocation = "Local de nascimento é obrigatório";
    } else if (birthLocation.length < 5) {
      newErrors.birthLocation = "Informe o local completo (mínimo 5 caracteres)";
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
      // 1. Verificar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para gerar seu mapa.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // 2. Geocodificar local
      setLoadingMessage("Buscando coordenadas do local...");
      const location = await geocodeLocation(birthLocation);
      
      // 3. Criar datetime de nascimento
      const birthDateTime = new Date(`${birthDate}T${birthTime}:00`);
      
      // 4. Calcular Human Design Chart
      setLoadingMessage("Calculando posições planetárias...");
      const chart = await calculateHumanDesignChart(birthDateTime, {
        lat: location.lat,
        lon: location.lon,
        name: birthLocation
      });
      
      // 5. Salvar resultado no banco
      setLoadingMessage("Salvando seu mapa energético...");
      
      const insertData = {
        user_id: user.id,
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
        centers: chart.centers as unknown as any,
        channels: chart.channels as unknown as any,
        activated_gates: chart.allActivatedGates
      };

      // 5.1 Criar sessão de HD como completada
      const { data: sessionData, error: sessionError } = await supabase
        .from('human_design_sessions')
        .insert({
          user_id: user.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 5.2 Salvar resultado vinculado à sessão
      const { data: result, error } = await supabase
        .from('human_design_results')
        .insert({
          ...insertData,
          session_id: sessionData.id
        } as any)
        .select()
        .single();
      
      if (error) throw error;

      // 5.3 Atualizar data de conclusão no user_test_access
      const { error: accessError } = await supabase
        .from('user_test_access')
        .update({ 
          desenho_humano_completed_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      if (accessError) {
        console.error('Erro ao atualizar user_test_access:', accessError);
      }
      
      toast({
        title: "Mapa gerado com sucesso! 🎉",
        description: `Você é um(a) ${chart.type} com perfil ${chart.profile}`,
      });
      
      // 6. Navegar para página de resultados
      navigate(`/desenho-humano/results/${result.id}`);
      
    } catch (error: any) {
      console.error('Erro ao calcular HD:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível calcular seu mapa.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="w-full bg-[#7B192B] py-6 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#F7F3EF]">
            Desenho Humano - Dados de Nascimento
          </h1>
          <p className="text-[#F7F3EF]/80 mt-2">
            Preencha seus dados para gerar seu mapa energético
          </p>
        </div>
      </header>

      {/* CONTAINER PRINCIPAL */}
      <main className="bg-[#F7F3EF] min-h-[calc(100vh-120px)] py-8 px-4">
        <div className="max-w-[600px] mx-auto">
          
          {/* CARD DO FORMULÁRIO */}
          <Card className="bg-white border-2 border-[#BFAFB2] rounded-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-[#7B192B] mb-6">
                DADOS NECESSÁRIOS
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Campo 1: Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-foreground">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={errors.birthDate ? "border-red-500" : ""}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isSubmitting}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-red-500">{errors.birthDate}</p>
                  )}
                </div>

                {/* Campo 2: Hora de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="text-foreground">
                    Hora de Nascimento *
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className={errors.birthTime ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.birthTime && (
                    <p className="text-sm text-red-500">{errors.birthTime}</p>
                  )}
                  <p className="text-sm text-[#BFAFB2] italic">
                    💡 Verifique sua certidão de nascimento
                  </p>
                </div>

                {/* Campo 3: Local de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birthLocation" className="text-foreground">
                    Local de Nascimento *
                  </Label>
                  <Input
                    id="birthLocation"
                    type="text"
                    value={birthLocation}
                    onChange={(e) => setBirthLocation(e.target.value)}
                    placeholder="São Paulo, SP, Brasil"
                    className={errors.birthLocation ? "border-red-500" : ""}
                    minLength={5}
                    disabled={isSubmitting}
                  />
                  {errors.birthLocation && (
                    <p className="text-sm text-red-500">{errors.birthLocation}</p>
                  )}
                  <p className="text-sm text-[#BFAFB2]">
                    Cidade, Estado, País
                  </p>
                </div>

                {/* Loading Message */}
                {loadingMessage && (
                  <div className="bg-[#7B192B]/10 text-[#7B192B] p-3 rounded-lg text-center">
                    {loadingMessage}
                  </div>
                )}

                {/* BOTÕES */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#BFAFB2]">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[#BFAFB2] hover:text-[#7B192B]"
                    onClick={() => navigate("/dashboard")}
                    disabled={isSubmitting}
                  >
                    ← Voltar
                  </Button>

                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="bg-[#7B192B] text-[#F7F3EF] hover:bg-[#7B192B]/90 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      "GERAR MEU MAPA ✨"
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
