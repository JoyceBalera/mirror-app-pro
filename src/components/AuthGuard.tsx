import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { role, loading: roleLoading, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        navigate('/auth');
        return;
      }
      
      setIsAuthenticated(true);
      setChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuthenticated(false);
        navigate('/auth');
      } else {
        setIsAuthenticated(true);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Check role requirement after auth is confirmed
    if (!checking && !roleLoading && isAuthenticated) {
      if (requiredRole === 'admin' && !isAdmin) {
        navigate('/app');
      }
    }
  }, [checking, roleLoading, isAuthenticated, requiredRole, isAdmin, navigate]);

  if (checking || roleLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
