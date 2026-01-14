import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { 
  LayoutDashboard, 
  History, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useUserRole();
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Usuário');
      }
    };
    fetchUserName();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/app', label: t('header.dashboard'), icon: LayoutDashboard },
    { path: '/app/historico', label: t('header.history'), icon: History },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-xl font-bold">
              {t('header.appName')}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "gap-2",
                  isActive(item.path) 
                    ? "bg-primary-foreground/20" 
                    : "hover:bg-primary-foreground/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
            
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2 hover:bg-primary-foreground/10"
              >
                <Shield className="w-4 h-4" />
                {t('common.admin')}
              </Button>
            )}

            <div className="h-6 w-px bg-primary-foreground/20 mx-2" />
            
            <LanguageSwitcher className="text-primary-foreground hover:bg-primary-foreground/10" />
            
            <span className="text-sm text-primary-foreground/80">
              {t('header.hello')}, {userName}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-foreground/20 bg-primary">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "justify-start gap-2 w-full",
                    isActive(item.path) 
                      ? "bg-primary-foreground/20" 
                      : "hover:bg-primary-foreground/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
              
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2 w-full hover:bg-primary-foreground/10"
                >
                  <Shield className="w-4 h-4" />
                  {t('header.adminPanel')}
                </Button>
              )}
              
              <div className="h-px bg-primary-foreground/20 my-2" />
              
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-primary-foreground/80">
                  {t('header.hello')}, {userName}
                </span>
                <LanguageSwitcher className="text-primary-foreground" />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="justify-start gap-2 w-full hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
