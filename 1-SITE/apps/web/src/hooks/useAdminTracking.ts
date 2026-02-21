"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 *  USE ADMIN TRACKING
 * 
 * Legt admin-acties vast in de visitor_logs voor audit trails en intelligence.
 */
export function useAdminTracking() {
  const { user } = useAuth();

  const logAction = async (action: string, metadata: any = {}) => {
    if (!user) return;

    try {
      await fetch('/api/admin/marketing/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin_action',
          admin_id: user.id,
          admin_email: user.email,
          action,
          metadata,
          timestamp: new Date().toISOString(),
          path: window.location.pathname
        })
      });
    } catch (e) {
      console.error('Failed to log admin action', e);
    }
  };

  return { logAction };
}
