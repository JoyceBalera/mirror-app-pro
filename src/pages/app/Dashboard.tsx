import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActiveSession } from "@/hooks/useActiveSession";
import TestCard, { TestStatus } from "@/components/dashboard/TestCard";
import IntegratedReportCard from "@/components/dashboard/IntegratedReportCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PlayCircle } from "lucide-react";

interface UserTestAccess {
  has_big_five: boolean;
  has_desenho_humano: boolean;
  big_five_completed_at: string | null;
  desenho_humano_completed_at: string | null;
  integrated_report_available: boolean;
}

const AppDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { 
    hasActiveSession, 
    activeSessionType, 
    resumeUrl, 
    loading: sessionLoading 
  } = useActiveSession();

  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<UserTestAccess | null>(null);
  const [bigFiveCompleted, setBigFiveCompleted] = useState(false);
  const [bigFiveCompletedAt, setBigFiveCompletedAt] = useState<string | null>(null);
  const [hdCompleted, setHdCompleted] = useState(false);
  const [hdCompletedAt, setHdCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          navigate("/auth");
          return;
        }

        // Fetch test access permissions
        const { data: accessData } = await supabase
          .from("user_test_access")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (accessData) {
          setAccess(accessData as UserTestAccess);
        } else {
          setAccess(null);
        }

        // Fetch Big Five completion status
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
        }

        // Fetch Human Design completion status
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
        }

      } catch (error: any) {
        console.error("Erro ao carregar dashboard:", error);
        // Não mostrar toast aqui - erros de refresh de sessão são tratados pelo redirect
        // O toast "resultNotFound" só deve aparecer em navegação explícita para resultados
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, toast, t]);

  // Visibility logic
  const showBigFive = access?.has_big_five ?? false;
  const showDesenhoHumano = access?.has_desenho_humano ?? false;
  const hasAnyTest = showBigFive || showDesenhoHumano;

  // HD is blocked until Big Five is completed (if both are available)
  const hdBlocked = showBigFive && showDesenhoHumano && !bigFiveCompleted;

  // Integrated report available when both are completed
  const showIntegratedReport = showBigFive && showDesenhoHumano && bigFiveCompleted && hdCompleted;

  // Get the label for active session type
  const getActiveSessionLabel = () => {
    switch (activeSessionType) {
      case 'big_five':
        return t('testCard.bigFive');
      case 'desenho_humano':
        return t('testCard.humanDesign');
      default:
        return 'teste';
    }
  };

  // Determine Big Five card status
  const getBigFiveStatus = (): TestStatus => {
    if (bigFiveCompleted) return "completed";
    // If there's an HD session in progress, block Big Five
    if (hasActiveSession && activeSessionType === 'desenho_humano') return "locked";
    return "available";
  };

  // Determine Human Design card status
  const getDesenhoHumanoStatus = (): TestStatus => {
    if (hdCompleted) return "completed";
    // If there's a Big Five session in progress, block HD
    if (hasActiveSession && activeSessionType === 'big_five') return "locked";
    if (hdBlocked) return "locked";
    if (!showBigFive && showDesenhoHumano) return "available";
    if (showBigFive && showDesenhoHumano && bigFiveCompleted) return "unlocked";
    return "available";
  };

  // Navigation handlers
  const handleStartBigFive = () => {
    if (hasActiveSession && activeSessionType !== 'big_five') {
      toast({
        title: t("dashboard.testInProgress"),
        description: t("dashboard.finishFirst", { testName: getActiveSessionLabel() }),
        variant: "destructive",
      });
      return;
    }
    navigate("/app/big-five");
  };

  const handleViewBigFiveReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar a sessão mais recente completada do usuário
      const { data: session } = await supabase
        .from("test_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (session) {
        navigate(`/app/big-five/results/${session.id}`);
      } else {
        toast({
          title: t("common.error"),
          description: t("dashboard.resultNotFound"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error navigating to Big Five results:", error);
    }
  };

  const handleStartDesenhoHumano = () => {
    if (hasActiveSession && activeSessionType !== 'desenho_humano') {
      toast({
        title: t("dashboard.testInProgress"),
        description: t("dashboard.finishFirst", { testName: getActiveSessionLabel() }),
        variant: "destructive",
      });
      return;
    }
    navigate("/app/desenho-humano");
  };

  const handleViewDesenhoHumanoReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: hdResult } = await supabase
        .from("human_design_results")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (hdResult) {
        navigate(`/app/desenho-humano/results/${hdResult.id}`);
      } else {
        toast({
          title: t("common.error"),
          description: t("dashboard.resultNotFound"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error navigating to HD results:", error);
    }
  };

  const handleViewIntegratedReport = () => {
    navigate("/app/integrado");
  };

  if (loading || sessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Active Session Banner */}
      {hasActiveSession && (
        <Card className="p-4 mb-6 border-2 border-primary bg-primary/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-primary">
                  {t("dashboard.testInProgress")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.finishFirst", { testName: getActiveSessionLabel() })}
                </p>
              </div>
            </div>
            {resumeUrl && (
              <Button onClick={() => navigate(resumeUrl)} className="gap-2">
                <PlayCircle className="w-4 h-4" />
                {t("dashboard.continue", { testName: getActiveSessionLabel() })}
              </Button>
            )}
          </div>
        </Card>
      )}

      <h2 className="text-2xl font-bold text-primary mb-6">
        {t("dashboard.availableTests")}
      </h2>

      {!hasAnyTest ? (
        <EmptyState />
      ) : (
        <>
          {/* Test Cards Grid */}
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

          {/* Integrated Report */}
          {showIntegratedReport && (
            <IntegratedReportCard
              onView={handleViewIntegratedReport}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
};

export default AppDashboard;
