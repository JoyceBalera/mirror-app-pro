import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

const CreateUserDialog = ({ onUserCreated }: CreateUserDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const DEFAULT_PASSWORD = "Temp@2024";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call edge function to create user with specific role
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password: DEFAULT_PASSWORD,
          fullName,
          role,
        },
      });

      if (error) throw error;

      toast({
        title: "Usuário criado!",
        description: `${fullName} foi adicionado como ${role === 'admin' ? 'administrador' : 'usuário'}.`,
      });

      // Reset form
      setFullName("");
      setEmail("");
      setRole("user");
      setOpen(false);
      onUserCreated();
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Algo deu errado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Adicione um novo usuário ao sistema e defina suas permissões.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nome completo do usuário"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              />
            </div>

            <div className="space-y-2 bg-muted p-3 rounded-md">
              <Label className="text-sm font-medium">Senha Temporária</Label>
              <p className="text-sm text-muted-foreground">
                Senha padrão: <span className="font-mono font-semibold">{DEFAULT_PASSWORD}</span>
              </p>
            </div>

            <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário</Label>
            <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
