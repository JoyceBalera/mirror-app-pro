import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserCard from "@/components/UserCard";
import CreateUserDialog from "@/components/CreateUserDialog";
import EditUserDialog from "@/components/EditUserDialog";

interface Profile {
  id: string;
  full_name: string | null;
  email?: string;
  role?: "user" | "admin";
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
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<{ 
    id: string; 
    full_name: string | null; 
    email?: string; 
    role: "user" | "admin";
    test_access?: { has_big_five: boolean; has_desenho_humano: boolean };
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          test_sessions(
            id,
            completed_at,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user roles, test access, and human design sessions
      const usersWithData = await Promise.all(
        (profiles || []).map(async (user) => {
          const [roleResult, accessResult, hdResult] = await Promise.all([
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .single(),
            supabase
              .from("user_test_access")
              .select("has_big_five, has_desenho_humano")
              .eq("user_id", user.id)
              .maybeSingle(),
            supabase
              .from("human_design_sessions")
              .select("id, completed_at, status")
              .eq("user_id", user.id)
          ]);

          return {
            ...user,
            role: roleResult.data?.role || "user",
            test_access: accessResult.data || { has_big_five: false, has_desenho_humano: false },
            human_design_sessions: hdResult.data || [],
          };
        })
      );

      setUsers(usersWithData);
      setFilteredUsers(usersWithData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    const hasTestedBigFive = (u: Profile) => u.test_sessions?.some(s => s.completed_at);
    const hasTestedHD = (u: Profile) => u.human_design_sessions?.some(s => s.completed_at);

    if (filter === "tested") {
      filtered = filtered.filter(u => hasTestedBigFive(u) || hasTestedHD(u));
    } else if (filter === "pending") {
      filtered = filtered.filter(u => !hasTestedBigFive(u) && !hasTestedHD(u));
    } else if (filter === "bigfive") {
      filtered = filtered.filter(u => hasTestedBigFive(u));
    } else if (filter === "humandesign") {
      filtered = filtered.filter(u => hasTestedHD(u));
    }

    setFilteredUsers(filtered);
  };

  const hasTestedBigFive = (u: Profile) => u.test_sessions?.some(s => s.completed_at);
  const hasTestedHD = (u: Profile) => u.human_design_sessions?.some(s => s.completed_at);

  const stats = {
    total: users.length,
    testedBigFive: users.filter(u => hasTestedBigFive(u)).length,
    testedHD: users.filter(u => hasTestedHD(u)).length,
    pending: users.filter(u => !hasTestedBigFive(u) && !hasTestedHD(u)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mapa de Personalidade</p>
              <p className="text-3xl font-bold">{stats.testedBigFive}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arquitetura Pessoal</p>
              <p className="text-3xl font-bold">{stats.testedHD}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sem Testes</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="tested">Com Algum Teste</SelectItem>
              <SelectItem value="bigfive">Mapa de Personalidade Realizado</SelectItem>
              <SelectItem value="humandesign">Arquitetura Pessoal Realizada</SelectItem>
              <SelectItem value="pending">Sem Nenhum Teste</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Usuários ({filteredUsers.length})
          </h2>
          <CreateUserDialog onUserCreated={fetchUsers} />
        </div>
        
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onEdit={() => setEditingUser({ 
                id: user.id, 
                full_name: user.full_name, 
                email: user.email,
                role: user.role || "user",
                test_access: user.test_access
              })}
            />
          ))
        )}
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          currentRole={editingUser.role}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserEdited={fetchUsers}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
