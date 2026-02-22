"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { createClient } from '@/utils/supabase/client';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  metadata: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    // CHRIS-PROTOCOL: Alleen klanten en admins laden hun eigen notificaties via dit systeem.
    if (!isAuthenticated || !supabase) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      // We halen de interne user.id op basis van de auth.user.email
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (userData) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setNotifications(data.map(n => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            metadata: n.metadata,
            isRead: n.is_read,
            createdAt: n.created_at
          })));
        }
      }
    } catch (error) {
      console.error('[Voices] Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, supabase, user?.email]);

  useEffect(() => {
    fetchNotifications();
    
    // Real-time updates voor klanten
    if (isAuthenticated && !isAdmin && supabase) {
      const channel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user?.id}` // Dit werkt alleen als we de UUID gebruiken, maar onze tabel gebruikt serial ID.
          // Voor nu doen we een simpele refresh bij elke insert in de tabel voor dit kanaal
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, isAdmin, supabase, user?.id, fetchNotifications]);

  const markAsRead = async (id: number) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (!error) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('[Voices] Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!supabase || notifications.length === 0) return;
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (userData) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userData.id)
          .eq('is_read', false);
        
        if (!error) {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
      }
    } catch (error) {
      console.error('[Voices] Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      refresh: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
