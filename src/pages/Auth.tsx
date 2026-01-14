import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const translateAuthError = (error: string): string => {
    const translations: { [key: string]: string } = {
      "Password should be at least 6 characters": t("auth.errors.passwordLength"),
      "User already registered": t("auth.errors.userExists"),
      "Invalid login credentials": t("auth.errors.invalidCredentials"),
      "Email not confirmed": t("auth.errors.emailNotConfirmed"),
      "Password is too weak": t("auth.errors.weakPassword"),
      "Password is known to be weak": t("auth.errors.commonPassword"),
      "Signup disabled": t("auth.errors.signupDisabled"),
      "Invalid email": t("auth.errors.invalidEmail"),
    };

    for (const [english, translated] of Object.entries(translations)) {
      if (error.includes(english)) {
        return translated;
      }
    }

    return error;
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && password.length < 6) {
      toast({
        title: t("auth.invalidPassword"),
        description: t("auth.passwordMinLength"),
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
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeBackToast"),
        });
        navigate('/dashboard');
      } else {
        const redirectUrl = `${window.location.origin}/dashboard`;
        
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
          title: t("auth.accountCreated"),
          description: t("auth.loginNow"),
        });
        
        setIsLogin(true);
      }
    } catch (error: any) {
      const translatedMessage = translateAuthError(error.message || t("auth.somethingWentWrong"));
      
      toast({
        title: t("common.error"),
        description: translatedMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? t("auth.loginDescription")
              : t("auth.signupDescription")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.fullName")}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t("auth.fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {!isLogin && (
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  {t("auth.passwordRequirements")}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={password.length >= 6 ? "text-green-500" : "text-muted-foreground"}>
                      {password.length >= 6 ? "✓" : "○"}
                    </span>
                    {t("auth.minChars")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-muted-foreground">○</span>
                    {t("auth.avoidCommon")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-muted-foreground">○</span>
                    {t("auth.useCombination")}
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
            {loading ? t("common.loading") : isLogin ? t("auth.login") : t("auth.signup")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? t("auth.noAccount")
              : t("auth.hasAccount")}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
