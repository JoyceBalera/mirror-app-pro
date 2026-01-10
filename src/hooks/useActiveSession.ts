import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ActiveSessionType = 'big_five' | 'desenho_humano' | null;

interface ActiveSessionInfo {
  hasActiveSession: boolean;
  activeSessionType: ActiveSessionType;
  sessionId: string | null;
  resumeUrl: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useActiveSession = (): ActiveSessionInfo => {
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionType, setActiveSessionType] = useState<ActiveSessionType>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasActiveSession(false);
        setActiveSessionType(null);
        setSessionId(null);
        setLoading(false);
        return;
      }

      // Check for Big Five in_progress session
      const { data: bigFiveSession } = await supabase
        .from('test_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (bigFiveSession) {
        setHasActiveSession(true);
        setActiveSessionType('big_five');
        setSessionId(bigFiveSession.id);
        setLoading(false);
        return;
      }

      // Check for Human Design in_progress session
      const { data: hdSession } = await supabase
        .from('human_design_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (hdSession) {
        setHasActiveSession(true);
        setActiveSessionType('desenho_humano');
        setSessionId(hdSession.id);
        setLoading(false);
        return;
      }

      // No active session
      setHasActiveSession(false);
      setActiveSessionType(null);
      setSessionId(null);
    } catch (error) {
      console.error('Error checking active session:', error);
      setHasActiveSession(false);
      setActiveSessionType(null);
      setSessionId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchActiveSession();
    });

    return () => subscription.unsubscribe();
  }, [fetchActiveSession]);

  const getResumeUrl = (): string | null => {
    if (!hasActiveSession || !activeSessionType) return null;
    
    switch (activeSessionType) {
      case 'big_five':
        return '/app/big-five';
      case 'desenho_humano':
        return '/app/desenho-humano';
      default:
        return null;
    }
  };

  return {
    hasActiveSession,
    activeSessionType,
    sessionId,
    resumeUrl: getResumeUrl(),
    loading,
    refetch: fetchActiveSession,
  };
};
