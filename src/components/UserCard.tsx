import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Pencil, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UserCardProps {
  user: {
    id: string;
    full_name: string | null;
    email?: string;
    created_at: string;
    test_sessions?: Array<{
      id: string;
      completed_at: string | null;
      status: string;
    }>;
  };
  onEdit: () => void;
}

const UserCard = ({ user, onEdit }: UserCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const hasTested = user.test_sessions && user.test_sessions.length > 0 && 
    user.test_sessions.some(session => session.completed_at);
  const lastTest = user.test_sessions?.find(session => session.completed_at);
  const DEFAULT_PASSWORD = "Temp@2024";

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('edit-user', {
        body: {
          userId: user.id,
          password: DEFAULT_PASSWORD,
        },
      });

      if (error) throw error;

      toast({
        title: "Senha resetada",
        description: `Nova senha de ${user.full_name || user.email}: ${DEFAULT_PASSWORD}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao resetar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-2 rounded-full ${hasTested ? 'bg-green-100' : 'bg-orange-100'}`}>
            {hasTested ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-orange-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {user.full_name || user.email || 'Usuário sem nome'}
            </h3>
            {user.email && <p className="text-sm text-muted-foreground mb-2">{user.email}</p>}
            
            <div className="flex items-center gap-2 mb-2">
              {hasTested ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Teste Realizado
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  Pendente
                </Badge>
              )}
            </div>
            
            {lastTest && (
              <p className="text-sm text-muted-foreground">
                Último teste: {format(new Date(lastTest.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleResetPassword}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
          >
            <KeyRound className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
          {hasTested && (
            <Button
              onClick={() => navigate(`/admin/user/${user.id}`)}
              variant="outline"
              size="sm"
            >
              Ver Resultados
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserCard;
