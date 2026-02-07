import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditUserDialogProps {
  user: {
    id: string;
    full_name: string | null;
    email?: string;
    preferred_language?: string;
    test_access?: {
      has_big_five: boolean;
      has_desenho_humano: boolean;
    };
  };
  currentRole: "user" | "admin";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserEdited: () => void;
}

const EditUserDialog = ({ user, currentRole, open, onOpenChange, onUserEdited }: EditUserDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">(currentRole);
  const [hasBigFive, setHasBigFive] = useState(user.test_access?.has_big_five ?? false);
  const [hasDesenhoHumano, setHasDesenhoHumano] = useState(user.test_access?.has_desenho_humano ?? false);
  const [language, setLanguage] = useState<"pt" | "en" | "es">((user.preferred_language as "pt" | "en" | "es") || "pt");

  useEffect(() => {
    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setPassword("");
    setRole(currentRole);
    setHasBigFive(user.test_access?.has_big_five ?? false);
    setHasDesenhoHumano(user.test_access?.has_desenho_humano ?? false);
    setLanguage((user.preferred_language as "pt" | "en" | "es") || "pt");
  }, [user, currentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('edit-user', {
        body: {
          userId: user.id,
          email,
          password: password || undefined,
          fullName,
          role,
          hasBigFive,
          hasDesenhoHumano,
          language,
        },
      });

      if (error) throw error;

      toast({
        title: "Usuário atualizado!",
        description: `${fullName} foi atualizado com sucesso.`,
      });

      onOpenChange(false);
      onUserEdited();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Algo deu errado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário e suas permissões.
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

          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha (deixe vazio para não alterar)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a nova senha"
              minLength={6}
            />
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

          <div className="space-y-2">
            <Label htmlFor="language">Idioma Preferido</Label>
            <Select value={language} onValueChange={(value: "pt" | "en" | "es") => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">🇧🇷 Português</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">Permissões de Testes</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bigFive">Mapa de Personalidade</Label>
                <p className="text-xs text-muted-foreground">Análise comportamental</p>
              </div>
              <Switch
                id="bigFive"
                checked={hasBigFive}
                onCheckedChange={setHasBigFive}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="desenhoHumano">Arquitetura Pessoal</Label>
                <p className="text-xs text-muted-foreground">Mapa energético</p>
              </div>
              <Switch
                id="desenhoHumano"
                checked={hasDesenhoHumano}
                onCheckedChange={setHasDesenhoHumano}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
