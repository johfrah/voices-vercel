"use client";

import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { ShieldCheck } from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

  // Supabase client – null wanneer env vars ontbreken (bv. productie zonder config)
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          if (error.name === 'AbortError') {
            console.warn('[Voices] Auth request aborted, likely due to rapid navigation or component unmount.');
            return;
          }
          // 🛡️ CHRIS-PROTOCOL: Geen error noise voor ontbrekende sessies (normaal voor gasten)
          if (error.message?.includes('Auth session missing')) {
            setUser(null);
            setIsLoading(false);
            return;
          }
          console.error('[Voices] Auth error:', error);
          setUser(null);
          setIsLoading(false);
          return;
        }
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('email', user.email)
            .single();
          setUser({ ...user, role: userData?.role } as any);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('[Voices] Auth request aborted (caught).');
        } else {
          console.error('[Voices] Unexpected auth error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
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
