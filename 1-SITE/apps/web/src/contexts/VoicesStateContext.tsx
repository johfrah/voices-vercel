"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { Actor } from '@/types';

interface VoicesState {
  company_name: string;
  opening_hours: string;
  location: string;
  current_sector: string | null;
  current_journey: 'telephony' | 'video' | 'commercial' | 'general';
  intent: {
    archetype: string | null;
    asset_focus: 'Audio-First' | 'Script-First' | 'Hybrid';
    decision_power: 'End-User' | 'Proxy-Buyer' | null;
  };
  selected_actors: Actor[];
  reviewStats: {
    averageRating: number;
    totalCount: number;
  } | null;
  campaignMessage: string | null;
}

interface VoicesStateContextType {
  state: VoicesState;
  reviewStats: VoicesState['reviewStats']; // Direct access for convenience
  campaignMessage: string | null;
  updateCompanyName: (name: string) => void;
  updateSector: (sector: string | null) => void;
  updateJourney: (journey: VoicesState['current_journey']) => void;
  updateIntent: (intent: Partial<VoicesState['intent']>) => void;
  getPlaceholderValue: (key: string) => string;
  toggleActorSelection: (actor: Actor) => void;
  clearSelectedActors: () => void;
}

const initialState: VoicesState = {
  company_name: '',
  opening_hours: '09:00 - 17:00',
  location: '',
  current_sector: null,
  current_journey: 'general',
  intent: {
    archetype: null,
    asset_focus: 'Hybrid',
    decision_power: null,
  },
  selected_actors: [],
  reviewStats: null,
  campaignMessage: null,
};

const VoicesStateContext = createContext<VoicesStateContextType | undefined>(undefined);

export const VoicesStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VoicesState>(initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('voices_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ 
          ...prev, 
          ...parsed,
          // Ensure selected_actors is always an array
          selected_actors: Array.isArray(parsed.selected_actors) ? parsed.selected_actors : []
        }));
      } catch (e) {
        console.error('Failed to parse saved voices state', e);
      }
    }

    //  NUCLEAR SYNC: Fetch global review stats on mount
    const fetchStats = async () => {
      try {
        //  CHRIS-PROTOCOL: Skip stats fetch on localhost if it causes 500/MIME errors
        if (window.location.hostname === 'localhost') return;

        //  CHRIS-PROTOCOL: Use a public endpoint for review stats instead of admin-only actors API
        const res = await fetch('/api/home/config');
        if (!res.ok) {
          console.log('[VoicesState] Config fetch skipped (unauthorized or error)');
          return;
        }
        
        const data = await res.json();
        if (data.campaignMessage) {
          setState(prev => ({ ...prev, campaignMessage: data.campaignMessage }));
        }
        
        //  CHRIS-PROTOCOL: Nuclear Review Stats Sync
        if (data.reviewStats) {
          setState(prev => ({ 
            ...prev, 
            reviewStats: {
              averageRating: data.reviewStats.averageRating || 4.9,
              totalCount: data.reviewStats.totalCount || 0
            }
          }));
        }
      } catch (e) {
        console.warn('[VoicesState] Failed to fetch config', e);
      }
    };
    fetchStats();
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (state !== initialState) {
      const { campaignMessage, ...stateToSave } = state; // Don't save campaign message to storage
      localStorage.setItem('voices_state', JSON.stringify(stateToSave));
    }
  }, [state]);

  const updateCompanyName = (company_name: string) => setState(prev => ({ ...prev, company_name }));
  
  const updateSector = (current_sector: string | null) => setState(prev => ({ ...prev, current_sector }));
  
  const updateJourney = (current_journey: VoicesState['current_journey']) => setState(prev => ({ ...prev, current_journey }));

  const updateIntent = (intent: Partial<VoicesState['intent']>) => 
    setState(prev => ({ ...prev, intent: { ...prev.intent, ...intent } }));

  const toggleActorSelection = (actor: Actor) => {
    setState(prev => {
      const isSelected = prev.selected_actors.some(a => a.id === actor.id);
      if (isSelected) {
        return { ...prev, selected_actors: prev.selected_actors.filter(a => a.id !== actor.id) };
      } else {
        // We store the full actor object to ensure it's available in the favorites list
        return { ...prev, selected_actors: [...prev.selected_actors, actor] };
      }
    });
  };

  const clearSelectedActors = () => setState(prev => ({ ...prev, selected_actors: [] }));

  const getPlaceholderValue = (key: string): string => {
    switch (key) {
      case 'company_name': return state.company_name || 'Uw Bedrijf';
      case 'opening_hours': return state.opening_hours;
      case 'location': return state.location || 'Uw Stad';
      default: return `{{${key}}}`;
    }
  };

  return (
    <VoicesStateContext.Provider value={{ 
      state, 
      reviewStats: state.reviewStats,
      campaignMessage: state.campaignMessage,
      updateCompanyName, 
      updateSector, 
      updateJourney,
      updateIntent,
      getPlaceholderValue,
      toggleActorSelection,
      clearSelectedActors
    }}>
      {children}
    </VoicesStateContext.Provider>
  );
};

export const useVoicesState = () => {
  const context = useContext(VoicesStateContext);
  if (context === undefined) {
    throw new Error('useVoicesState must be used within a VoicesStateProvider');
  }
  return context;
};
