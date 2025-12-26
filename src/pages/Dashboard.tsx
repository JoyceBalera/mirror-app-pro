import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TestCard, { TestStatus } from "@/components/dashboard/TestCard";
import IntegratedReportCard from "@/components/dashboard/IntegratedReportCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface UserTestAccess {
  has_big_five: boolean;
  has_desenho_humano: boolean;
  big_five_completed_at: string | null;
  desenho_humano_completed_at: string | null;
  integrated_report_available: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [access, setAccess] = useState<UserTestAccess | null>(null);
  const [bigFiveCompleted, setBigFiveCompleted] = useState(false);
  const [bigFiveCompletedAt, setBigFiveCompletedAt] = useState<string | null>(null);
  const [hdCompleted, setHdCompleted] = useState(false);
  const [hdCompletedAt, setHdCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log("🚀 Iniciando busca de dados do dashboard...");

      try {
        // 1. Buscar usuário autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("❌ Erro ao buscar usuário:", userError);
          navigate("/auth");
          return;
        }

        console.log("👤 Usuário encontrado:", user.id);

        // 2. Buscar perfil do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setUserName(profile?.full_name || user.email?.split("@")[0] || "Usuário");
        console.log("📝 Nome do usuário:", profile?.full_name);

        // 3. Buscar permissões de acesso aos testes
        const { data: accessData, error: accessError } = await supabase
          .from("user_test_access")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("🔐 Dados de acesso:", accessData, accessError);

        if (accessData) {
          setAccess(accessData as UserTestAccess);
        } else {
          // Usuário ainda não tem registro de acesso
          console.log("⚠️ Usuário não tem registro de acesso");
          setAccess(null);
        }

        // 4. Buscar status do Big Five (test_sessions completadas)
        const { data: bigFiveSession } = await supabase
          .from("test_sessions")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (bigFiveSession?.completed_at) {
          setBigFiveCompleted(true);
          setBigFiveCompletedAt(bigFiveSession.completed_at);
          console.log("✅ Big Five concluído em:", bigFiveSession.completed_at);
        }

        // 5. Buscar status do Desenho Humano
        const { data: hdSession } = await supabase
          .from("human_design_sessions")
          .select("completed_at")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (hdSession?.completed_at) {
          setHdCompleted(true);
          setHdCompletedAt(hdSession.completed_at);
          console.log("✅ Desenho Humano concluído em:", hdSession.completed_at);
        }

      } catch (error: any) {
        console.error("❌ Erro ao carregar dashboard:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, toast]);

  // Lógica de exibição dos cards
  const showBigFive = access?.has_big_five ?? false;
  const showDesenhoHumano = access?.has_desenho_humano ?? false;
  const hasAnyTest = showBigFive || showDesenhoHumano;

  // CENÁRIO 3: Ambos os testes - DH bloqueado até completar Big Five
  const hdBlocked = showBigFive && showDesenhoHumano && !bigFiveCompleted;

  // Relatório integrado disponível quando ambos completos
  const showIntegratedReport =
    showBigFive && showDesenhoHumano && bigFiveCompleted && hdCompleted;

  // Determinar status do card Big Five
  const getBigFiveStatus = (): TestStatus => {
    if (bigFiveCompleted) return "completed";
    return "available";
  };

  // Determinar status do card Desenho Humano
  const getDesenhoHumanoStatus = (): TestStatus => {
    if (hdCompleted) return "completed";
    if (hdBlocked) return "locked";
    // Se só tem Desenho Humano (sem Big Five), está disponível
    if (!showBigFive && showDesenhoHumano) return "available";
    // Se tem ambos e Big Five foi completado, está desbloqueado
    if (showBigFive && showDesenhoHumano && bigFiveCompleted) return "unlocked";
    return "available";
  };

  // Handlers de navegação
  const handleStartBigFive = () => {
    console.log("🎯 Navegando para Big Five test...");
    navigate("/");
  };

  const handleViewBigFiveReport = () => {
    console.log("📄 Navegando para relatório Big Five...");
    // TODO: Implementar página de resultados
    navigate("/");
  };

  const handleStartDesenhoHumano = () => {
    console.log("🎯 Navegando para Desenho Humano test...");
    // TODO: Implementar rota do Desenho Humano
    toast({
      title: "Em breve!",
      description: "O teste de Desenho Humano estará disponível em breve.",
    });
  };

  const handleViewDesenhoHumanoReport = () => {
    console.log("📄 Navegando para relatório Desenho Humano...");
    // TODO: Implementar página de resultados do DH
    toast({
      title: "Em breve!",
      description: "O relatório estará disponível em breve.",
    });
  };

  const handleViewIntegratedReport = () => {
    console.log("📄 Navegando para relatório integrado...");
    // TODO: Implementar página de relatório integrado
    toast({
      title: "Em breve!",
      description: "O relatório integrado estará disponível em breve.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-8 px-4">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-48 bg-primary-foreground/20 mb-2" />
            <Skeleton className="h-5 w-64 bg-primary-foreground/20" />
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={userName} />

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Seus Testes Disponíveis
        </h2>

        {!hasAnyTest ? (
          <EmptyState />
        ) : (
          <>
            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showBigFive && (
                <TestCard
                  type="big-five"
                  status={getBigFiveStatus()}
                  completedAt={bigFiveCompletedAt}
                  onStart={handleStartBigFive}
                  onViewReport={handleViewBigFiveReport}
                />
              )}

              {showDesenhoHumano && (
                <TestCard
                  type="desenho-humano"
                  status={getDesenhoHumanoStatus()}
                  completedAt={hdCompletedAt}
                  onStart={handleStartDesenhoHumano}
                  onViewReport={handleViewDesenhoHumanoReport}
                />
              )}
            </div>

            {/* Relatório Integrado - Full Width */}
            {showIntegratedReport && (
              <IntegratedReportCard
                onView={handleViewIntegratedReport}
                className="mt-8"
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
