"use client";

import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { ShieldCheck } from 'lucide-react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

/** Controleert of een error een AbortError is (auth-js gooit soms zonder reason). */
function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; message?: string };
  return e.name === 'AbortError' || (e.message ?? '').toLowerCase().includes('aborted');
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isGhostMode: boolean;
  adminUser: User | null;
  impersonate: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  stopImpersonation: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  // Supabase client  null wanneer env vars ontbreken (bv. productie zonder config)
  const supabase = createClient();

  useEffect(() => {
    mountedRef.current = true;
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check for ghost mode in session storage on mount
    const savedAdmin = sessionStorage.getItem('voices_ghost_admin');
    if (savedAdmin) {
      try {
        setAdminUser(JSON.parse(savedAdmin));
        setIsGhostMode(true);
      } catch (e) {
        console.error('[GhostMode] Failed to restore admin session', e);
      }
    }

    const safeSetUser = (u: User | null) => {
      if (mountedRef.current) setUser(u);
    };
    const safeSetLoading = (v: boolean) => {
      if (mountedRef.current) setIsLoading(v);
    };

    const fetchUserProfile = async (authUser: User) => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('role, preferences')
          .eq('email', authUser.email)
          .single();
        
        if (mountedRef.current) {
          const preferences = userData?.preferences as any;
          
          if (preferences?.preferred_language) {
            document.cookie = `voices_lang=${preferences.preferred_language}; path=/; max-age=31536000; SameSite=Lax`;
          }

          safeSetUser({ 
            ...authUser, 
            role: userData?.role,
            preferences: preferences 
          } as any);
        }
      } catch (dbErr) {
        if (isAbortError(dbErr)) return;
        if (mountedRef.current) safeSetUser(authUser);
      }
    };

    const getUser = async () => {
      try {
        // Sherlock: We voegen een kleine delay toe om race conditions met onAuthStateChange te voorkomen
        await new Promise(resolve => setTimeout(resolve, 800)); 
        if (!mountedRef.current) return;

        console.log('[Voices] Fetching current user session...')
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Voices] Session error:', sessionError);
        }

        let authUser = null;
        const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();
        
        if (!userError && verifiedUser) {
          authUser = verifiedUser;
        } else if (session?.user) {
          authUser = session.user;
        }
        
        console.log('[Voices] Auth check result:', { 
          hasUser: !!authUser, 
          hasSession: !!session,
          email: authUser?.email 
        });

        if (!mountedRef.current) return;
        
        if (!authUser) {
          safeSetUser(null);
          safeSetLoading(false);
          return;
        }

        await fetchUserProfile(authUser);
      } catch (err) {
        if (isAbortError(err)) return;
        if (mountedRef.current) {
          console.error('[Voices] Unexpected auth error:', err);
          safeSetUser(null);
        }
      } finally {
        safeSetLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Voices] Auth state change:', event, { hasSession: !!session, email: session?.user?.email });
      if (mountedRef.current) {
        if (session?.user) {
          // CHRIS-PROTOCOL: Don't just set the user, fetch the profile too!
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    getUser();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    if (supabase) {
      sessionStorage.removeItem('voices_ghost_admin');
      await supabase.auth.signOut();
    }
  };

  const impersonate = async (targetUserId: string) => {
    if (!isAdmin || isGhostMode) return { success: false, error: 'Niet toegestaan' };
    
    try {
      // Sla huidige admin op
      sessionStorage.setItem('voices_ghost_admin', JSON.stringify(user));
      
      // Roep server-side impersonation API aan
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impersonation failed');
      
      // Forceer refresh van de auth state
      window.location.reload();
      return { success: true };
    } catch (err: any) {
      sessionStorage.removeItem('voices_ghost_admin');
      return { success: false, error: err.message };
    }
  };

  const stopImpersonation = async () => {
    if (!isGhostMode) return;
    
    try {
      sessionStorage.removeItem('voices_ghost_admin');
      // Roep server-side stop API aan (om cookies te clearen)
      await fetch('/api/admin/impersonate/stop', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('[GhostMode] Failed to stop', err);
      window.location.reload();
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { success: false, error: 'Supabase niet geconfigureerd' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    return { success: !error, error: error?.message };
  };

  const isAdmin = (user as any)?.role === 'admin' ||
                  (user as any)?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isAdmin,
      isLoading,
      isGhostMode,
      adminUser,
      impersonate,
      stopImpersonation,
      logout,
      resetPassword
    }}>
      <div className="hidden"><ShieldCheck strokeWidth={1.5} /></div>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  //  NUCLEAR SAFETY: Als de context ontbreekt, retourneren we een veilige fallback.
  // Dit voorkomt witte schermen tijdens complexe hydratatie-cycli in Next.js.
  if (context === undefined) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,
      isGhostMode: false,
      adminUser: null,
      impersonate: async () => ({ success: false, error: 'Auth not initialized' }),
      stopImpersonation: async () => {},
      logout: async () => {},
      resetPassword: async () => ({ success: false, error: 'Auth not initialized' })
    };
  }
  
  return context;
};
