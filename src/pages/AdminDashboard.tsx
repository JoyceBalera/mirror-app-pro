import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Users, CheckCircle, Clock, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserCard from "@/components/UserCard";
import CreateUserDialog from "@/components/CreateUserDialog";

interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  test_sessions?: Array<{
    id: string;
    completed_at: string | null;
    status: string;
  }>;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filter, users]);

  const fetchUsers = async () => {
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

      // Fetch emails from auth metadata via RPC or edge function if needed
      // For now, we'll just use the profiles data
      setUsers(profiles || []);
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
    if (filter === "tested") {
      filtered = filtered.filter(user => 
        user.test_sessions && user.test_sessions.some(s => s.completed_at)
      );
    } else if (filter === "pending") {
      filtered = filtered.filter(user => 
        !user.test_sessions || !user.test_sessions.some(s => s.completed_at)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const stats = {
    total: users.length,
    tested: users.filter(u => u.test_sessions?.some(s => s.completed_at)).length,
    pending: users.filter(u => !u.test_sessions?.some(s => s.completed_at)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Teste
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Testes Realizados</p>
                <p className="text-3xl font-bold">{stats.tested}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="tested">Testados</SelectItem>
                <SelectItem value="pending">Não Testados</SelectItem>
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
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
