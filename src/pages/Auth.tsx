import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const translateAuthError = (error: string): string => {
  const translations: { [key: string]: string } = {
    "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres",
    "User already registered": "Este email já está cadastrado",
    "Invalid login credentials": "Email ou senha incorretos",
    "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada",
    "Password is too weak": "A senha é muito fraca. Use uma senha mais forte",
    "Signup disabled": "Cadastro desabilitado no momento",
    "Invalid email": "Email inválido",
  };
  
  for (const [english, portuguese] of Object.entries(translations)) {
    if (error.includes(english)) {
      return portuguese;
    }
  }
  
  return error;
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Conta criada!",
          description: "Você pode fazer login agora.",
        });
        
        setIsLogin(true);
      }
    } catch (error: any) {
      const translatedMessage = translateAuthError(error.message || "Algo deu errado");
      
      toast({
        title: "Erro",
        description: translatedMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Entre para acessar seu teste de personalidade"
              : "Crie uma conta para salvar seus resultados"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {!isLogin && (
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  A senha deve conter:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={password.length >= 6 ? "text-green-500" : "text-muted-foreground"}>
                      {password.length >= 6 ? "✓" : "○"}
                    </span>
                    Mínimo de 6 caracteres
                  </li>
                </ul>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? "Não tem uma conta? Criar conta"
              : "Já tem uma conta? Entrar"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
