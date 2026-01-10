import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Pencil } from "lucide-react";
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
    human_design_sessions?: Array<{
      id: string;
      completed_at: string | null;
      status: string;
    }>;
    test_access?: {
      has_big_five: boolean;
      has_desenho_humano: boolean;
    };
  };
  onEdit: () => void;
}

const UserCard = ({ user, onEdit }: UserCardProps) => {
  const navigate = useNavigate();
  
  const hasTestedBigFive = user.test_sessions?.some(session => session.completed_at);
  const hasTestedHD = user.human_design_sessions?.some(session => session.completed_at);
  const hasTested = hasTestedBigFive || hasTestedHD;
  
  const lastBigFiveTest = user.test_sessions?.find(session => session.completed_at);
  const lastHDTest = user.human_design_sessions?.find(session => session.completed_at);

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
            
            {/* Status dos testes realizados */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {hasTestedBigFive ? (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Big Five ✓
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                  Big Five Pendente
                </Badge>
              )}
              {hasTestedHD ? (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Desenho Humano ✓
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                  Desenho Humano Pendente
                </Badge>
              )}
            </div>

            {/* Testes liberados */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Liberados:</span>
              {user.test_access?.has_big_five ? (
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  Big Five
                </Badge>
              ) : null}
              {user.test_access?.has_desenho_humano ? (
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  Desenho Humano
                </Badge>
              ) : null}
              {!user.test_access?.has_big_five && !user.test_access?.has_desenho_humano && (
                <span className="text-xs text-muted-foreground">Nenhum</span>
              )}
            </div>
            
            {/* Datas dos últimos testes */}
            <div className="text-sm text-muted-foreground space-y-1">
              {lastBigFiveTest && (
                <p>
                  Big Five: {format(new Date(lastBigFiveTest.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
              {lastHDTest && (
                <p>
                  Desenho Humano: {format(new Date(lastHDTest.completed_at!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
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
