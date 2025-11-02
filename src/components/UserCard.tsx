import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

const UserCard = ({ user }: UserCardProps) => {
  const navigate = useNavigate();
  const hasTested = user.test_sessions && user.test_sessions.length > 0 && 
    user.test_sessions.some(session => session.completed_at);
  const lastTest = user.test_sessions?.find(session => session.completed_at);

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

        {hasTested && (
          <Button
            onClick={() => navigate(`/admin/user/${user.id}`)}
            variant="outline"
          >
            Ver Resultados
          </Button>
        )}
      </div>
    </Card>
  );
};

export default UserCard;
