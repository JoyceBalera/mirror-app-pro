import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, BarChart3, Star } from "lucide-react";

interface TestSession {
  id: string;
  type: 'big_five' | 'desenho_humano';
  status: string;
  completed_at: string | null;
  created_at: string;
  result_id?: string;
}

const Historico = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch Big Five sessions
      const { data: bigFiveSessions } = await supabase
        .from('test_sessions')
        .select('id, status, completed_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch Human Design sessions
      const { data: hdSessions } = await supabase
        .from('human_design_sessions')
        .select('id, status, completed_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch HD results to get result IDs
      const { data: hdResults } = await supabase
        .from('human_design_results')
        .select('id, session_id')
        .eq('user_id', user.id);

      const hdResultMap = new Map(hdResults?.map(r => [r.session_id, r.id]) || []);

      // Combine and format sessions
      const allSessions: TestSession[] = [
        ...(bigFiveSessions || []).map(s => ({
          ...s,
          type: 'big_five' as const,
          result_id: s.id // session_id is used for Big Five results
        })),
        ...(hdSessions || []).map(s => ({
          ...s,
          type: 'desenho_humano' as const,
          result_id: hdResultMap.get(s.id)
        }))
      ];

      // Sort by date
      allSessions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setSessions(allSessions);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (session: TestSession) => {
    if (session.type === 'big_five') {
      navigate(`/app/big-five/results/${session.id}`);
    } else if (session.result_id) {
      navigate(`/app/desenho-humano/results/${session.result_id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-700">Em Andamento</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeConfig = (type: 'big_five' | 'desenho_humano') => {
    if (type === 'big_five') {
      return {
        icon: BarChart3,
        label: 'Big Five',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }
    return {
      icon: Star,
      label: 'Desenho Humano',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">
        Histórico de Testes
      </h1>

      {sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Você ainda não realizou nenhum teste.
          </p>
          <Button onClick={() => navigate("/app")}>
            Ir para Dashboard
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const config = getTypeConfig(session.type);
            const Icon = config.icon;

            return (
              <Card key={`${session.type}-${session.id}`} className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{config.label}</h3>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.completed_at ? (
                          <>
                            Concluído em {format(new Date(session.completed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </>
                        ) : (
                          <>
                            Iniciado em {format(new Date(session.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {session.status === 'completed' && (
                    <Button
                      onClick={() => handleViewResult(session)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Resultado
                    </Button>
                  )}

                  {session.status === 'in_progress' && (
                    <Button
                      onClick={() => {
                        if (session.type === 'big_five') {
                          navigate('/app/big-five');
                        } else {
                          navigate('/app/desenho-humano');
                        }
                      }}
                      className="gap-2"
                    >
                      Continuar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Historico;
