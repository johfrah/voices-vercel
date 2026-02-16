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
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  // Supabase client – null wanneer env vars ontbreken (bv. productie zonder config)
  const supabase = createClient();

  useEffect(() => {
    mountedRef.current = true;
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const safeSetUser = (u: User | null) => {
      if (mountedRef.current) setUser(u);
    };
    const safeSetLoading = (v: boolean) => {
      if (mountedRef.current) setIsLoading(v);
    };

    const getUser = async () => {
      try {
        // Sherlock: We voegen een kleine delay toe om race conditions met onAuthStateChange te voorkomen
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!mountedRef.current) return;

        console.log('[Voices] Fetching current user session...')
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (!mountedRef.current) return;
        if (error) {
          if (isAbortError(error)) {
            console.warn('[Voices] Auth check aborted (harmless).');
            return;
          }
          if (error.message?.includes('Auth session missing')) {
            safeSetUser(null);
            safeSetLoading(false);
            return;
          }
          console.error('[Voices] Auth error:', error);
          safeSetUser(null);
          safeSetLoading(false);
          return;
        }
        if (authUser) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('email', authUser.email)
              .single();
            if (mountedRef.current) {
              safeSetUser({ ...authUser, role: userData?.role } as any);
            }
          } catch (dbErr) {
            if (isAbortError(dbErr)) return;
            if (mountedRef.current) safeSetUser(authUser);
          }
        } else {
          safeSetUser(null);
        }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mountedRef.current) {
        setUser(session?.user ?? null);
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
    if (supabase) await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { success: false, error: 'Supabase niet geconfigureerd' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { success: !error, error: error?.message };
  };

  const isAdmin = user?.email === 'johfrah@voices.be' || (user as any)?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isAdmin,
      isLoading,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
