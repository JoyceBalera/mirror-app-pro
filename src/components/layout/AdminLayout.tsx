import { ReactNode, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ArrowLeft,
  FlaskConical,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/usuarios', label: 'Usuários', icon: Users },
    { path: '/admin/ambiente-teste', label: 'Ambiente de Teste', icon: FlaskConical },
    { path: '/admin/validacao', label: 'Validação', icon: CheckSquare },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xl font-bold text-primary">
              Painel Admin
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path, item.exact) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="gap-2"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao App
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
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
          <div className="md:hidden border-t bg-card">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path, item.exact) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2 w-full"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
              
              <div className="h-px bg-border my-2" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate('/app');
                  setMobileMenuOpen(false);
                }}
                className="justify-start gap-2 w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao App
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="justify-start gap-2 w-full"
              >
                <LogOut className="w-4 h-4" />
                Sair
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

export default AdminLayout;
